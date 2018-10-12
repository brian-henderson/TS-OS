///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pidArr) {
            if (pidArr === void 0) { pidArr = []; }
            this.pidArr = pidArr;
        }
        ;
        MemoryManager.prototype.checkMemorySpace = function (programLength) {
            return programLength <= _Memory.memoryStorage.length;
        };
        MemoryManager.prototype.createProcess = function (program) {
            if (_MemoryManager.checkMemorySpace(program.length)) {
                // update to new Process ID 
                _PID++;
                // new process control block
                var pcb = new TSOS.ProcessControlBlock(_PID);
                // write the program to the memory, given user input already split into array
                _MemoryManager.writeProgramToMemory(program);
                // add this process to the list of upcoming processes
                _ProcessManager.processList.push(pcb);
                // get the instruction registry and set it 
                pcb.instructionReg = _Memory.readMemory(pcb.programCounter);
                // set the location to memory (no hard drive yet so this is static but getting ready for next iP)
                pcb.location = "Memory";
                // output status to console
                _StdOut.putText("Program loaded to memory with PID " + _PID);
                // add pcb to the pcb display list
                _Control.addToPcbDisplay(pcb);
            }
            else {
                _StdOut.putText("Program not loaded to memory, too big");
            }
        };
        MemoryManager.prototype.writeProgramToMemory = function (program) {
            _Memory.writeMemory(program);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
