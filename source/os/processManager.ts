///<reference path="../globals.ts" />
///<reference path="../utils.ts" />

module TSOS {

   export class ProcessManager {

      constructor(
         public waitQueue: TSOS.Queue = new Queue(),
         public readyQueue: TSOS.Queue = new Queue(),
         public processArray: ProcessControlBlock[] = new Array(),
         public runningAll: boolean = false
      ) {
      };

      public currPCB: TSOS.ProcessControlBlock;

      public createProcess(program: Array<string>, priority?): void {
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
            // assign the process a priority
            pcb.priority = priority != null ? Number(priority) : 64;
            // write the program to the memory, given user input already split into array
            _MemoryManager.writeProgramToMemory(pcb.partitionIndex, program);
            // add this process to the list of upcoming processes
            this.waitQueue.enqueue(pcb);
            // get the instruction registry and set it 
            pcb.instructionReg = _Memory.readMemory(pcb.partitionIndex, pcb.programCounter);
            // set the location 
            pcb.location = "MEMORY";
            // output status to console
            _StdOut.putResponseText("Program loaded to memory with PID " + _PID);
            // add pcb to the pcb display list
            _Control.addToPcbDisplay(pcb);
         } 
         else if(_krnFileSystemDriver.formatted) {
            // update to new Process ID 
            _PID++;
            // create new process control block
            let pcb = new ProcessControlBlock(_PID);
            // add pcb to process list
            this.processArray.push(pcb);
            // assign the process a priority
            pcb.priority = priority != null ? Number(priority) : 64;
            // add this process to the list of upcoming processes
            this.waitQueue.enqueue(pcb);
            // get the instruction registry and set it 
            pcb.instructionReg = program[0]
            // set the location 
            pcb.location = "HDD";
            //save to HDD
            _krnFileSystemDriver.krnRollOut(pcb, program);
            // output status to console
            _StdOut.putResponseText("Program loaded to the HDD with PID " + _PID);
            // add pcb to the pcb display list
            _Control.addToPcbDisplay(pcb);
            
         }
         else {
            _StdOut.putResponseText("Program not loaded to memory, no available partitions, try formatting the HDD");
         }
      }

      public runProcess(pcb: ProcessControlBlock): void {
         // check if the OS is running all
         if (! this.runningAll) {
            // check if the location of the pcb is in the hard drive
            if (pcb.location === "HDD") {
               // lets check for available partitiions, if none available then roll out a process to the hdd
               if (! _MemoryManager.checkForFreePartitions()) {
                  let pcbOut = _MemoryManager.getPcbFromPartition(2);
                  _krnFileSystemDriver.krnRollOut(pcbOut, _Memory.getProgramFromMemory(2, pcbOut.programCounter));
                  _krnFileSystemDriver.krnRollIn(pcb);
               }
               // theres a free partiton, roll into it
               else {
                  _krnFileSystemDriver.krnRollIn(pcb);
               }
            }
            // set the pcb state and enqueue to the ready queue
            pcb.state = "Running";
            this.readyQueue.enqueue(pcb);
         }
         else {
            pcb.state = "Ready";
            this.readyQueue.enqueue(pcb);
         }

         Utils.setStatus("Enjoying the delicious flavors");
         _Control.updateCpuDisplay();
         _Control.updatePcbDisplay(pcb);
      }

      public readInstruction(partition: number, PC: number): string {
         return _Memory.readMemory(partition, PC);
      }

      public terminateProcess(pcb: ProcessControlBlock): void {
         _CPU.isExecuting = false;
         this.removeProcessFromReadyQueue(pcb.pid);
         pcb.state = "Terminated";
         pcb.location = "Black Hole";
         _Memory.clearMemoryPartition(pcb.partitionIndex);
         _CPU.resetCpu();
         _Control.updatePcbDisplay(pcb);
         _Control.removePcbDisplay(pcb);
         this.printProcessTime(pcb);
         _Console.advanceLine();
         _OsShell.putPrompt();
         Utils.setStatus("Still a little hungry...");
         
      }

      public runAllProccesses() {
         this.runningAll = true;
         while (this.waitQueue.getSize() > 0) {
            this.runProcess(this.waitQueue.dequeue());
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
            if (queuePCB.pid != pid) {
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

      public updateWaitTime(): void {
         for (let i=0; i < this.readyQueue.getSize(); i ++) {
            this.readyQueue.q[i].waitTime ++;
         }
      }

      public updateTurnAroundTime(): void {
         for (let i=0; i < this.readyQueue.getSize(); i ++) {
            this.readyQueue.q[i].turnAroundTime ++;
         }
         this.currPCB.turnAroundTime ++;
      }

      public printProcessTime(pcb: ProcessControlBlock): void {
         _StdOut.advanceLine();
         _StdOut.advanceLine();
         _StdOut.putResponseText("PID: " + pcb.pid);
         _StdOut.advanceLine();
         _StdOut.putResponseText("Wait Time: " + pcb.waitTime);
         _StdOut.advanceLine();
         _StdOut.putResponseText("Turnaround Time: " + pcb.turnAroundTime);
         _StdOut.advanceLine();
      }

   }

}