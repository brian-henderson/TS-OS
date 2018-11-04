///<reference path="../globals.ts" />
///<reference path="../utils.ts" />

/* ------------
     Scheduler.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

     module TSOS {

      export class Scheduler {
   
         constructor(
            public quantum: number = _Quantum,
            public scheduleIndex: number = 0,
            public currAlgo: string = _CurrSchedulingAlgo,
            public algoArray: string[] = ["FirstComeFirstServe", "RoundRobin"] 
         ){};

         public validateScheduler(){

            switch(this.currAlgo) {
               case "FirstComeFirstServe":
                  this.schedulerFCFS();
                  break;
               case "RoundRobin":
                  this.schedulerRR():
                  break;
               default:
                  console.log("Broken scheduler");
            }

         }

         public schedulerFCFS() {



         }

         public schedulerRR() {
            if (this.scheduleIndex === this.quantum) {
               if (_ProcessManager.readyQueue.getSize() > 1 ) {
                  //put the curr queeue to the end of the queue
                  let q = _ProcessManager.readyQueue.dequeue();
                  _ProcessManager.readyQueue.enqueue(q);
               }
               this.scheduleIndex = 0;
            }
            else {
               // execute another cycle and add another ot cycle.
               this.scheduleIndex += 1;
            }
         }
   
         
   
   
      }
   
   }