///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="memoryManager.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="processManager.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = "hidalgOS$ ";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Gets the current datetime.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Gets current path location...or maybe a Yoda quote.");
            this.commandList[this.commandList.length] = sc;
            // coinflip
            sc = new TSOS.ShellCommand(this.shellCoinFlip, "coinflip", "- Flips a double sided coin.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the status in the status bar.");
            this.commandList[this.commandList.length] = sc;
            // nuke
            sc = new TSOS.ShellCommand(this.shellNuke, "nuke", "- Thermo-nuclear BSOD warefare enabled. ");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Used to validate HTML code in User Program Input ");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<PID> - Used to run the loaded process given a PID");
            this.commandList[this.commandList.length] = sc;
            // clearMem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Used to clear all memory partitions");
            this.commandList[this.commandList.length] = sc;
            // runAll
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Excutes all programs at once");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<PID> - Kill a process with the associated PID");
            this.commandList[this.commandList.length] = sc;
            // set schedule
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<fcfs || rr || priority> - Sets scheduling algorithim");
            this.commandList[this.commandList.length] = sc;
            // set quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Sets the quantum");
            this.commandList[this.commandList.length] = sc;
            // view all processes
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "<state?> - Lists all the prcesses, optional state filter");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- returns current schedule");
            this.commandList[this.commandList.length] = sc;
            /*
                     sc = new ShellCommand(this.shellGetSchedule,
                        "getschedule",
                        "- returns current schedule");
                     this.commandList[this.commandList.length] = sc;
            
                     sc = new ShellCommand(this.shellGetSchedule,
                        "getschedule",
                        "- returns current schedule");
                     this.commandList[this.commandList.length] = sc;
            */
            // This adds all the shell commands to a globals list to be accessed in console
            for (var i = 0; i < this.commandList.length; i++) {
                _commandList[i] = this.commandList[i].command;
            }
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putResponseText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putResponseText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putResponseText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putResponseText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putResponseText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putResponseText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putResponseText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putResponseText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putResponseText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putResponseText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putResponseText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putResponseText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putResponseText("Displays the current version data.");
                        break;
                    case "shutdown":
                        _StdOut.putResponseText("Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putResponseText("Clears the screen and resets the cursor position.");
                        break;
                    case "trace":
                        _StdOut.putResponseText("<on | off> - Turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putResponseText("Does rot13 obfuscation on <string>");
                        break;
                    case "prompt":
                        _StdOut.putResponseText("Sets the prompt character.");
                        break;
                    case "man":
                        _StdOut.putResponseText("Inception.");
                        break;
                    case "date":
                        _StdOut.putResponseText("Gets the current date.");
                        break;
                    case "whereami":
                        _StdOut.putResponseText("Yoda knows all.");
                        break;
                    case "coinflip":
                        _StdOut.putResponseText("Flips a standard double sided coin.. May the odds be ever in your favor.");
                        break;
                    case "status":
                        _StdOut.putResponseText("Sets the status in the status bar.");
                        break;
                    case "nuke":
                        _StdOut.putResponseText("BSOD testing command.");
                        break;
                    case "load":
                        _StdOut.putResponseText("Validates user program code is well...valid");
                        break;
                    case "run":
                        _StdOut.putResponseText("<PID> - Used to run the loaded process given a PID");
                        break;
                    case "clearmem":
                        _StdOut.putResponseText("Used to clear all memory partitions. Use wisely.");
                        break;
                    case "runall":
                        _StdOut.putResponseText("Excutes all programs at once");
                        break;
                    case "kill":
                        _StdOut.putResponseText("<PID> - Used to kill a specific process identified by PID");
                        break;
                    case "setschedule":
                        _StdOut.putResponseText("<fcfs || rr || priority> - Sets scheduling algorithim");
                        break;
                    case "quantum":
                        _StdOut.putResponseText("<int> - Sets scheduling quantum");
                        break;
                    case "ps":
                        _StdOut.putResponseText("<state?> - Lists all the processes, filter by state (optional)");
                        break;
                    default:
                        _StdOut.putResponseText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putResponseText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putResponseText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putResponseText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putResponseText("Trace OFF");
                        break;
                    default:
                        _StdOut.putResponseText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putResponseText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putResponseText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putResponseText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putResponseText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            var d = new Date();
            _StdOut.putResponseText(d.toString());
        };
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putResponseText("Campus Deli.");
        };
        Shell.prototype.shellCoinFlip = function (args) {
            var randomNum = Math.floor(Math.random() * 10);
            if ((randomNum % 2) == 0)
                _StdOut.putResponseText("Heads");
            else
                _StdOut.putResponseText("Tails");
        };
        Shell.prototype.shellStatus = function (args) {
            var status = '';
            for (var i = 0; i < args.length; i++) {
                status = status + ' ' + args[i];
            }
            TSOS.Utils.setStatus(status);
        };
        Shell.prototype.shellNuke = function (args) {
            _Kernel.krnTrapError("User has engaged thermo-nuclear detonation...aka BSOD");
            TSOS.Utils.setStatus("Oh no. Too much bacon");
        };
        Shell.prototype.shellLoad = function (args) {
            // grab the input value from well the...input
            var programInput = document.getElementById("taProgramInput").value;
            // setting flag to true, only gets changed if set to false
            var isValid = true;
            for (var i = 0; i < programInput.length; i++) {
                // ignore new line breaks
                if (!(programInput.charAt(i) == '\n')) {
                    // grab the char code and use that in custom utils function, if not valid then the flag changes and breaks out
                    var c = programInput.charCodeAt(i);
                    if (!TSOS.Utils.isCharCodeValidHex(c)) {
                        _StdOut.putResponseText("Invalid Program Input at index: " + i);
                        isValid = false;
                        break;
                    }
                }
            }
            var inputArray = programInput.split(" ");
            if (isValid) {
                _ProcessManager.createProcess(inputArray);
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                var pid = args[0];
                var tempQueue = new TSOS.Queue();
                var pcbToRun = null;
                var pcbInQueue = false;
                // Grab the appropriate pcb from the wait queue 
                while (_ProcessManager.waitQueue.getSize() > 0) {
                    var waitQueuePcb = _ProcessManager.waitQueue.dequeue();
                    if (waitQueuePcb.pid == pid) {
                        pcbToRun = waitQueuePcb;
                        pcbInQueue = true;
                    }
                    else {
                        tempQueue.enqueue(waitQueuePcb);
                    }
                }
                while (tempQueue.getSize() > 0) {
                    _ProcessManager.waitQueue.enqueue(tempQueue.dequeue());
                }
                if (pcbInQueue) {
                    _ProcessManager.runProcess(pcbToRun);
                }
                else {
                    _StdOut.putResponseText("Given PID not found, run `ps` to see valid PIDs");
                }
            }
            else {
                _StdOut.putResponseText("Please supply PID, run `ps` to see all loaded PIDs");
            }
        };
        Shell.prototype.shellClearMem = function (args) {
            var p = args[0].toString();
            switch (p) {
                case '0':
                    _StdOut.putResponseText("Memory Partition Cleared: P:", p);
                    _Memory.clearMemoryPartition(0);
                    break;
                case '1':
                    _StdOut.putResponseText("Memory Partition Cleared: P:", p);
                    _Memory.clearMemoryPartition(1);
                    break;
                case '2':
                    _StdOut.putResponseText("Memory Partition Cleared: P:", p);
                    _Memory.clearMemoryPartition(2);
                    break;
                default:
                    _StdOut.putResponseText("All memory partitions cleared");
                    _Memory.clearMemory();
            }
        };
        Shell.prototype.shellRunAll = function (args) {
            _ProcessManager.runAllProccesses();
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                _ProcessManager.killProcessByPid(args[0]);
            }
            else {
                _StdOut.putResponseText("Usage: kill <PID> - Please supply a PID");
            }
        };
        Shell.prototype.shellSetSchedule = function (args) {
            if (args.length > 0) {
                if (_Scheduler.isVaildScheduler(args[0])) {
                    _Scheduler.currAlgo = args[0];
                    _StdOut.putResponseText("Scheduling algorithim set to: " + args[0]);
                }
            }
            else {
                _StdOut.putResponseText("Invalid scheduling algorithim, use : <fcfs || rr>");
            }
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                _Scheduler.quantum = args[0];
                _StdOut.putResponseText("Quantum set to: " + args[0]);
            }
            else {
                _StdOut.putResponseText("Invalid command usage, proper usage: quantum <int>");
            }
        };
        Shell.prototype.shellPS = function (args) {
            var displayAll = args[0] === "all" ? true : false;
            for (var i = 0; i < _ProcessManager.processArray.length; i++) {
                var pcb = _ProcessManager.processArray[i];
                if (pcb.state != "Terminated" || displayAll) {
                    _StdOut.putResponseText("[ PID: {" + pcb.pid + "} State: {" + pcb.state + "} Location: {" + pcb.location + "} ]");
                    _StdOut.advanceLine();
                }
            }
        };
        Shell.prototype.shellGetSchedule = function (args) {
            _StdOut.putText("Current Scheduling Algorithim: " + _Scheduler.currAlgo);
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
