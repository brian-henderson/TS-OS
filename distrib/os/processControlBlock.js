///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(p) {
            this.pid = p;
        }
        ;
        ProcessControlBlock.prototype.getPID = function () {
            return this.pid;
        };
        ;
        ProcessControlBlock.prototype.getState = function () {
            return this.state;
        };
        ;
        ProcessControlBlock.prototype.getProgramCounter = function () {
            return this.programCounter;
        };
        ;
        ProcessControlBlock.prototype.getInstructionReg = function () {
            return this.instructionReg;
        };
        ;
        ProcessControlBlock.prototype.getAccumulator = function () {
            return this.accumulator;
        };
        ;
        ProcessControlBlock.prototype.getX = function () {
            return this.X;
        };
        ;
        ProcessControlBlock.prototype.getY = function () {
            return this.Y;
        };
        ;
        ProcessControlBlock.prototype.getZ = function () {
            return this.Z;
        };
        ;
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
