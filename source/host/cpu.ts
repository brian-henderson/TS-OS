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
                    this.loadAcc();
                    break;
                case "AD":
                    // Store the accumulator from memory
                    this.loadAccFromMemory();
                    break;
                case "A2":
                    // Load a constant into the X register
                    this.loadXRegister();
                    break;
                case "A0":
                    // Load a constant into the Y register
                    this.loadYRegister();
                    break;
                case "8D":
                    // tbd
                    break;
                case "8E":
                    // Load the X Register from memory
                    this.loadXfromMemory();
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

        public increaseProgramCounter() {
            this.PC++;
        }

        // OP CODE  - A9 
        public loadAcc(): void {
            // Increase program counter
            this.increaseProgramCounter();
            // save constant to accumulator
            this.Acc = parseInt(_Memory.readMemory(this.PC),16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - AD
        public loadAccFromMemory(): void {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where to store from
            let memoryLoc = parseInt(_Memory.readMemory(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the accumulator reading 
            this.Acc = parseInt(_Memory.readMemory(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - A2
        public loadXRegister(): void {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Xreg = parseInt(_Memory.readMemory(this.PC),16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - A0
        public loadYRegister(): void {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Yreg = parseInt(_Memory.readMemory(this.PC),16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - AE
        public loadXfromMemory(): void {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            let memoryLoc = parseInt(_Memory.readMemory(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the X register on CPU
            this.Xreg = parseInt(_Memory.readMemory(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

         // OP CODE  - AC
         public loadYfromMemory(): void {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            let memoryLoc = parseInt(_Memory.readMemory(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the Y register on CPU
            this.Yreg = parseInt(_Memory.readMemory(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

    }
}
