///<reference path="../globals.ts" />
///<reference path="../utils.ts" />

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
               let partitionID = _MemoryManager.getAvailablePartition();

               if (partitionID != -1) {
                  // update to new Process ID 
                  _PID++;
                  // create new process control block
                  let pcb = new ProcessControlBlock(_PID);
                  // assign the available partiton to the pcb and process
                  pcb.partitionIndex = partitionID;
                  // write the program to the memory, given user input already split into array
                  _MemoryManager.writeProgramToMemory(pcb.partitionIndex, program);
                  // add this process to the list of upcoming processes
                  this.waitQueue.enqueue(pcb);
                  // get the instruction registry and set it 
                  pcb.instructionReg = _Memory.readMemory(pcb.partitionIndex, pcb.programCounter);
                  // set the location to memory (no hard drive yet so this is static but getting ready for next iP)
                  pcb.location = "Memory: P: " + (pcb.partitionIndex).toString();
                  // output status to console
                  _StdOut.putText("Program loaded to memory with PID " + _PID);
                  // add pcb to the pcb display list
                  _Control.addToPcbDisplay(pcb);
               }
               else {
                  _StdOut.putText("Program not loaded to memory, no available partitions");
               }
            }


            public runProcess(pcb: ProcessControlBlock): void {
                console.log("Run Process with PCB PID: " + pcb.pid);
                this.currPCB = pcb;
                this.currPCB.state = "Running";
                this.readyQueue.enqueue(this.currPCB);
                Utils.setStatus("Enjoying the delicious flavors");
                _Control.updateCpuDisplay();
                _Control.updatePcbDisplay(pcb);;
            }

            public readInstruction(partition: number, PC: number): string {
                return _Memory.readMemory(partition, PC);
            }

            public terminateProcess(pcb: ProcessControlBlock): void {
                if (! this.readyQueue.isEmpty()) {
                    this.readyQueue.dequeue();
                    pcb.state = "Terminated";
                    _MemoryManager.partitions[pcb.partitionIndex].available = true;
                    _Control.terminatePcbDisplay(pcb);
                    _CPU.isExecuting = false;
                    _CPU.resetCpu();
                    _Memory.clearMemoryPartition(pcb.partitionIndex);
                    Utils.setStatus("Still a little hungry...");
                    _Console.advanceLine();
                    _OsShell.putPrompt();
                }
            }

        

        }

    }