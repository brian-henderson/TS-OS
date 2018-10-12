///<reference path="../globals.ts" />

    module TSOS {
        export class MemoryManager { 

            constructor(
                public pidArr = [],
            ){};
    
            public loadProgram(program): void {
                for (let i = 0; i < program.length; i++) {
                    _Memory.memoryStorage[i] = program[i];
                    console.log( _Memory.memoryStorage[i]);
                }
            }

            public checkMemorySpace(programLength: number): boolean {
                return programLength <= _Memory.memoryStorage.length;
            }

            public createProcess(program: Array<string>): void {
                if (_MemoryManager.checkMemorySpace(program.length)) {
                    let pcb = new ProcessControlBlock(_PID);
                    _MemoryManager.loadProgram(program);
                    _StdOut.putText("Program loaded to memory with PID " + pcb.getPID());
                    _PID++;
                }
                else {
                    _StdOut.putText("Program not loaded to memory, too big");
                }
            }


        }

    }