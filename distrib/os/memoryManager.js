///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pidArr) {
            if (pidArr === void 0) { pidArr = []; }
            this.pidArr = pidArr;
        }
        ;
        MemoryManager.prototype.loadProgram = function (program) {
            for (var i = 0; i < program.length; i++) {
                _Memory.memoryStorage[i] = program[i];
                console.log(_Memory.memoryStorage[i]);
            }
        };
        MemoryManager.prototype.checkMemorySpace = function (programLength) {
            return programLength <= _Memory.memoryStorage.length;
        };
        MemoryManager.prototype.createProcess = function (program) {
            if (_MemoryManager.checkMemorySpace(program.length)) {
                var pcb = new TSOS.ProcessControlBlock(_PID);
                _MemoryManager.loadProgram(program);
                _StdOut.putText("Program loaded to memory with PID " + pcb.getPID());
                _PID++;
            }
            else {
                _StdOut.putText("Program not loaded to memory, too big");
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
