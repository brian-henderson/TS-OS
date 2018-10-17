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
                console.log("Memory before writing");
                console.log(_Memory.memoryStorage)
                _Memory.writeMemory(program);
                console.log("Memory after writing");
                console.log(_Memory.memoryStorage)
            }


        }

    }