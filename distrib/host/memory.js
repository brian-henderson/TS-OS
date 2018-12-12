///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memoryStorage = new Array(_MemorySize);
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.memoryStorage.length; i++) {
                this.memoryStorage[i] = "00";
            }
        };
        Memory.prototype.readMemory = function (partition, PC) {
            var loc = PC;
            if (partition === 1) {
                loc += 256;
            }
            if (partition === 2) {
                loc += 512;
            }
            return this.memoryStorage[loc];
        };
        ;
        Memory.prototype.getProgramFromMemory = function (partition, PC) {
            var loc = PC;
            if (partition === 1) {
                loc += 256;
            }
            if (partition === 2) {
                loc += 512;
            }
            return this.memoryStorage.slice(loc, loc + 255);
        };
        Memory.prototype.writeMemory = function (partition, program) {
            for (var i = 0; i < program.length; i++) {
                //this.memoryStorage[i] = program[i];
                this.writeMemoryByte(partition, i, program[i]);
            }
            _Control.updateMemoryDisplay();
        };
        ;
        Memory.prototype.writeMemoryByte = function (partition, loc, byteData) {
            if (partition === 1) {
                loc += 256;
            }
            if (partition === 2) {
                loc += 512;
            }
            this.memoryStorage[loc] = byteData;
        };
        Memory.prototype.clearMemory = function () {
            for (var i = 0; i < this.memoryStorage.length; i++) {
                this.memoryStorage[i] = "00";
            }
            _Control.updateMemoryDisplay();
            for (var i = 0; i < _MemoryManager.partitions.length; i++) {
                _MemoryManager.partitions[i].available = true;
            }
        };
        Memory.prototype.clearMemoryPartition = function (partition) {
            switch (partition) {
                case 0:
                    for (var i = 0; i < 256; i++) {
                        this.memoryStorage[i] = "00";
                    }
                    break;
                case 1:
                    for (var i = 256; i < 512; i++) {
                        this.memoryStorage[i] = "00";
                    }
                    break;
                case 2:
                    for (var i = 512; i < 768; i++) {
                        this.memoryStorage[i] = "00";
                    }
                    break;
                default:
                    console.log("ERR 5323: Invalid partition entry");
            }
            _MemoryManager.partitions[partition].available = true;
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
