///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(quantum, counter, currAlgo, schedulingAlgos) {
            if (quantum === void 0) { quantum = _QuantumDefault; }
            if (counter === void 0) { counter = 0; }
            if (currAlgo === void 0) { currAlgo = _SchedulerAlgoDefault; }
            if (schedulingAlgos === void 0) { schedulingAlgos = ["rr", "fcfs", "priority"]; }
            this.quantum = quantum;
            this.counter = counter;
            this.currAlgo = currAlgo;
            this.schedulingAlgos = schedulingAlgos;
        }
        ;
        Scheduler.prototype.validateScheduler = function () {
            // Check if the curr pcb is at state TERMINATED, if so, reset counter
            if (_ProcessManager.currPCB != null) {
                if (_ProcessManager.currPCB.state === "Terminated")
                    this.counter = 0;
            }
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
        // Grab the next process in the ready queue and set it to the curr PCB
        Scheduler.prototype.unloadProcessFromReadyQueue = function () {
            _ProcessManager.currPCB = _ProcessManager.readyQueue.dequeue();
            _ProcessManager.currPCB.state = "Running";
            var log = "Switching context to PID " + _ProcessManager.currPCB.pid;
            _Kernel.krnTrace(log);
        };
        // set the curr PCB to ready and throw it in the back
        Scheduler.prototype.loadProcessToReadyQueue = function () {
            var log = "Switching context out of PID" + _ProcessManager.currPCB.pid;
            _ProcessManager.currPCB.state = "Ready";
            _Control.updatePcbDisplay(_ProcessManager.currPCB);
            _ProcessManager.readyQueue.enqueue(_ProcessManager.currPCB);
            _Kernel.krnTrace(log);
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
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
            }
            else if (this.counter == this.quantum) {
                if (!_ProcessManager.readyQueue.isEmpty()) {
                    if (_ProcessManager.currPCB.state != "Terminated") {
                        // get the curr pcb and put it to the back of the queue
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(LOAD_PROCESS_SWITCH_IRQ, 0));
                    }
                    // set the new curr pcb to the next in the queue
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
                }
                this.counter = 0;
            }
        };
        Scheduler.prototype.schedulerFCFS = function () {
            if (this.counter === 0) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
            }
            else {
                if (_ProcessManager.currPCB.state === "Terminated") {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
                }
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
