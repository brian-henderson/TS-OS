///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class Memory{
            public memoryStorage: Array<string> = new Array(_MemorySize);
            
            public init(): void {
                for(let i = 0; i < this.memoryStorage.length; i++) {
                    this.memoryStorage[i] = "00";
                }
            }

            public readMemory(PC: number): string {
                return this.memoryStorage[PC];
            };

            public writeMemory(program): void {
                for (let i = 0; i < program.length; i++) {
                    //this.memoryStorage[i] = program[i];
                    this.writeMemoryByte(i, program[i]);
                }
                _Control.updateMemoryDisplay();
            };

            public writeMemoryByte(loc: number, byteData: string): void {
                this.memoryStorage[loc] = byteData;
            }

            public clearMemory(): void {
                for(let i=0; i < this.memoryStorage.length; i++) {
                    this.memoryStorage[i] = "00";
                }
            }

        }
    }
