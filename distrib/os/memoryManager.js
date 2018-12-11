///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(partitions) {
            if (partitions === void 0) { partitions = [
                // Partition 0
                {
                    available: true,
                    index: 0,
                    base: 0,
                    limit: 255
                },
                // Partition 1
                {
                    available: true,
                    index: 1,
                    base: 256,
                    limit: 511
                },
                // Partition 2
                {
                    available: true,
                    index: 2,
                    base: 512,
                    limit: 767
                },
            ]; }
            this.partitions = partitions;
        }
        ;
        MemoryManager.prototype.writeProgramToMemory = function (partition, program) {
            _Memory.writeMemory(partition, program);
        };
        MemoryManager.prototype.getAvailablePartition = function () {
            if (this.partitions[0].available == true) {
                this.partitions[0].available = false;
                return this.partitions[0].index;
            }
            else if (this.partitions[1].available == true) {
                this.partitions[1].available = false;
                return this.partitions[1].index;
            }
            else if (this.partitions[2].available == true) {
                this.partitions[2].available = false;
                return this.partitions[2].index;
            }
            else {
                // no available partitions
                return -1;
            }
        };
        MemoryManager.prototype.freePartition = function (partition) {
            this.partitions[partition].available = true;
        };
        MemoryManager.prototype.loadProgramFromHDD = function (pcb, program) {
            var partition = this.getAvailablePartition();
            if (partition != -1) {
                this.partitions[partition].available = false;
                pcb.partitionIndex = partition;
                this.writeProgramToMemory(partition, program);
                // update display
                _Control.updatePcbDisplay(pcb);
            }
            else {
                console.log('uh oh');
            }
        };
        MemoryManager.prototype.getPcbFromPartition = function (partitionIndex) {
            for (var i = 0; i < _ProcessManager.processArray.length; i++) {
                if (_ProcessManager.processArray[i].partitionIndex === partitionIndex && _ProcessManager.processArray[i].state != "Terminated") {
                    return _ProcessManager.processArray[i];
                }
            }
            return null;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
