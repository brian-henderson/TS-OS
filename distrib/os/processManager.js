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
        function ProcessManager(
        //public processList: ProcessControlBlock[] = [],
        waitQueue, readyQueue) {
            if (waitQueue === void 0) { waitQueue = new TSOS.Queue(); }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.waitQueue = waitQueue;
            this.readyQueue = readyQueue;
        }
        ;
        ProcessManager.prototype.runProcess = function (pcb) {
            console.log("Run Process with PCB PID: " + pcb.pid);
            this.currPCB = pcb;
            this.currPCB.state = "running";
            this.readyQueue.enqueue(this.currPCB);
        };
        ProcessManager.prototype.readInstruction = function (PC) {
            return _Memory.readMemory(PC);
        };
        ProcessManager.prototype.terminateProcess = function (pcb) {
            if (this.readyQueue.isEmpty()) {
                _CPU.isExecuting = false;
                pcb.state = "terminated";
                this.readyQueue.dequeue();
            }
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
