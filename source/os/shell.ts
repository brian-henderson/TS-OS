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

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate, 
                                  "date",
                                  "- Gets the current datetime.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI, 
                                  "whereami",
                                  "- Gets current path location...or maybe a Yoda quote.");
            this.commandList[this.commandList.length] = sc;

            // coinflip
            sc = new ShellCommand(this.shellCoinFlip, 
                "coinflip",
                "- Flips a double sided coin.");
            this.commandList[this.commandList.length] = sc;
            
            // status
            sc = new ShellCommand(this.shellStatus, 
                "status",
                "<string> - Sets the status in the status bar.");
            this.commandList[this.commandList.length] = sc;
        
            // nuke
            sc = new ShellCommand(this.shellNuke, 
                "nuke",
                "- Thermo-nuclear BSOD warefare enabled. ");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad, 
                "load",
                "- Used to validate HTML code in User Program Input ");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun, 
                "run",
                "<PID> - Used to run the loaded process given a PID");
            this.commandList[this.commandList.length] = sc;

            // clearMem
            sc = new ShellCommand(this.shellClearMem, 
               "clearmem",
               "- Used to clear all memory partitions");
           this.commandList[this.commandList.length] = sc;

            // runAll
            sc = new ShellCommand(this.shellRunAll, 
               "runall",
               "- Excutes all programs at once");
            this.commandList[this.commandList.length] = sc;

            // runAll
            sc = new ShellCommand(this.shellKill, 
               "kill",
               "<PID> - Kill a process with the associated PID");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.


            // This adds all the shell commands to a globals list to be accessed in console
            for (var i=0; i < this.commandList.length; i++) {
                _commandList[i] = this.commandList[i].command;
            }

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Displays the current version data.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen and resets the cursor position.");
                        break;
                    case "trace":
                        _StdOut.putText("<on | off> - Turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("Does rot13 obfuscation on <string>");
                        break;
                    case "prompt":
                        _StdOut.putText("Sets the prompt character.");
                        break;
                    case "man":
                        _StdOut.putText("Inception.");
                        break;
                    case "date":
                        _StdOut.putText("Gets the current date.");
                        break;
                    case "whereami":
                        _StdOut.putText("Yoda knows all.");
                        break;
                    case "coinflip":
                        _StdOut.putText("Flips a standard double sided coin.. May the odds be ever in your favor.");
                        break;
                    case "status":
                        _StdOut.putText("Sets the status in the status bar.");
                        break;
                    case "nuke":
                        _StdOut.putText("BSOD testing command.");
                        break;
                    case "load":
                        _StdOut.putText("Validates user program code is well...valid");
                        break;
                    case "run":
                        _StdOut.putText("<PID> - Used to run the loaded process given a PID");
                        break;
                    case "clearmem":
                        _StdOut.putText("Used to clear all memory partitions. Use wisely.");
                        break;
                    case "runall":
                        _StdOut.putText("Excutes all programs at once");
                        break;
                    case "kill":
                        _StdOut.putText("<PID> - Used to kill a specific process identified by PID");
                        break;
                default:
                    _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args) {
            var d = new Date();
            _StdOut.putText(d.toString());    
        }

        public shellWhereAmI(args) {
            _StdOut.putText("Campus Deli.");
        }

        public shellCoinFlip(args) {
            var randomNum = Math.floor(Math.random()*10);
            if ((randomNum % 2) == 0)
                _StdOut.putText("Heads");
            else   
                _StdOut.putText("Tails");
        }   

        public shellStatus(args) {
            var status = '';
            for (var i = 0; i < args.length; i++)
            {
                status = status + ' ' + args[i];
            }
            Utils.setStatus(status);
        }

        public shellNuke(args) {
            _Kernel.krnTrapError("User has engaged thermo-nuclear detonation...aka BSOD");
            Utils.setStatus("Oh no. Too much bacon");
        }

        public shellLoad(args) {
            // grab the input value from well the...input
            var programInput = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
            // setting flag to true, only gets changed if set to false
            var isValid = true;
            
            for (var i=0; i < programInput.length; i++ ) {
                // ignore new line breaks
                if (! (programInput.charAt(i) == '\n')){
                    // grab the char code and use that in custom utils function, if not valid then the flag changes and breaks out
                    var c = programInput.charCodeAt(i);
                    if (! Utils.isCharCodeValidHex(c)) {
                        _StdOut.putText("Invalid Program Input at index: " + i);
                        isValid = false;
                        break;
                    }
                }
            }
            
            let inputArray = programInput.split(" ");

            if (isValid) {
                _ProcessManager.createProcess(inputArray);
                console.log("Valid..");
            }
        }

        public shellRun(args) {
            if (args.length > 0 ) {
                let pid = args[0];
                console.log("Running PID: " + pid);
                
                let tempQueue: TSOS.Queue = new Queue();
                let pcbToRun: ProcessControlBlock = null;
                let pcbInQueue: boolean = false;

                // Grab the appropriate pcb from the wait queue 
                while (_ProcessManager.waitQueue.getSize() > 0) {
                    let waitQueuePcb = _ProcessManager.waitQueue.dequeue();
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
                    _StdOut.putText("PID not found");
                }
            }
            else {
                _StdOut.putText("Please supply PID");
            }
        }

        public shellClearMem(args) {
           _Memory.clearMemory();
        }

        public shellRunAll(args) {
           _ProcessManager.runAllProccesses();
        }

       public shellKill(args) {
          if (args.length > 0) {
            console.log("Killing process ", args[0] );
             _ProcessManager.killProcessByPid(args[0]);
          } else {
             _StdOut.putText("Usage: kill <PID> - Please supply a PID");
          }
       }


    }
}


