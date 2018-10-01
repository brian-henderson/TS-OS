///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class Memory{
            public memoryStorage = [];
            public init(): void {
                this.memoryStorage = new Array(768);
                this.memoryStorage.forEach(i => {
                    i = "00";
                });
            }

     }
