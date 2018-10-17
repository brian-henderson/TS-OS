///<reference path="../globals.ts" />

    module TSOS {
        export class MemoryManager { 

            constructor(
                public pidArr = [],
            ){};
    

            public checkMemorySpace(programLength: number): boolean {
                return programLength <= _Memory.memoryStorage.length;
            }

            public writeProgramToMemory(program): void {
                _Memory.writeMemory(program);
            }


        }

    }