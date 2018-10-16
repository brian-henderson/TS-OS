///<reference path="../globals.ts" />
/* ------------
     MemoryAccessor.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        //constructor(){};
        MemoryAccessor.prototype.readMemory = function (PC) {
            return _Memory.memoryStorage[PC];
        };
        ;
        MemoryAccessor.prototype.writeMemory = function (program) {
            for (var i = 0; i < program.length; i++) {
                _Memory.memoryStorage[i] = program[i];
                console.log(_Memory.memoryStorage[i]);
            }
            _Control.updateMemoryDisplay();
        };
        ;
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
