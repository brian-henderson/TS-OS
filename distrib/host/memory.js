///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memoryStorage = new Array(_MemorySize);
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.memoryStorage.length; i++) {
                this.memoryStorage[i] = "00";
            }
            console.log("Memory Initted");
            console.log(this.memoryStorage);
        };
        Memory.prototype.readMemory = function (PC) {
            return this.memoryStorage[PC];
        };
        ;
        Memory.prototype.writeMemory = function (program) {
            for (var i = 0; i < program.length; i++) {
                //this.memoryStorage[i] = program[i];
                this.writeMemoryByte(i, program[i]);
            }
            _Control.updateMemoryDisplay();
        };
        ;
        Memory.prototype.writeMemoryByte = function (loc, byteData) {
            this.memoryStorage[loc] = byteData;
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
