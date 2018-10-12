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


            public createProcess(program: Array<string>): void {
                if (_MemoryManager.checkMemorySpace(program.length)) {
                    let pcb = new ProcessControlBlock(_PID);
                    _MemoryManager.loadProgram(program.length);
                    _StdOut.putText("Program loaded to memory with PID " + pcb.getPID);
                    _PID++;
                }
                else {
                    _StdOut.putText("Program not loaded to memory, too big");
                }
            }

        }

    }