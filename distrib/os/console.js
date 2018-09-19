///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, backspaceImageData, lastXPosition, backspaceCount, commandHistory, cmdIndex, scrollingImageData, scrollingImageDataIndex) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (backspaceImageData === void 0) { backspaceImageData = []; }
            if (lastXPosition === void 0) { lastXPosition = [0]; }
            if (backspaceCount === void 0) { backspaceCount = 0; }
            if (commandHistory === void 0) { commandHistory = []; }
            if (cmdIndex === void 0) { cmdIndex = 0; }
            if (scrollingImageData === void 0) { scrollingImageData = []; }
            if (scrollingImageDataIndex === void 0) { scrollingImageDataIndex = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.backspaceImageData = backspaceImageData;
            this.lastXPosition = lastXPosition;
            this.backspaceCount = backspaceCount;
            this.commandHistory = commandHistory;
            this.cmdIndex = cmdIndex;
            this.scrollingImageData = scrollingImageData;
            this.scrollingImageDataIndex = scrollingImageDataIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        /*
                public enableBSOD(): void {
                    this.clearScreen();
                    document.getElementById("display").style.background = 'blue';
                    _OsShell.promptStr = '';
                    this.putText("")
                }
        */
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // adding local cache of command history
                    this.commandHistory.push(this.buffer);
                    // updating the cmd index here
                    this.cmdIndex = this.commandHistory.length - 1;
                    // ... and reset our buffer.
                    this.buffer = "";
                    // Backspace
                }
                else if (chr == String.fromCharCode(8)) {
                    console.log("Key pressed - BACKSPACE");
                    if (this.backspaceCount != 0) {
                        _DrawingContext.putImageData(this.backspaceImageData.pop(), 0, 0);
                        this.currentXPosition = this.lastXPosition.pop();
                        this.backspaceCount -= 1;
                    }
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    // Tab - cmd completion
                }
                else if (chr == String.fromCharCode(9)) {
                    console.log("Key pressed - TAB");
                    var highestMatchIndex = 0;
                    var charCount = 0;
                    for (var i = 0; i < _commandList.length; i++) {
                        var tempCharCount = 0;
                        for (var j = 0; j < this.buffer.length; j++) {
                            if (this.buffer.charAt(j) == _commandList[i].charAt(j))
                                tempCharCount++;
                            else
                                break;
                        }
                        if (tempCharCount > charCount) {
                            highestMatchIndex = i;
                            charCount = tempCharCount;
                        }
                    }
                    if (charCount != 0) {
                        var toBePrinted = _commandList[highestMatchIndex].substring(charCount);
                        for (var i = 0; i < toBePrinted.length; i++) {
                            this.backspaceImageData.push(_DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height));
                            this.putText(toBePrinted.charAt(i));
                            this.buffer += toBePrinted.charAt(i);
                        }
                    }
                    // up/down
                }
                else if (chr == String.fromCharCode(38) || chr == String.fromCharCode(40)) {
                    var output;
                    if (chr == String.fromCharCode(38)) {
                        if (this.cmdIndex != this.commandHistory.length - 1) {
                            if (this.cmdIndex - 1 < 0) {
                                output = this.commandHistory[this.cmdIndex];
                                this.cmdIndex = 0;
                            }
                            else {
                                output = this.commandHistory[this.cmdIndex];
                                this.cmdIndex--;
                            }
                        }
                        else {
                            output = this.commandHistory[this.cmdIndex];
                            this.cmdIndex--;
                        }
                    }
                    else if (chr == String.fromCharCode(40)) {
                        if (this.commandHistory.length - 1 != this.cmdIndex) {
                            this.cmdIndex++;
                            output = this.commandHistory[this.cmdIndex];
                        }
                        else if (this.cmdIndex == this.commandHistory.length - 1) {
                            output = this.commandHistory[this.commandHistory.length - 1];
                            this.cmdIndex--;
                        }
                    }
                    console.log(this.commandHistory);
                    console.log("out - " + output);
                    console.log("cmdIndex - " + this.cmdIndex);
                    if (this.buffer.length > 0) {
                        for (var i = 0; i < this.buffer.length; i++) {
                            _DrawingContext.putImageData(this.backspaceImageData.pop(), 0, 0);
                            this.currentXPosition = this.lastXPosition.pop();
                            this.backspaceCount -= 1;
                        }
                        this.buffer = "";
                    }
                    for (var i = 0; i < output.length; i++) {
                        // ... get the Image Data from the canvas so it can be referenced for backspacing purposes
                        this.backspaceImageData.push(_DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height));
                        // ... draw it on the screen...
                        this.putText(output.charAt(i));
                        // ... and add it to our buffer.
                        this.buffer += output.charAt(i);
                        // ... update backspace count 
                        this.backspaceCount++;
                    }
                }
                else {
                    console.log("Key pressed - Normal char");
                    // This is a "normal" character, so ...
                    // ... get the Image Data from the canvas so it can be referenced for backspacing purposes
                    this.backspaceImageData.push(_DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height));
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                    // ... update backspace count 
                    this.backspaceCount++;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                this.lastXPosition.push(this.currentXPosition);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            var printedArea = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if ((this.currentYPosition + printedArea) > _Canvas.height) {
                this.scrollingImageData.push(_DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height));
                this.clearScreen();
                _DrawingContext.putImageData(this.scrollingImageData[this.scrollingImageDataIndex], 0, -printedArea);
                this.scrollingImageDataIndex += 1;
            }
            else {
                this.currentYPosition += printedArea;
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
