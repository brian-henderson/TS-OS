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
                public readyQueue: TSOS.Queue = new Queue(),
                public processArray: ProcessControlBlock[] = new Array()
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
                  // add pcb to process list
                  this.processArray.push(pcb);
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
               console.log("Current Process List: ", this.processArray);
            }


            public runProcess(pcb: ProcessControlBlock): void {
                console.log("Run Process with PCB PID: " + pcb.pid);
                this.currPCB = pcb;
                this.currPCB.state = "Running";
                this.readyQueue.enqueue(this.currPCB);
                Utils.setStatus("Enjoying the delicious flavors");
                _Control.updateCpuDisplay();
                _Control.updatePcbDisplay(pcb);
            }

            public readInstruction(partition: number, PC: number): string {
                return _Memory.readMemory(partition, PC);
            }

            public terminateProcess(pcb: ProcessControlBlock): void {
                //if (! this.readyQueue.isEmpty()) {
                    _CPU.isExecuting = false;
                    pcb.state = "Terminated";
                    pcb.location = "Black Hole";
                    this.removeProcessFromReadyQueue(pcb.pid);
                    _MemoryManager.partitions[pcb.partitionIndex].available = true;
                    _CPU.resetCpu();
                    //_Control.terminatePcbDisplay(pcb);
                    _Control.updatePcbDisplay(pcb);
                    _Memory.clearMemoryPartition(pcb.partitionIndex);
                    _Console.advanceLine();
                    _OsShell.putPrompt();
                    Utils.setStatus("Still a little hungry...");
                //}
            }

            public runAllProccesses() {
               while (this.waitQueue.getSize() > 0) {
                  let runningPCB: ProcessControlBlock = this.waitQueue.dequeue() 
                  this.runProcess(runningPCB);
               }
            }

            public getPCBfromPid(pid: number): ProcessControlBlock {
               let pcb: ProcessControlBlock;
               for (let i = 0; i < this.processArray.length; i++) {
                  if (this.processArray[i].pid == pid) {
                     pcb = this.processArray[i];
                     break;
                  }
               }
               return pcb;
            }

            public removeProcessFromReadyQueue(pid: number): void {
               let tempQueue: TSOS.Queue = new Queue();
               while (this.readyQueue.getSize() > 0) {
                  let queuePCB: ProcessControlBlock = this.readyQueue.dequeue();
                  if ( queuePCB.pid != pid) {
                     tempQueue.enqueue(queuePCB);
                  }
               }
               while (tempQueue.getSize() > 0) {
                  this.readyQueue.enqueue(tempQueue.dequeue());
               }

            }

            public killProcessByPid(pid: number) {
               let pcb: ProcessControlBlock = this.getPCBfromPid(pid);
               this.terminateProcess(pcb);

            }

        

        }

    }