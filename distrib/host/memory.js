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
            this.memoryStorage = new Array(256);
            this.memoryStorage.forEach(function (i) {
                i = "00";
            });
        };
        Memory.prototype.createProcess = function (program) {
            if (_MemoryManager.checkMemorySpace(program.length)) {
                var pcb = new TSOS.ProcessControlBlock(_PID);
                _MemoryManager.loadProgram(program);
                _StdOut.putText("Program loaded to memory with PID " + pcb.getPID);
                _PID++;
            }
            else {
                _StdOut.putText("Program not loaded to memory, too big");
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
