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
        ProcessControlBlock.prototype.returnOne = function () {
            return "hello";
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
