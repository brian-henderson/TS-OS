///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(p) {
            this.state = "New";
            this.priority = 64;
            this.programCounter = 0;
            this.instructionReg = null;
            this.accumulator = 0;
            this.X = 0;
            this.Y = 0;
            this.Z = 0;
            this.location = null;
            this.partitionIndex = 0;
            this.waitTime = 0;
            this.turnAroundTime = 0;
            this.hddTSB = null;
            this.stdOutput = "";
            this.pid = p;
        }
        ;
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
