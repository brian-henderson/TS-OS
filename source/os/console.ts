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
                    public backspaceCount = 0 ) {
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
                    this.buffer
                    // ... and reset our buffer.
                    this.buffer = "";

                // Backspace
                } else if (chr == String.fromCharCode(8)) {
                    if (this.backspaceCount != 0) {
                        _DrawingContext.putImageData(this.backspaceImageData.pop(),0,0);
                        this.currentXPosition = this.lastXPosition.pop();
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
                            this.backspaceImageData.push(_DrawingContext.getImageData(0,0,500,500));
                            this.putText(toBePrinted.charAt(i));
                            this.buffer += toBePrinted.charAt(i);
                        }
                    }
                    
                
                    
                } else {
                    // This is a "normal" character, so ...
                    // ... get the Image Data from the canvas so it can be referenced for backspacing purposes
                    this.backspaceImageData.push(_DrawingContext.getImageData(0,0,500,500));
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
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
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
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (iProject 1)
        }
    }
 }
