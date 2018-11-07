///<reference path="../globals.ts" />

module TSOS {

   export class Scheduler {

      constructor( 
         public quantum: number = _QuantumDefault,
         public counter: number = 0,
         public currAlgo: string = _SchedulerAlgoDefault,
         public schedulingAlgos: string[] = ["rr", "fcfs", "priority"]
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
            default:
               console.log("Broken scheduler");
         }
         this.counter ++;
      }

      public unloadProcessFromReadyQueue(): void {
         _ProcessManager.currPCB = _ProcessManager.readyQueue.dequeue()
         _ProcessManager.currPCB.state = "Running"
      }

      public loadProcessToReadyQueue(): void {
         _ProcessManager.currPCB.state = "Ready";
         _Control.updatePcbDisplay(_ProcessManager.currPCB);
         _ProcessManager.readyQueue.enqueue(_ProcessManager.currPCB);
      }


      public isVaildScheduler(arg: string): boolean {
         for (let i=0; i< this.schedulingAlgos.length; i++) {
            if (this.schedulingAlgos[i] === arg) {
               return true;
            }
         }
      }

      public schedulerRR() {
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




   }

}
