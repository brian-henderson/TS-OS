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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, IR) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (IR === void 0) { IR = "--"; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.IR = IR;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.IR = "--";
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.executeProgram(_ProcessManager.currPCB);
            _Control.updateCpuDisplay();
            _Control.updatePcbDisplay(_ProcessManager.currPCB);
        };
        Cpu.prototype.executeProgram = function (pcb) {
            var currentInstruction = _Memory.readMemory(pcb.programCounter).toUpperCase();
            this.IR = currentInstruction;
            console.log("Current Instruction Executing: " + currentInstruction);
            switch (currentInstruction) {
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
            console.log("....CURRENT ACC: " + this.Acc);
            console.log("....CURRENT PC : " + this.PC);
            console.log("....CURRENT X  : " + this.Xreg);
            console.log("....CURRENT Y  : " + this.Yreg);
            console.log("....CURRENT Z  : " + this.Zflag);
            if (_SingleStep) {
                this.isExecuting = false;
            }
        };
        Cpu.prototype.setCpu = function (pcb) {
            this.PC = pcb.programCounter;
            this.Acc = pcb.accumulator;
            this.Xreg = pcb.X;
            this.Yreg = pcb.Y;
            this.Zflag = pcb.Z;
        };
        Cpu.prototype.increaseProgramCounter = function () {
            this.PC++;
        };
        // ==  OP CODES ====================================================================== //
        // OP CODE  - A9 
        // Purpose: Load the accumulator with the next memory value
        Cpu.prototype.loadAcc = function () {
            // Increase program counter
            this.increaseProgramCounter();
            // save constant to accumulator
            this.Acc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AD
        // Purpose: Load the accumultaor with a specific memory address
        Cpu.prototype.loadAccFromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            var hexStr = _ProcessManager.readInstruction(this.PC);
            // increase program counter again
            this.increaseProgramCounter();
            hexStr += _ProcessManager.readInstruction(this.PC) + hexStr;
            // convert to decimal address
            var memoryLoc = parseInt(hexStr, 16);
            // load into the accumulator reading 
            this.Acc = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - A2
        // Purpose: Load constant into X Reg
        Cpu.prototype.loadXRegister = function () {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Xreg = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - A0
        // Purpose: Load constant into Y Reg
        Cpu.prototype.loadYRegister = function () {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Yreg = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AE
        // Purpose: Load X Reg from memory
        Cpu.prototype.loadXfromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            this.Xreg = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            this.increaseProgramCounter();
        };
        // OP CODE  - AC
        // Purpose: Load Y reg from memory
        Cpu.prototype.loadYfromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            this.Yreg = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            this.increaseProgramCounter();
        };
        // OP CODE  - EC
        // Purpose: Compare X reg to byte in memory
        Cpu.prototype.compareMemoryToX = function () {
            // increase program counter
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            var byte = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            this.Zflag = (byte === this.Xreg ? 1 : 0);
            this.increaseProgramCounter();
        };
        // OP CODE  - 6D
        // Purpsoe: Add contents of the address to acc and save results in acc
        Cpu.prototype.addWithCarry = function () {
            this.increaseProgramCounter();
            var hexStr = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            hexStr = _ProcessManager.readInstruction(this.PC) + hexStr;
            var memoryLoc = parseInt(hexStr, 16);
            var val = _ProcessManager.readInstruction(memoryLoc);
            this.Acc += parseInt(val);
            this.increaseProgramCounter();
        };
        // OP CODE  - 8D
        // Purpose: store the acc into memory
        Cpu.prototype.storeAccInMemory = function () {
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            var value = this.Acc.toString(16).toUpperCase();
            value = value.length < 2 ? ("0" + value) : value;
            _Memory.writeMemoryByte(memoryLoc, value);
            this.increaseProgramCounter();
        };
        // OP CODE  - D0
        // Purpose: Branch n bytes if z flag is 0
        Cpu.prototype.branchBytes = function () {
            console.log("Branching");
            this.increaseProgramCounter();
            if (this.Zflag === 0) {
                var branchN = parseInt(_ProcessManager.readInstruction(this.PC), 16);
                console.log("BranchN: " + branchN);
                this.increaseProgramCounter();
                var branchedPC = this.PC + branchN;
                console.log("BranchedPC: " + branchedPC);
                if (branchedPC > _MemoryPartitionSize - 1) {
                    this.PC = branchedPC - _MemoryPartitionSize;
                    console.log("BranchedPC > 255: PC:  " + this.PC);
                }
                else {
                    this.PC = branchedPC;
                    console.log("BranchedPC NOT > 255: PC:  " + this.PC);
                }
            }
            else {
                this.increaseProgramCounter();
            }
        };
        // OP CODE  - FF
        // Purpose: print integer stored in Y reg 
        Cpu.prototype.systemCall = function () {
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                var memoryLoc = this.Yreg;
                var output = '';
                var ascii = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
                while (ascii != 0) {
                    output += String.fromCharCode(ascii);
                    memoryLoc++;
                    ascii = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
                }
                _StdOut.putText(output);
            }
            this.increaseProgramCounter();
        };
        // OP CODE  - EE
        // Purpose: Increment the value of a byte.
        Cpu.prototype.increment = function () {
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            var byte = _ProcessManager.readInstruction(memoryLoc);
            var value = parseInt(byte, 16);
            value++;
            var hexValue = value.toString(16);
            hexValue = hexValue.length < 2 ? ("0" + hexValue) : hexValue;
            _Memory.writeMemoryByte(memoryLoc, hexValue);
            this.increaseProgramCounter();
        };
        // OP CODE  - EA
        // Purpose: No operation, just increase program
        Cpu.prototype.noOp = function () {
            this.increaseProgramCounter();
        };
        // OP CODE  - 00
        // Purpose: make the program stop/break/terminate/end/die
        Cpu.prototype.breakProgram = function (pcb) {
            this.increaseProgramCounter();
            _ProcessManager.terminateProcess(pcb);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
