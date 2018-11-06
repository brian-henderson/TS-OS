///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(quantum, counter, currAlgo) {
            if (quantum === void 0) { quantum = 6; }
            if (counter === void 0) { counter = 0; }
            if (currAlgo === void 0) { currAlgo = "ROUND_ROBIN"; }
            this.quantum = quantum;
            this.counter = counter;
            this.currAlgo = currAlgo;
        }
        ;
        Scheduler.prototype.validateScheduler = function () {
            switch (this.currAlgo) {
                /*     case "FirstComeFirstServe":
                        this.schedulerFCFS();
                        break; */
                case "ROUND_ROBIN":
                    this.schedulerRR();
                    break;
                default:
                    console.log("Broken scheduler");
            }
            this.counter++;
        };
        Scheduler.prototype.schedulerRR = function () {
            if (this.counter === 0) {
                var pcb = _ProcessManager.readyQueue.dequeue();
                pcb.state = "Running";
                _ProcessManager.currPCB = pcb;
            }
            else if (this.counter == this.quantum) {
                if (!_ProcessManager.readyQueue.isEmpty()) {
                    if (_ProcessManager.currPCB.state != "Terminated") {
                        // get the curr pcb and put it to the back of the queue
                        _ProcessManager.currPCB.state = "Ready";
                        _Control.updatePcbDisplay(_ProcessManager.currPCB);
                        _ProcessManager.readyQueue.enqueue(_ProcessManager.currPCB);
                    }
                    // set the new curr pcb to the next in the queue
                    _ProcessManager.currPCB = _ProcessManager.readyQueue.dequeue();
                    _ProcessManager.currPCB.state = "Running";
                }
                this.counter = 0;
            }
        };
        Scheduler.prototype.schedulerFCFS = function () {
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
