///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
        }
        Memory.prototype.init = function () {
            this.memoryStorage = new Array(_MemorySize);
            this.memoryStorage.forEach(function (i) {
                i = "00";
            });
            console.log(this.memoryStorage);
        };
        Memory.prototype.readMemory = function (PC) {
            console.log("read memory called with PC : " + PC);
            return this.memoryStorage[PC];
        };
        ;
        Memory.prototype.writeMemory = function (program) {
            for (var i = 0; i < program.length; i++) {
                //this.memoryStorage[i] = program[i];
                this.writeMemoryByte(i, program[i]);
            }
            console.log("Current memory: " + this.memoryStorage);
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
