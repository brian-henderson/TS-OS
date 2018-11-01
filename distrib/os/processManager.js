///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
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
            var partitionID = _MemoryManager.getAvailablePartition();
            if (partitionID != -1) {
                // update to new Process ID 
                _PID++;
                // create new process control block
                var pcb = new TSOS.ProcessControlBlock(_PID);
                // assign the available partiton to the pcb and process
                pcb.partitionIndex = partitionID;
                // write the program to the memory, given user input already split into array
                _MemoryManager.writeProgramToMemory(pcb.partitionIndex, program);
                // add this process to the list of upcoming processes
                this.waitQueue.enqueue(pcb);
                // get the instruction registry and set it 
                pcb.instructionReg = _Memory.readMemory(pcb.partitionIndex, pcb.programCounter);
                // set the location to memory (no hard drive yet so this is static but getting ready for next iP)
                pcb.location = "Memory: Pt: " + (pcb.partitionIndex).toString();
                // output status to console
                _StdOut.putText("Program loaded to memory with PID " + _PID);
                // add pcb to the pcb display list
                _Control.addToPcbDisplay(pcb);
            }
            else {
                _StdOut.putText("Program not loaded to memory, no available partitions");
            }
        };
        ProcessManager.prototype.runProcess = function (pcb) {
            console.log("Run Process with PCB PID: " + pcb.pid);
            this.currPCB = pcb;
            this.currPCB.state = "Running";
            this.readyQueue.enqueue(this.currPCB);
            TSOS.Utils.setStatus("Enjoying the delicious flavors");
            _Control.updateCpuDisplay();
            _Control.updatePcbDisplay(pcb);
            ;
        };
        ProcessManager.prototype.readInstruction = function (partition, PC) {
            return _Memory.readMemory(partition, PC);
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            if (!this.readyQueue.isEmpty()) {
                this.readyQueue.dequeue();
                pcb.state = "Terminated";
                _Control.terminatePcbDisplay(pcb);
                _CPU.isExecuting = false;
                _CPU.resetCpu();
                _Memory.clearMemoryPartition(pcb.partitionIndex);
                TSOS.Utils.setStatus("Still a little hungry...");
                _Console.advanceLine();
                _OsShell.putPrompt();
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
