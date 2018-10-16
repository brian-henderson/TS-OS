///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class Memory{
            public memoryStorage: Array<string>;
            
            public init(): void {
                this.memoryStorage = new Array(_MemorySize);
                this.memoryStorage.forEach(i => {
                    i = "00";
                });
                console.log(this.memoryStorage);
            }
/*
            public readMemory(PC: number): string {
                return this.memoryStorage[PC];
            };

            public writeMemory(program) {
                for (let i = 0; i < program.length; i++) {
                    this.memoryStorage[i] = program[i];
                    console.log(this.memoryStorage[i]);
                }
                _Control.updateMemoryDisplay();
            };
*/
        }
    }
