///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(quantum, counter, currAlgo, schedulingAlgos) {
            if (quantum === void 0) { quantum = 6; }
            if (counter === void 0) { counter = 0; }
            if (currAlgo === void 0) { currAlgo = "rr"; }
            if (schedulingAlgos === void 0) { schedulingAlgos = ["rr", "fcfs", "priority"]; }
            this.quantum = quantum;
            this.counter = counter;
            this.currAlgo = currAlgo;
            this.schedulingAlgos = schedulingAlgos;
        }
        ;
        Scheduler.prototype.validateScheduler = function () {
            switch (this.currAlgo) {
                case "fcfs":
                    this.schedulerFCFS();
                    break;
                case "rr":
                    this.schedulerRR();
                    break;
                default:
                    console.log("Broken scheduler");
            }
            this.counter++;
        };
        Scheduler.prototype.isVaildScheduler = function (arg) {
            for (var i = 0; i < this.schedulingAlgos.length; i++) {
                if (this.schedulingAlgos[i] === arg) {
                    return true;
                }
            }
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
            if (this.counter === 0) {
                var pcb = _ProcessManager.readyQueue.dequeue();
                pcb.state = "Running";
                _ProcessManager.currPCB = pcb;
            }
            else {
                if (_ProcessManager.currPCB.state === "Terminated") {
                    _ProcessManager.currPCB = _ProcessManager.readyQueue.dequeue();
                    _ProcessManager.currPCB.state = "Running";
                }
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
