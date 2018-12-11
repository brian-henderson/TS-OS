///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(waitQueue, readyQueue, processArray, runningAll) {
            if (waitQueue === void 0) { waitQueue = new TSOS.Queue(); }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            if (processArray === void 0) { processArray = new Array(); }
            if (runningAll === void 0) { runningAll = false; }
            this.waitQueue = waitQueue;
            this.readyQueue = readyQueue;
            this.processArray = processArray;
            this.runningAll = runningAll;
        }
        ;
        ProcessManager.prototype.createProcess = function (program, priority) {
            var partitionID = _MemoryManager.getAvailablePartition();
            if (partitionID != -1) {
                // update to new Process ID 
                _PID++;
                // create new process control block
                var pcb = new TSOS.ProcessControlBlock(_PID);
                // add pcb to process list
                this.processArray.push(pcb);
                // assign the available partiton to the pcb and process
                pcb.partitionIndex = partitionID;
                // assign the process a priority
                pcb.priority = priority != null ? Number(priority) : 64;
                // write the program to the memory, given user input already split into array
                _MemoryManager.writeProgramToMemory(pcb.partitionIndex, program);
                // add this process to the list of upcoming processes
                this.waitQueue.enqueue(pcb);
                // get the instruction registry and set it 
                pcb.instructionReg = _Memory.readMemory(pcb.partitionIndex, pcb.programCounter);
                // set the location to memory (no hard drive yet so this is static but getting ready for next iP)
                pcb.location = "Memory: P: " + (pcb.partitionIndex).toString();
                // output status to console
                _StdOut.putResponseText("Program loaded to memory with PID " + _PID);
                // add pcb to the pcb display list
                _Control.addToPcbDisplay(pcb);
            }
            else {
                _StdOut.putResponseText("Program not loaded to memory, no available partitions");
            }
        };
        ProcessManager.prototype.runProcess = function (pcb) {
            if (!this.runningAll) {
                pcb.state = "Running";
                this.readyQueue.enqueue(pcb);
            }
            else {
                pcb.state = "Ready";
                this.readyQueue.enqueue(pcb);
            }
            TSOS.Utils.setStatus("Enjoying the delicious flavors");
            _Control.updateCpuDisplay();
            _Control.updatePcbDisplay(pcb);
        };
        ProcessManager.prototype.readInstruction = function (partition, PC) {
            return _Memory.readMemory(partition, PC);
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            _CPU.isExecuting = false;
            this.removeProcessFromReadyQueue(pcb.pid);
            pcb.state = "Terminated";
            pcb.location = "Black Hole";
            _Memory.clearMemoryPartition(pcb.partitionIndex);
            _CPU.resetCpu();
            _Control.removePcbDisplay(pcb);
            this.printProcessTime(pcb);
            _Console.advanceLine();
            _OsShell.putPrompt();
            TSOS.Utils.setStatus("Still a little hungry...");
        };
        ProcessManager.prototype.runAllProccesses = function () {
            this.runningAll = true;
            while (this.waitQueue.getSize() > 0) {
                this.runProcess(this.waitQueue.dequeue());
            }
        };
        ProcessManager.prototype.getPCBfromPid = function (pid) {
            var pcb;
            for (var i = 0; i < this.processArray.length; i++) {
                if (this.processArray[i].pid == pid) {
                    pcb = this.processArray[i];
                    break;
                }
            }
            return pcb;
        };
        ProcessManager.prototype.removeProcessFromReadyQueue = function (pid) {
            var tempQueue = new TSOS.Queue();
            while (this.readyQueue.getSize() > 0) {
                var queuePCB = this.readyQueue.dequeue();
                if (queuePCB.pid != pid) {
                    tempQueue.enqueue(queuePCB);
                }
            }
            while (tempQueue.getSize() > 0) {
                this.readyQueue.enqueue(tempQueue.dequeue());
            }
        };
        ProcessManager.prototype.killProcessByPid = function (pid) {
            var pcb = this.getPCBfromPid(pid);
            this.terminateProcess(pcb);
        };
        ProcessManager.prototype.updateWaitTime = function () {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                this.readyQueue.q[i].waitTime++;
            }
        };
        ProcessManager.prototype.updateTurnAroundTime = function () {
            for (var i = 0; i < this.readyQueue.getSize(); i++) {
                this.readyQueue.q[i].turnAroundTime++;
            }
            this.currPCB.turnAroundTime++;
        };
        ProcessManager.prototype.printProcessTime = function (pcb) {
            _StdOut.advanceLine();
            _StdOut.advanceLine();
            _StdOut.putResponseText("PID: " + pcb.pid);
            _StdOut.advanceLine();
            _StdOut.putResponseText("Wait Time: " + pcb.waitTime);
            _StdOut.advanceLine();
            _StdOut.putResponseText("Turnaround Time: " + pcb.turnAroundTime);
            _StdOut.advanceLine();
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
