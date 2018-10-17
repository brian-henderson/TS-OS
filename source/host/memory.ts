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

            public readMemory(PC: number): string {
                console.log("read memory called with PC : " + PC);
                return this.memoryStorage[PC];
            };

            public writeMemory(program): void {
                for (let i = 0; i < program.length; i++) {
                    //this.memoryStorage[i] = program[i];
                    this.writeMemoryByte(i, program[i]);
                }
                console.log("Current memory: " + this.memoryStorage);
                _Control.updateMemoryDisplay();
            };

            public writeMemoryByte(loc: number, byteData: string): void {
                this.memoryStorage[loc] = byteData;
            }

        }
    }
