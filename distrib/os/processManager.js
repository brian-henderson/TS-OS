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
        function ProcessManager(waitQueue, readyQueue) {
            if (waitQueue === void 0) { waitQueue = new TSOS.Queue(); }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.waitQueue = waitQueue;
            this.readyQueue = readyQueue;
        }
        ;
        ProcessManager.prototype.createProcess = function (program) {
            if (_MemoryManager.checkMemorySpace(program.length)) {
                // update to new Process ID 
                _PID++;
                // create new process control block
                var pcb = new TSOS.ProcessControlBlock(_PID);
                // write the program to the memory, given user input already split into array
                _MemoryManager.writeProgramToMemory(program);
                // add this process to the list of upcoming processes
                this.waitQueue.enqueue(pcb);
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
        ProcessManager.prototype.runProcess = function (pcb) {
            console.log("Run Process with PCB PID: " + pcb.pid);
            this.currPCB = pcb;
            this.currPCB.state = "Running";
            this.readyQueue.enqueue(this.currPCB);
            _Control.updateCpuDisplay();
            _Control.updatePcbDisplay(pcb);
            ;
        };
        ProcessManager.prototype.readInstruction = function (PC) {
            return _Memory.readMemory(PC);
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            if (!this.readyQueue.isEmpty()) {
                _CPU.isExecuting = false;
                pcb.state = "Terminated";
                this.readyQueue.dequeue();
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
