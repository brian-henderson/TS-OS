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
            return this.memoryStorage[PC];
        };
        ;
        Memory.prototype.writeMemory = function (program) {
            for (var i = 0; i < program.length; i++) {
                this.memoryStorage[i] = program[i];
                console.log(this.memoryStorage[i]);
            }
            _Control.updateMemoryDisplay();
        };
        ;
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
