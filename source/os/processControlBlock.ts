///<reference path="../globals.ts" />

    module TSOS {
        export class ProcessControlBlock { 
            public pid: number;
            constructor(p) {
                this.pid = p;
            };

            public getPID(): number {
                return this.pid;
            }

            public returnOne(): string {
                return "hello";
            }

        }


    }