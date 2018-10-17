///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pidArr) {
            if (pidArr === void 0) { pidArr = []; }
            this.pidArr = pidArr;
        }
        ;
        MemoryManager.prototype.checkMemorySpace = function (programLength) {
            return programLength <= _Memory.memoryStorage.length;
        };
        MemoryManager.prototype.writeProgramToMemory = function (program) {
            _Memory.writeMemory(program);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
