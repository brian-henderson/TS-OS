///<reference path="../globals.ts" />
/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(processList) {
            if (processList === void 0) { processList = []; }
            this.processList = processList;
        }
        ProcessManager.prototype.runProcess = function (pcb) {
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
