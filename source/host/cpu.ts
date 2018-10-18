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
                    public IR: string = "--"
                ){
        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.IR = "--";
        }


        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.executeProgram(_ProcessManager.currPCB);
            _Control.updateCpuDisplay();
            _Control.updatePcbDisplay(_ProcessManager.currPCB)
    
        }

        public executeProgram(pcb: ProcessControlBlock) {
            let currentInstruction = _Memory.readMemory(pcb.programCounter).toUpperCase();
            this.IR = currentInstruction;
            console.log("Current instruction: " + currentInstruction);
            
            switch(currentInstruction) {
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
                    // Store Accumulator in mem
                    this.storeAccInMemory();
                    break;
                case "6D":
                    // Add and carry
                    this.addWithCarry();
                    break;
                case "AE":
                    // Load the X Register from memory
                    this.loadXfromMemory();
                    break;
                case "AC":
                    // Load the Y Register from memory
                    this.loadYfromMemory();
                    break;
                case "EC":
                    // compare memory to X register
                    this.compareMemoryToX();
                    break;
                case "D0":
                    // Branch N bytes if Z = 0
                    this.branchBytes();
                    break;
                case "FF":
                    // System call
                    this.systemCall();
                    break;
                case "EE":
                    // increment byte value at address
                    this.increment();
                    break;
                case "EA":
                    // No Operation
                    this.noOp();
                    break;
                case "00":
                    // program go break break 
                    this.breakProgram(pcb);
                    break;
                default:
                    // invalid op code
                    _StdOut.putText("Invalid OP code...terminating");
                    _ProcessManager.terminateProcess(pcb);
            }
            
            // Update the current process control block
            _ProcessManager.currPCB.accumulator = this.Acc;
            _ProcessManager.currPCB.programCounter = this.PC;
            _ProcessManager.currPCB.X = this.Xreg;
            _ProcessManager.currPCB.Y = this.Yreg;
            _ProcessManager.currPCB.Z = this.Zflag;
            _ProcessManager.currPCB.instructionReg = this.IR;

            if (_SingleStep) {
                this.isExecuting = false;
            }
            
        }

        public setCpu(pcb: ProcessControlBlock): void {
            this.PC = pcb.programCounter;
            this.Acc = pcb.accumulator;
            this.Xreg = pcb.X;
            this.Yreg = pcb.Y;
            this.Zflag = pcb.Z;
        }

        public increaseProgramCounter() {
            this.PC++;
        }

        // ==  OP CODES ====================================================================== //

        // OP CODE  - A9 
        // Purpose: Load the accumulator with the next memory value
        public loadAcc(): void {
            // Increase program counter
            this.increaseProgramCounter();
            // save constant to accumulator
            this.Acc = parseInt(_ProcessManager.readInstruction(this.PC),16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - AD
        // Purpose: Load the accumultaor with a specific memory address
        public loadAccFromMemory(): void {
            // increase program counter
            this.increaseProgramCounter();
            let hexStr = _ProcessManager.readInstruction(this.PC);
            // increase program counter again
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC) + hexStr;
            // convert to decimal address
            let memoryLoc = parseInt(hexStr, 16);
            // load into the accumulator reading 
            this.Acc = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - A2
        // Purpose: Load constant into X Reg
        public loadXRegister(): void {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Xreg = parseInt(_ProcessManager.readInstruction(this.PC),16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - A0
        // Purpose: Load constant into Y Reg
        public loadYRegister(): void {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Yreg = parseInt(_ProcessManager.readInstruction(this.PC),16);
            // update program counter to next program
            this.increaseProgramCounter();
        }

        // OP CODE  - AE
        // Purpose: Load X Reg from memory
        public loadXfromMemory(): void {
            // increase program counter
            this.increaseProgramCounter();
            let hexStr = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC) + hexStr;
            let memoryLoc = parseInt(hexStr, 16);
            this.Xreg = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            this.increaseProgramCounter();
        }
         // OP CODE  - AC
         // Purpose: Load Y reg from memory
         public loadYfromMemory(): void {
            // increase program counter
            this.increaseProgramCounter();
            let hexStr = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC) + hexStr;
            let memoryLoc = parseInt(hexStr, 16);
            this.Yreg = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            this.increaseProgramCounter();
        }

        // OP CODE  - EC
        // Purpose: Compare X reg to byte in memory
        public compareMemoryToX(): void {
            // increase program counter
            this.increaseProgramCounter();
            let hexStr = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC) + hexStr;
            let memoryLoc = parseInt(hexStr, 16);
            let byte = _ProcessManager.readInstruction(memoryLoc);
            this.Zflag = ( (parseInt(byte.toString(), 16) == this.Xreg ) ? 1 : 0);
            this.increaseProgramCounter();
        }

        // OP CODE  - 6D
        // Purpsoe: Add contents of the address to acc and save results in acc
        public addWithCarry(): void {
            this.increaseProgramCounter();
            let hexStr = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC);
            let memoryLoc = parseInt(hexStr, 16);
            let val = _ProcessManager.readInstruction(memoryLoc);
            this.Acc += parseInt(val);
            this.increaseProgramCounter();
        }

        // OP CODE  - 8D
        // Purpose: store the acc into memory
        public storeAccInMemory(): void {
            this.increaseProgramCounter();
            let hexStr = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC) + hexStr;
            let memoryLoc = parseInt(hexStr, 16);
            let val = this.Acc.toString(16);
            _Memory.writeMemoryByte(memoryLoc, val);
            this.increaseProgramCounter();
        }

        // OP CODE  - D0
        // Purpose: Branch n bytes if z flag is 0
        public branchBytes(): void {
            this.increaseProgramCounter();
            if (this.Zflag == 0) {
                let branchN = parseInt(_ProcessManager.readInstruction(this.PC), 16);
                let branchedPC = this.PC + branchN;
                this.PC = branchedPC;
            }
            else {
                this.increaseProgramCounter();
            }
        }

        // OP CODE  - FF
        // Purpose: print integer stored in Y reg 
        public systemCall(): void {
            if (this.Xreg ===  1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                let memoryLoc = this.Yreg;
                let output = '';
                while (_Memory.readMemory(memoryLoc) != "00") {
                    let ascii = _Memory.readMemory(memoryLoc);
                    let charCode = parseInt(ascii.toString(), 16);
                    output += String.fromCharCode(charCode);
                    memoryLoc ++;
                }
                _StdOut.putText(output);
            }
            this.increaseProgramCounter();
        }

        // OP CODE  - EE
        // Purpose: Increment the value of a byte.
        public increment(): void {
            this.increaseProgramCounter();
            let hexStr = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC) + hexStr;
            let memoryLoc = parseInt(hexStr, 16);
            let value = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            value++;
            let hexValue = value.toString(16);
            _Memory.writeMemoryByte(memoryLoc, hexValue);
            this.increaseProgramCounter();
        }

        // OP CODE  - EA
        // Purpose: No operation, just increase program
        public noOp(): void {
            this.increaseProgramCounter();
        }

        // OP CODE  - 00
        // Purpose: make the program stop/break/terminate/end/die
        public breakProgram(pcb: ProcessControlBlock): void {
            this.increaseProgramCounter();
            _ProcessManager.terminateProcess(pcb);
        }

    }
}
