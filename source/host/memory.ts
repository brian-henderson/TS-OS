///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class Memory{
            public memoryStorage: Array<String>;
            public init(): void {
                this.memoryStorage = new Array(256);
                this.memoryStorage.forEach(i => {
                    i = "00";
                });
            }

            public createProcess(program: Array<string>): void {
                if (_MemoryManager.checkMemorySpace(program.length)) {
                    let pcb = new ProcessControlBlock(_PID);
                    _MemoryManager.loadProgram(program);
                    _StdOut.putText("Program loaded to memory with PID " + pcb.getPID);
                    _PID++;
                }
                else {
                    _StdOut.putText("Program not loaded to memory, too big");
                }
            }

        }
    }
