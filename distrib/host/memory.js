///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
        }
        Memory.prototype.init = function () {
            this.memoryStorage = new Array(_MemorySize);
            this.memoryStorage.forEach(function (i) {
                i = "00";
            });
            console.log(this.memoryStorage);
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
