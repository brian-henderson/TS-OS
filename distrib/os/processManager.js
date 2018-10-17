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
        waitQueue, readyQueue, currPCB) {
            if (waitQueue === void 0) { waitQueue = new TSOS.Queue(); }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            if (currPCB === void 0) { currPCB = null; }
            this.waitQueue = waitQueue;
            this.readyQueue = readyQueue;
            this.currPCB = currPCB;
        }
        ;
        ProcessManager.prototype.runProcess = function (pcb) {
            console.log("Run Process with PCB PID: " + pcb.pid);
            this.currPCB = pcb;
            this.currPCB.state = "running";
            this.readyQueue.enqueue(pcb);
        };
        ProcessManager.prototype.readInstruction = function (PC) {
            return _Memory.readMemory(PC);
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
