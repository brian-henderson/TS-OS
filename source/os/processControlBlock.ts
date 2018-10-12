///<reference path="../globals.ts" />

    module TSOS {
        export class ProcessControlBlock { 
            public pid: number;
            public state: string = "New";
            public priority: number = 0;
            public programCounter : number = 0;
            public instructionReg: string = null;
            public accumulator: number = 0;
            public X: number = 0;
            public Y: number = 0;
            public Z: number = 0;
            public location: string = null;
            
            constructor(p) {
                this.pid = p;
            };


        }


    }