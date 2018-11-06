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

      public isVaildScheduler(arg: string): boolean {
         for (let i=0; i< this.schedulingAlgos.length; i++) {
            if (this.schedulingAlgos[i] === arg) {
               return true;
            }
         }
      }

      public schedulerRR() {
         if (this.counter === 0) {
            let pcb = _ProcessManager.readyQueue.dequeue()
            pcb.state = "Running";
            _ProcessManager.currPCB = pcb;
         }
         else if (this.counter == this.quantum) {
            if ( !_ProcessManager.readyQueue.isEmpty() ) {
               if ( _ProcessManager.currPCB.state != "Terminated" ) {
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

      }

      public schedulerFCFS() {
         if (this.counter === 0) {
            let pcb = _ProcessManager.readyQueue.dequeue()
            pcb.state = "Running";
            _ProcessManager.currPCB = pcb;
         }
         else {
            if (_ProcessManager.currPCB.state === "Terminated") {
               _ProcessManager.currPCB = _ProcessManager.readyQueue.dequeue();
               _ProcessManager.currPCB.state = "Running";
            }
         }  
      }

      public d




   }

}
