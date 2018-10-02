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

        }
    }
