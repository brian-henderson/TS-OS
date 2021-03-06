///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {


    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public backspaceImageData = [], 
                    public lastXPosition = [0], 
                    public backspaceCount = 0,
                    public commandHistory = [],
                    public cmdIndex = 0,
                    public scrollingImageData = [],
                    public scrollingImageDataIndex = 0 ) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
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
                    this.cmdIndex = this.commandHistory.length-1;
                    // ... and reset our buffer.
                    this.buffer = "";

                // Backspace
                } else if (chr == String.fromCharCode(8)) {
                    // as long as the backspace count is over 0, begin backspacing procedure
                    if (this.backspaceCount != 0) {
                        // reverting to the last imageData obtained before last char/text was written
                        _DrawingContext.putImageData(this.backspaceImageData.pop(),0,0);
                        // going back an x coordinate
                        this.currentXPosition = this.lastXPosition.pop();
                        // update the backspace count 
                        this.backspaceCount -= 1;
                    }
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);

                // Tab - cmd completion
                } else if (chr == String.fromCharCode(9)) {
                    var highestMatchIndex = 0;
                    var charCount = 0;
                    
                    for (var i=0; i < _commandList.length; i++) {
                        var tempCharCount = 0;
                        for (var j=0; j < this.buffer.length; j++) {
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
                            this.backspaceImageData.push(_DrawingContext.getImageData(0,0, _Canvas.width,_Canvas.height));
                            this.putText(toBePrinted.charAt(i));
                            this.buffer += toBePrinted.charAt(i);
                        }
                    }

                // up/down
                } else if (chr == String.fromCharCode(38) || chr == String.fromCharCode(40)) {
                    var output;
                    // first check UP
                    if (chr == String.fromCharCode(38)) {
                        if (this.cmdIndex != this.commandHistory.length-1) {
                            // if the cmdIndex -1 is less than zero
                            if (this.cmdIndex-1 < 0) {
                                output = this.commandHistory[this.cmdIndex];
                                this.cmdIndex = 0;
                            // all other possibilites will provide no errors
                            } else {
                                output = this.commandHistory[this.cmdIndex];
                                this.cmdIndex--;
                            }
                        } else {
                            output = this.commandHistory[this.cmdIndex];
                            this.cmdIndex--;
                        }
                    // now check DOWN
                    } else if (chr == String.fromCharCode(40)) {
                        if (this.commandHistory.length-1 != this.cmdIndex) {
                            this.cmdIndex++;
                            output = this.commandHistory[this.cmdIndex];
                        }
                        else if (this.cmdIndex == this.commandHistory.length-1) {
                            output = this.commandHistory[this.commandHistory.length-1];
                            this.cmdIndex--;
                        }
                    }

                    // if the buffer is not blank, delete the characters on the canvas from the buffer
                    if (this.buffer.length > 0) {
                        for (var i=0; i < this.buffer.length; i++) {
                            _DrawingContext.putImageData(this.backspaceImageData.pop(),0,0);
                            this.currentXPosition = this.lastXPosition.pop();
                            this.backspaceCount -= 1;
                        }
                        this.buffer = "";
                    }

                    // print out the output and update the buffer and backspace count
                    for (var i=0; i < output.length; i++) {
                        // ... get the Image Data from the canvas so it can be referenced for backspacing purposes
                        this.backspaceImageData.push(_DrawingContext.getImageData(0,0, _Canvas.width,_Canvas.height));
                        // ... draw it on the screen...
                        this.putText(output.charAt(i));
                        // ... and add it to our buffer.
                        this.buffer += output.charAt(i);
                        // ... update backspace count 
                        this.backspaceCount++;
                    }


                } else {
                    // This is a "normal" character, so ...
                    // ... get the Image Data from the canvas so it can be referenced for backspacing purposes
                    this.backspaceImageData.push(_DrawingContext.getImageData(0,0, _Canvas.width,_Canvas.height));
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                    // ... update backspace count 
                    this.backspaceCount++;
                }
                // TODO: Write a case for Ctrl-C.
            }
    }

        public putProgramOutputText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.

            
            if (text !== "") {
                if (this.currentXPosition >= 450) {
                    this.advanceLine();

                }
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                this.lastXPosition.push(this.currentXPosition);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
                
            }
         }

         public putResponseText(text): void {
            let prompt = "> ";
            text = prompt + text;
            this.putText(text);
         }

         public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.

            
            if (text !== "") {
               //text = "  > " + text;
                if (this.currentXPosition >= 450) {
                    this.advanceLine();

                }
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                this.lastXPosition.push(this.currentXPosition);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
                
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            
            // tracks the area printed to determine values such as next Y postion and compare against canvas height
            var printedArea = _DefaultFontSize + 
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin
            
            // if the current Y and printed area are greater than canvas height, begin scrolling down
            if ((this.currentYPosition + printedArea) > _Canvas.height) {
                // get the current canvas image data and then clear screen
                this.scrollingImageData.push(_DrawingContext.getImageData(0,0,_Canvas.width,_Canvas.height))
                this.clearScreen();
                // usie the image data to update the canvas with the accounted printed area and upate index
                _DrawingContext.putImageData(this.scrollingImageData[this.scrollingImageDataIndex],0,-printedArea);
                this.scrollingImageDataIndex += 1;
            }
            else {
                this.currentYPosition += printedArea;
            }
        }
        
    }
 }
