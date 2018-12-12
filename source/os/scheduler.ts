///<reference path="../globals.ts" />

module TSOS {

   export class Scheduler {

      constructor( 
         public quantum: number = _QuantumDefault,
         public counter: number = 0,
         public currAlgo: string = _SchedulerAlgoDefault,
         public schedulingAlgos: string[] = ["rr", "fcfs", "priority"],
         public rolledOutAlready: boolean = false,
      ){};

      
      public validateScheduler() {

         // Check if the curr pcb is at state TERMINATED, if so, reset counter
         if (_ProcessManager.currPCB != null){
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
            case "priority":
               this.schedulerPRIORITY();
               break;
            default:
               console.log("Broken scheduler");
         }
         this.counter ++;
      }

      // Grab the next process in the ready queue and set it to the curr PCB
      public unloadProcessFromReadyQueue(): void {
         if (_ProcessManager.readyQueue.getSize() > 0) {
            _ProcessManager.currPCB = _ProcessManager.readyQueue.dequeue();
            //console.log("Next process to run: " + _ProcessManager.currPCB.pid )
            _ProcessManager.currPCB.state = "Running";

            if (_ProcessManager.currPCB.location == "HDD") {
               _krnFileSystemDriver.krnRollIn(_ProcessManager.currPCB);
               this.rolledOutAlready = false;
               //console.log("roll tide");
            }

            if (this.rolledOutAlready) {
               let hddPCB: ProcessControlBlock = _ProcessManager.getPCBfromHDD();
               console.log("hdd PCB: " + hddPCB);
               _krnFileSystemDriver.krnRollIn(hddPCB);
               _Control.updatePcbDisplay(hddPCB);
               this.rolledOutAlready = false;
             //  console.log("rolled out")
            }

            let log: string = "Switching context to PID "+_ProcessManager.currPCB.pid;
            _Kernel.krnTrace(log)
         }
      }

      // set the curr PCB to ready and throw it in the back
      public loadProcessToReadyQueue(): void {
         if (_ProcessManager.currPCB.state != "Terminated") {

            let log: string = "Switching context out of PID" + _ProcessManager.currPCB.pid;
            _ProcessManager.currPCB.state = "Ready";


            if (_ProcessManager.readyQueue.q[0].location === "HDD" && (!_MemoryManager.checkForFreePartitions()) && _ProcessManager.readyQueue.getSize() > 2) {
               _krnFileSystemDriver.krnRollOut(_ProcessManager.currPCB, _Memory.getProgramFromMemory(_ProcessManager.currPCB.partitionIndex, 0));
               this.rolledOutAlready = true;
            }

            _Control.updatePcbDisplay(_ProcessManager.currPCB);
            _ProcessManager.readyQueue.enqueue(_ProcessManager.currPCB);
            _Kernel.krnTrace(log)
         }
      }

      public isVaildScheduler(arg: string): boolean {
         for (let i = 0; i < this.schedulingAlgos.length; i++) {
            if (this.schedulingAlgos[i] === arg) {
               return true;
            }
         }
      }

      public schedulerRR() {4
         if (this.counter === 0) {
            _KernelInterruptQueue.enqueue(new Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
         }
         else if (this.counter == this.quantum) {
            if ( !_ProcessManager.readyQueue.isEmpty() ) {
               if ( _ProcessManager.currPCB.state != "Terminated" ) {
                  // get the curr pcb and put it to the back of the queue
                  _KernelInterruptQueue.enqueue(new Interrupt(LOAD_PROCESS_SWITCH_IRQ, 0));

               }
               // set the new curr pcb to the next in the queue
               _KernelInterruptQueue.enqueue(new Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
            }
            this.counter = 0;
         }

      }

      public schedulerFCFS() {
         if (this.counter === 0) {
            _KernelInterruptQueue.enqueue(new Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
         }
         else {
            if (_ProcessManager.currPCB.state === "Terminated") {
               _KernelInterruptQueue.enqueue(new Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
            }
         }  
      }

      public schedulerPRIORITY() {
         _ProcessManager.readyQueue.q.sort(function(a, b) {
            if (a.priority < b.priority) {
               return -1;
            }
            if (a.priority > b.priority) {
               return 1;
            }
            if (a.priority == b.priority) {
               return 0;
            }
         });

         if (this.counter === 0) {
            _KernelInterruptQueue.enqueue(new Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
         }
         else {
            if (_ProcessManager.currPCB.state === "Terminated") {
               _KernelInterruptQueue.enqueue(new Interrupt(UNLOAD_PROCESS_SWITCH_IRQ, 0));
            }
         }  
         
      }




   }

}
