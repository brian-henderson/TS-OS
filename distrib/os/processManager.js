///<reference path="../globals.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager() {
        }
        ProcessManager.prototype.createProcess = function (program) {
            if (_MemoryManager.checkMemorySpace(program.length)) {
                var pcb = new TSOS.ProcessControlBlock(_PID);
                _MemoryManager.loadProgram(program.length);
                _StdOut.putText("Program loaded to memory with PID " + pcb.getPID);
                _PID++;
            }
            else {
                _StdOut.putText("Program not loaded to memory, too big");
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
