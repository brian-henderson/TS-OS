///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public currentInstruction: string = ""
                ){
        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentInstruction = "";
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            _Control.updateCpuDisplay();
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }

        public executeProgram(pcb: ProcessControlBlock) {
            this.currentInstruction = _Memory.readMemory(pcb.programCounter).toUpperCase();

            switch(this.currentInstruction) {
                case "A9":
                    // Load the constant into the accumulator
                    break;
                case "AD":
                    // Store the accumulator into memory
                    break;
                case "A2":
                    // Load a constant into the X register
                    break;
                case "A0":
                    // Load a constant into the Y register
                    break;
                case "8D":
                    // tbd
                    break;
                case "8E":
                    // Load the X Register from memory
                    break;
                case "AC":
                    // Load the Y Register from memory
                    break;
                case "6D":
                    // Add address contents to accumulator
                    break;
                case "EC":
                    // compare memory to X register
                    break;
                case "D0":
                    // tbd
                    break;
                case "FF":
                    // System call
                    break;
                case "EE":
                    // increment byte value
                    break;
                case "00":
                    // new 
                    break;
                default:
                    // invalid op code

            }
        }

    }
}
