///<reference path="../globals.ts" />

/* ------------
     MemoryAccessor.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class MemoryAccessor{

            //constructor(){};

            public readMemory(PC: number): string {
                return _Memory.memoryStorage[PC];
            };

            public writeMemory(program) {
                for (let i = 0; i < program.length; i++) {
                    _Memory.memoryStorage[i] = program[i];
                    console.log(_Memory.memoryStorage[i]);
                }
                _Control.updateMemoryDisplay();
            };

        }
    }
