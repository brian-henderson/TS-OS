///<reference path="../globals.ts" />

    module TSOS {
        export class MemoryManager { 

            constructor(
                public pidArr = [],
            ){};
    

            public checkMemorySpace(programLength: number): boolean {
                return programLength <= _Memory.memoryStorage.length;
            }

            public createProcess(program: Array<string>): void {
                if (_MemoryManager.checkMemorySpace(program.length)) {
                    _PID++;
                    // new process control block
                    let pcb = new ProcessControlBlock(_PID);
                    // write the program to the memory, given user input already split into array
                    _MemoryManager.writeProgramToMemory(program);
                    // add this process to the list of upcoming processes
                    _ProcessManager.processList.push(pcb);
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

            public writeProgramToMemory(program): void {
                _Memory.writeMemory(program);
            }


        }

    }