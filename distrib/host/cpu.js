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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            //_Control.updateCpuDisplay();
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.executeProgram(_ProcessManager.currPCB);
        };
        Cpu.prototype.executeProgram = function (pcb) {
            var currentInstruction = _Memory.readMemory(pcb.programCounter).toUpperCase();
            console.log("Current instruction: " + currentInstruction);
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
                    this.breakProgram(pcb);
            }
            // Update the current process control block
            _ProcessManager.currPCB.accumulator = this.Acc;
            _ProcessManager.currPCB.programCounter = this.PC;
            _ProcessManager.currPCB.X = this.Xreg;
            _ProcessManager.currPCB.Y = this.Yreg;
            _ProcessManager.currPCB.Z = this.Zflag;
            console.log("Finished Instruction: " + currentInstruction);
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
        // OP CODE  - A9 
        Cpu.prototype.loadAcc = function () {
            // Increase program counter
            this.increaseProgramCounter();
            // save constant to accumulator
            this.Acc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AD
        Cpu.prototype.loadAccFromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where to store from
            var memoryLoc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the accumulator reading 
            this.Acc = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - A2
        Cpu.prototype.loadXRegister = function () {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Xreg = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - A0
        Cpu.prototype.loadYRegister = function () {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Yreg = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AE
        Cpu.prototype.loadXfromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            var memoryLoc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the X register on CPU
            this.Xreg = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AC
        Cpu.prototype.loadYfromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            var memoryLoc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the Y register on CPU
            this.Yreg = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - EC
        Cpu.prototype.compareMemoryToX = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            var memoryLoc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // get the mem to compare X to 
            var mem = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            this.Zflag = (mem == this.Xreg ? 1 : 0);
        };
        // OP CODE  - 6D
        Cpu.prototype.addWithCarry = function () {
            this.increaseProgramCounter();
            var addr = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            this.increaseProgramCounter();
            this.Acc += parseInt(_ProcessManager.readInstruction(addr));
            this.increaseProgramCounter();
        };
        // OP CODE  - 8D
        Cpu.prototype.storeAccInMemory = function () {
            this.increaseProgramCounter();
            var loc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            this.increaseProgramCounter();
            _Memory.writeMemoryByte(loc, this.Acc.toString(16));
            this.increaseProgramCounter();
        };
        // OP CODE  - D0
        Cpu.prototype.branchBytes = function () {
            this.increaseProgramCounter();
            if (this.Zflag === 0) {
                var n = parseInt(_Memory.readMemory(this.PC), 16);
                this.increaseProgramCounter();
                this.PC += n;
            }
            else {
                this.increaseProgramCounter();
            }
        };
        // OP CODE  - FF
        Cpu.prototype.systemCall = function () {
            this.increaseProgramCounter();
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                var addr = this.Yreg;
                var output = '';
                var charCode = parseInt(_ProcessManager.readInstruction(addr), 16);
                while (charCode != 0) {
                    output += String.fromCharCode(charCode);
                    addr++;
                    charCode = parseInt(_ProcessManager.readInstruction(addr), 16);
                }
                _StdOut.putText(output);
            }
        };
        // OP CODE  - EE
        Cpu.prototype.increment = function () {
            this.increaseProgramCounter();
            var memoryLoc = parseInt(_ProcessManager.readInstruction(this.PC), 16);
            this.increaseProgramCounter();
            var val = parseInt(_ProcessManager.readInstruction(memoryLoc), 16);
            val++;
            _Memory.writeMemoryByte(memoryLoc, val.toString(16));
            this.increaseProgramCounter();
        };
        // OP CODE  - EA
        Cpu.prototype.noOp = function () {
            this.increaseProgramCounter();
        };
        // OP CODE  - 00
        Cpu.prototype.breakProgram = function (pcb) {
            this.increaseProgramCounter();
            _ProcessManager.terminateProcess(pcb);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
