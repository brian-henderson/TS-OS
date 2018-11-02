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

            public readMemory(partition: number, PC: number): string {
               let loc = PC;
               if (partition === 1){
                  loc += 256;
               }
               if (partition === 2){
                  loc += 512;
               } 
               
               return this.memoryStorage[loc];
            };

            public writeMemory(partition: number, program): void {
                for (let i = 0; i < program.length; i++) {
                    //this.memoryStorage[i] = program[i];
                    this.writeMemoryByte(partition, i, program[i]);
                }
                _Control.updateMemoryDisplay();
            };

            public writeMemoryByte(partition: number, loc: number, byteData: string): void {
               if (partition === 1){
                  loc += 256;
               }
               if (partition === 2){
                  loc += 512;
               }  
               
               this.memoryStorage[loc] = byteData;
            }

            public clearMemory(): void {
                for(let i=0; i < this.memoryStorage.length; i++) {
                    this.memoryStorage[i] = "00";
                }
                _Control.updateMemoryDisplay();
                
                for (let i=0; i < _MemoryManager.partitions.length; i++) {
                  _MemoryManager.partitions[i].available = true;
                }
            }

            public clearMemoryPartition(partition: number): void {
               switch(partition) {
                  case 0:
                     for(let i=0; i < 256; i++) {
                        this.memoryStorage[i] = "00";
                     }
                     break;
                  case 1:
                     for(let i=256; i < 512; i++) {
                        this.memoryStorage[i] = "00";
                     }
                     break;
                  case 2:
                     for(let i=512; i < 768; i++) {
                        this.memoryStorage[i] = "00";
                     }
                     break;
                  default:
                     console.log("Failed to clear memory partition");
               }
            }

        }
    }
