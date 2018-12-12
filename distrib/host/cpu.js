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
            if (_ProcessManager.currPCB != undefined && _ProcessManager.currPCB.state != "Terminated") {
                this.executeProgram(_ProcessManager.currPCB);
                _ProcessManager.updateTurnAroundTime();
                _ProcessManager.updateWaitTime();
                _Control.updateCpuDisplay();
                _Control.updatePcbDisplay(_ProcessManager.currPCB);
                this.isExecuting = true;
            }
        };
        Cpu.prototype.executeProgram = function (pcb) {
            var currentInstruction = _Memory.readMemory(pcb.partitionIndex, pcb.programCounter).toUpperCase();
            this.IR = currentInstruction;
            this.setCpu(pcb);
            switch (currentInstruction) {
                case "A9":
                    // Load the constant into the accumulator
                    this.loadAcc(pcb);
                    break;
                case "AD":
                    // Store the accumulator from memory
                    this.loadAccFromMemory(pcb);
                    break;
                case "A2":
                    // Load a constant into the X register
                    this.loadXRegister(pcb);
                    break;
                case "A0":
                    // Load a constant into the Y register
                    this.loadYRegister(pcb);
                    break;
                case "8D":
                    // Store Accumulator in mem
                    this.storeAccInMemory(pcb);
                    break;
                case "6D":
                    // Add and carry
                    this.addWithCarry(pcb);
                    break;
                case "AE":
                    // Load the X Register from memory
                    this.loadXfromMemory(pcb);
                    break;
                case "AC":
                    // Load the Y Register from memory
                    this.loadYfromMemory(pcb);
                    break;
                case "EC":
                    // compare memory to X register
                    this.compareMemoryToX(pcb);
                    break;
                case "D0":
                    // Branch N bytes if Z = 0
                    this.branchBytes(pcb);
                    break;
                case "FF":
                    // System call
                    this.systemCall(pcb);
                    break;
                case "EE":
                    // increment byte value at address
                    this.increment(pcb);
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
                    console.log("Invalid OP: " + currentInstruction);
                    _StdOut.putResponseText("Invalid OP code...terminating");
                    _ProcessManager.terminateProcess(pcb);
            }
            // Update the current process control block
            this.updateCurrentPCB();
            if (_SingleStep) {
                this.isExecuting = false;
            }
        };
        Cpu.prototype.updateCurrentPCB = function () {
            _ProcessManager.currPCB.accumulator = this.Acc;
            _ProcessManager.currPCB.programCounter = this.PC;
            _ProcessManager.currPCB.X = this.Xreg;
            _ProcessManager.currPCB.Y = this.Yreg;
            _ProcessManager.currPCB.Z = this.Zflag;
            _ProcessManager.currPCB.instructionReg = this.IR;
        };
        Cpu.prototype.setCpu = function (pcb) {
            this.PC = pcb.programCounter;
            this.Acc = pcb.accumulator;
            this.Xreg = pcb.X;
            this.Yreg = pcb.Y;
            this.Zflag = pcb.Z;
        };
        Cpu.prototype.resetCpu = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.IR = "--";
        };
        Cpu.prototype.increaseProgramCounter = function () {
            this.PC++;
        };
        // ==  OP CODES ====================================================================== //
        // OP CODE  - A9 
        // Purpose: Load the accumulator with the next memory value
        Cpu.prototype.loadAcc = function (pcb) {
            // Increase program counter
            this.increaseProgramCounter();
            // save constant to accumulator
            this.Acc = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AD
        // Purpose: Load the accumultaor with a specific memory address
        Cpu.prototype.loadAccFromMemory = function (pcb) {
            // Increase program counter
            this.increaseProgramCounter();
            // Fetch the memory location where we want to load the Accumulator with
            var memoryLocHex = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
            // Increase program counter
            this.increaseProgramCounter();
            // convert to decimal address for partition index
            var memoryloc = parseInt(memoryLocHex, 16);
            // load into the accumulator reading 
            this.Acc = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryloc), 16);
            this.increaseProgramCounter();
        };
        // OP CODE  - A2
        // Purpose: Load constant into X Reg
        Cpu.prototype.loadXRegister = function (pcb) {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Xreg = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - A0
        // Purpose: Load constant into Y Reg
        Cpu.prototype.loadYRegister = function (pcb) {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign y register
            console.log("Y Before Load: A0 " + this.Yreg);
            this.Yreg = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, this.PC), 16);
            console.log("Read: " + _ProcessManager.readInstruction(pcb.partitionIndex, this.PC));
            console.log("PC: " + this.PC);
            console.log("Y After Load: A0 " + this.Yreg);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AE
        // Purpose: Load X Reg from memory
        Cpu.prototype.loadXfromMemory = function (pcb) {
            // increase program counter
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            this.Xreg = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc), 16);
            this.increaseProgramCounter();
        };
        // OP CODE  - AC
        // Purpose: Load Y reg from memory
        Cpu.prototype.loadYfromMemory = function (pcb) {
            // increase program counter
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
            console.log("memory loc hex:" + memoryLocHex);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            console.log("memory loc:" + memoryLoc);
            console.log("Y Before Load: " + this.Yreg);
            this.Yreg = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc), 16);
            console.log("Y After Load: " + this.Yreg);
            this.increaseProgramCounter();
        };
        // OP CODE  - EC
        // Purpose: Compare X reg to byte in memory
        Cpu.prototype.compareMemoryToX = function (pcb) {
            // increase program counter
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            var byte = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc), 16);
            this.Zflag = (byte === this.Xreg ? 1 : 0);
            this.increaseProgramCounter();
        };
        // OP CODE  - 6D
        // Purpsoe: Add contents of the address to acc and save results in acc
        Cpu.prototype.addWithCarry = function (pcb) {
            /*   this.increaseProgramCounter();
               let hexStr = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
               this.increaseProgramCounter();
               hexStr = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC) + hexStr;
               let memoryLoc = parseInt(hexStr, 16);
               let val = _ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc);
               this.Acc += parseInt(val);
               this.increaseProgramCounter();
               */
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            this.Acc += parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc), 16);
            this.increaseProgramCounter();
        };
        // OP CODE  - 8D
        // Purpose: store the acc into memory
        Cpu.prototype.storeAccInMemory = function (pcb) {
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            var value = this.Acc.toString(16).toUpperCase();
            value = value.length < 2 ? ("0" + value) : value;
            _Memory.writeMemoryByte(pcb.partitionIndex, memoryLoc, value);
            this.increaseProgramCounter();
        };
        // OP CODE  - D0
        // Purpose: Branch n bytes if z flag is 0
        Cpu.prototype.branchBytes = function (pcb) {
            this.increaseProgramCounter();
            if (this.Zflag === 0) {
                var branchN = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, this.PC), 16);
                this.increaseProgramCounter();
                var branchedPC = this.PC + branchN;
                if (branchedPC > _MemoryPartitionSize - 1) {
                    this.PC = branchedPC - _MemoryPartitionSize;
                }
                else {
                    this.PC = branchedPC;
                }
            }
            else {
                this.increaseProgramCounter();
            }
        };
        // OP CODE  - FF
        // Purpose: print integer stored in Y reg 
        Cpu.prototype.systemCall = function (pcb) {
            if (this.Xreg === 1) {
                console.log("System Call Y: " + this.Yreg);
                _StdOut.putText(this.Yreg.toString());
                pcb.stdOutput += this.Yreg.toString();
            }
            else if (this.Xreg === 2) {
                var memoryLoc = this.Yreg;
                var output = '';
                var ascii = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc), 16);
                while (ascii != 0) {
                    output += String.fromCharCode(ascii);
                    memoryLoc++;
                    ascii = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc), 16);
                }
                _StdOut.putText(output);
                pcb.stdOutput += output;
                console.log("System Call Output: " + output);
            }
            this.increaseProgramCounter();
        };
        // OP CODE  - EE
        // Purpose: Increment the value of a byte.
        Cpu.prototype.increment = function (pcb) {
            this.increaseProgramCounter();
            var memoryLocHex = _ProcessManager.readInstruction(pcb.partitionIndex, this.PC);
            this.increaseProgramCounter();
            var memoryLoc = parseInt(memoryLocHex, 16);
            var value = parseInt(_ProcessManager.readInstruction(pcb.partitionIndex, memoryLoc), 16);
            value++;
            var hexValue = value.toString(16).toUpperCase();
            //hexValue = hexValue.length < 2 ? ("0" + hexValue) : hexValue;
            if (hexValue.length < 2) {
                hexValue = "0" + hexValue;
            }
            console.log("Writin hex value: " + hexValue);
            _Memory.writeMemoryByte(pcb.partitionIndex, memoryLoc, hexValue);
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
            this.isExecuting = false;
            _ProcessManager.terminateProcess(pcb);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
