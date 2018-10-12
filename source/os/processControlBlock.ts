///<reference path="../globals.ts" />

    module TSOS {
        export class ProcessControlBlock { 
            public pid: number;
            public state: string;
            public programCounter : number;
            public instructionReg: string;
            public accumulator: number;
            public X: number;
            public Y: number;
            public Z: number;
            
            constructor(p) {
                this.pid = p;
            };

            public getPID(): number {
                return this.pid;
            };

            public getState(): string {
                return this.state;
            };

            public getProgramCounter(): number {
                return this.programCounter;
            };

            public getInstructionReg(): string {
                return this.instructionReg;
            };

            public getAccumulator(): number {
                return this.accumulator;
            };

            public getX(): number {
                return this.X;
            };

            public getY(): number {
                return this.Y;
            };

            public getZ(): number {
                return this.Z;
            };


        }


    }