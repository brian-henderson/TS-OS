///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var hdd = /** @class */ (function () {
        function hdd(tsbArray) {
            if (tsbArray === void 0) { tsbArray = []; }
            this.tsbArray = tsbArray;
        }
        hdd.prototype.writeToHDD = function (tsb, data) {
            sessionStorage[tsb] = data;
        };
        hdd.prototype.readFromHDD = function (tsb) {
            return sessionStorage[tsb];
        };
        return hdd;
    }());
    TSOS.hdd = hdd;
})(TSOS || (TSOS = {}));
