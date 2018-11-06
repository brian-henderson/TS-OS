///<reference path="../globals.ts" />

module TSOS {

   export class Scheduler {

      constructor( 
         public quantum: number = 6,
         public counter: number = 0,
         //public currAlgo: string = "ROUND_ROBIN",
         public currAlgo: string = "FIRST_COME_FIRST_SERVE",
      ){};

      
      public validateScheduler() {

         switch (this.currAlgo) { 
           case "FIRST_COME_FIRST_SERVE":
               this.schedulerFCFS();
               break; 
            case "ROUND_ROBIN":
               this.schedulerRR();
               break;
            default:
               console.log("Broken scheduler");
         }
         this.counter ++;

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




   }

}
