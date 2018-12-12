///<reference path="../globals.ts" />

    module TSOS {
        export class ProcessControlBlock { 
            public pid: number;
            public state: string = "New";
            public priority: number = 64;
            public programCounter : number = 0;
            public instructionReg: string = null;
            public accumulator: number = 0;
            public X: number = 0;
            public Y: number = 0;
            public Z: number = 0;
            public location: string = null;
            public partitionIndex: number = 0;
            public waitTime: number = 0;
            public turnAroundTime: number = 0;
            public hddTSB: string = null;
            public stdOutput: string = "";
            
            constructor(p) {
                this.pid = p;
            };

        }


    }