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
                public waitQueue: TSOS.Queue = new Queue(),
                public readyQueue: TSOS.Queue = new Queue()
                ) {                    
            };

            public currPCB: TSOS.ProcessControlBlock;

            public createProcess(program: Array<string>): void {
                if (_MemoryManager.checkMemorySpace(program.length)) {
                    // update to new Process ID 
                    _PID++;
                    // create new process control block
                    let pcb = new ProcessControlBlock(_PID);
                    // write the program to the memory, given user input already split into array
                    _MemoryManager.writeProgramToMemory(program);
                    // add this process to the list of upcoming processes
                    this.waitQueue.enqueue(pcb);
                    // get the instruction registry and set it 
                    pcb.instructionReg = _Memory.readMemory(pcb.programCounter);
                    // set the location to memory (no hard drive yet so this is static but getting ready for next iP)
                    pcb.location = "Memory";
                    // output status to console
                    _StdOut.putText("Program loaded to memory with PID " + _PID);
                    // add pcb to the pcb display list
                    _Control.addToPcbDisplay(pcb);
                }
                else {
                    _StdOut.putText("Program not loaded to memory, too big");
                }
            }


            public runProcess(pcb: ProcessControlBlock): void {
                console.log("Run Process with PCB PID: " + pcb.pid);
                this.currPCB = pcb;
                this.currPCB.state = "running";
                this.readyQueue.enqueue(this.currPCB);
                _Control.updateCpuDisplay();
                _Control.updatePcbDisplay(pcb);;
            }

            public readInstruction(PC: number): string {
                return _Memory.readMemory(PC);
            }

            public terminateProcess(pcb: ProcessControlBlock): void {
                if (this.readyQueue.isEmpty()) {
                    _CPU.isExecuting = false;
                    pcb.state = "terminated";
                    this.readyQueue.dequeue();
                }
            }

        

        }

    }