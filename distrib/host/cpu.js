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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, currentInstruction) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (currentInstruction === void 0) { currentInstruction = ""; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.currentInstruction = currentInstruction;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentInstruction = "";
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            _Control.updateCpuDisplay();
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };
        Cpu.prototype.executeProgram = function (pcb) {
            this.currentInstruction = _MemoryAccessor.readMemory(pcb.programCounter).toUpperCase();
            switch (this.currentInstruction) {
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
                    this.loadYfromMemory();
                    break;
                case "EC":
                    // compare memory to X register
                    this.compareMemoryToX();
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
            // Update the current process control block
            _ProcessManager.currPCB.accumulator = this.Acc;
            _ProcessManager.currPCB.programCounter = this.PC;
            _ProcessManager.currPCB.X = this.Xreg;
            _ProcessManager.currPCB.Y = this.Yreg;
            _ProcessManager.currPCB.Z = this.Zflag;
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
            this.Acc = parseInt(_MemoryAccessor.readMemory(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AD
        Cpu.prototype.loadAccFromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where to store from
            var memoryLoc = parseInt(_MemoryAccessor.readMemory(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the accumulator reading 
            this.Acc = parseInt(_MemoryAccessor.readMemory(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - A2
        Cpu.prototype.loadXRegister = function () {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Xreg = parseInt(_MemoryAccessor.readMemory(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - A0
        Cpu.prototype.loadYRegister = function () {
            // increase program counter
            this.increaseProgramCounter();
            // get and assign x register
            this.Yreg = parseInt(_MemoryAccessor.readMemory(this.PC), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AE
        Cpu.prototype.loadXfromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            var memoryLoc = parseInt(_MemoryAccessor.readMemory(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the X register on CPU
            this.Xreg = parseInt(_MemoryAccessor.readMemory(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - AC
        Cpu.prototype.loadYfromMemory = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            var memoryLoc = parseInt(_MemoryAccessor.readMemory(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // load into the Y register on CPU
            this.Yreg = parseInt(_MemoryAccessor.readMemory(memoryLoc), 16);
            // update program counter to next program
            this.increaseProgramCounter();
        };
        // OP CODE  - EC
        Cpu.prototype.compareMemoryToX = function () {
            // increase program counter
            this.increaseProgramCounter();
            // grab the memory location of where stored
            var memoryLoc = parseInt(_MemoryAccessor.readMemory(this.PC), 16);
            // increase program counter again
            this.increaseProgramCounter();
            // get the mem to compare X to 
            var mem = parseInt(_MemoryAccessor.readMemory(memoryLoc), 16);
            this.Zflag = (mem == this.Xreg ? 1 : 0);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
