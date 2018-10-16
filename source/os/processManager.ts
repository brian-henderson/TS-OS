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
                public processList: ProcessControlBlock[] = []
                ) {                    
            };

            public currPCB : ProcessControlBlock;

            public runProcess(pcb: ProcessControlBlock): void {
                this.currPCB = pcb;
                this.currPCB.state = "running";
                _CPU.setCpu(pcb);
                _CPU.isExecuting = true;

            }

        

        }

    }