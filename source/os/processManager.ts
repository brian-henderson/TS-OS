///<reference path="../globals.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

     module TSOS {

        export class ProcessManager {

            constructor(
                //public processList: ProcessControlBlock[] = [],
                public waitQueue: TSOS.Queue = new Queue(),
                public readyQueue: TSOS.Queue = new Queue(),
                public currPCB : ProcessControlBlock = null
                ) {                    
            };


            public runProcess(pcb: ProcessControlBlock): void {
                console.log("Run Process with PCB PID: " + pcb.pid);
                this.currPCB = pcb;
                this.currPCB.state = "running";
                this.readyQueue.enqueue(pcb);
            }

            public readInstruction(PC: number): string {
                return _Memory.readMemory(PC);
            }

        

        }

    }