///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
/* ------------
     Scheduler.ts

     Requires globals.ts
              queue.ts
     ------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(quantum, //_Quantum,
        scheduleIndex, currAlgo, //_CurrSchedulingAlgo,
        algoArray) {
            if (quantum === void 0) { quantum = 6; }
            if (scheduleIndex === void 0) { scheduleIndex = 0; }
            if (currAlgo === void 0) { currAlgo = "FirstComeFirstServe"; }
            if (algoArray === void 0) { algoArray = ["FirstComeFirstServe", "RoundRobin"]; }
            this.quantum = quantum;
            this.scheduleIndex = scheduleIndex;
            this.currAlgo = currAlgo;
            this.algoArray = algoArray;
        }
        ;
        Scheduler.prototype.validateScheduler = function () {
            switch (this.currAlgo) {
                case "FirstComeFirstServe":
                    this.schedulerFCFS();
                    break;
                case "RoundRobin":
                    this.schedulerRR();
                    break;
                default:
                    console.log("Broken scheduler");
            }
        };
        Scheduler.prototype.schedulerFCFS = function () {
        };
        Scheduler.prototype.schedulerRR = function () {
            if (this.scheduleIndex === this.quantum) {
                if (_ProcessManager.readyQueue.getSize() > 1) {
                    //put the curr queeue to the end of the queue
                    var q = _ProcessManager.readyQueue.dequeue();
                    _ProcessManager.readyQueue.enqueue(q);
                }
                this.scheduleIndex = 0;
            }
            else {
                // execute another cycle and add another ot cycle.
                this.scheduleIndex += 1;
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
