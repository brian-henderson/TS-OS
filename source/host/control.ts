///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
///<reference path="memory.ts" />
///<reference path="../os/memoryManager.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }

            function formatTime(t)
            {
                if (t < 10)
                {
                    t = "0" + t;
                }
                return t;
            }
            
            function displayTime()
            {
                var now = new Date();
                var y = now.getFullYear();
                var mo = formatTime(now.getMonth());
                var d = formatTime(now.getDate());
                var h = now.getHours();
                var m = formatTime(now.getMinutes());
                var s = formatTime(now.getSeconds());
                document.getElementById('timeDisplay').innerHTML = y + "-" + mo + "-" + d + " " + h + ":" + m + ":" + s ;
                var timeout = setTimeout(displayTime, 500);
            }
            
            displayTime();


        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            Utils.setStatus("Kinda Hungry");

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnSingleStep")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.


            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

            console.log("memory please be populated");
            _Control.updateMemoryDisplay();

        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnSingleStep_click(btn): void {
            if (_SingleStep) {
                (<HTMLButtonElement>document.getElementById("btnSingleStep")).value = "Single Step: Off";
                (<HTMLButtonElement>document.getElementById("btnSSExecute")).disabled = true;
                _SingleStep = false;  
                console.log("Setting Single Step to " + _SingleStep);
            }
            else {
                (<HTMLButtonElement>document.getElementById("btnSingleStep")).value = "Single Step: On";
                (<HTMLButtonElement>document.getElementById("btnSSExecute")).disabled = false;
                _SingleStep = true;
                console.log("Setting Single Step to " + _SingleStep);
            }
        }

        public static hostBtnSSExecute_click(btn): void {
            _CPU.isExecuting = true;
        }

        public updateMemoryDisplay(): void {
            let table = (<HTMLTableElement>document.getElementById("tableMemoryDisplay"));
            table.innerHTML = "";
            let memIndex = 0;
            // populate table using i as hex decimal converter/counter
            for (let i = 0; i < _MemorySize; i+=8) {
                
                let memHexLoc = i.toString(16);
                if (memHexLoc.length == 1) {
                    memHexLoc = "0" + memHexLoc;
                }
                if (memHexLoc.length == 2) {
                    memHexLoc = "00" + memHexLoc;
                }
                // dividing by 8 to get back to base 1
                let row = table.insertRow(i/8);
                // memory location
                row.insertCell(0).innerHTML = "0x" + memHexLoc;
                // index of memory storage
                for (let j = 1; j < 9; j++) {
                    row.insertCell(j).innerHTML = _Memory.memoryStorage[memIndex];
                    row.cells[j].className = "memoryDisplayByte";
                    memIndex++; 
                }
                row.cells[0].className = "memoryDisplayHex";
            }

        }

        public addToPcbDisplay(pcb: ProcessControlBlock): void {
            console.log("Updating pcb display...");
            let table = (<HTMLTableElement>document.getElementById("tablePcbDisplay"));

            if (_PID == 0) {
                table.deleteRow(1);
            }
        
            let row = table.insertRow();
            //pid
            row.insertCell(0).innerHTML = pcb.pid.toString();
            // priority
            row.insertCell(1).innerHTML = pcb.priority.toString();
            // state
            row.insertCell(2).innerHTML = pcb.state;
            // pc
            row.insertCell(3).innerHTML = pcb.programCounter.toString();
            // ir
            row.insertCell(4).innerHTML = pcb.instructionReg;
            // acc
            row.insertCell(5).innerHTML = pcb.accumulator.toString();
            // x
            row.insertCell(6).innerHTML = pcb.X.toString();
            // y
            row.insertCell(7).innerHTML = pcb.Y.toString();
            // z
            row.insertCell(8).innerHTML = pcb.Z.toString();
            // location
            row.insertCell(9).innerHTML = pcb.location;
        }

    
        public updateCpuDisplay(): void {
            let table = (<HTMLTableElement>document.getElementById("tableCpuDisplay"));
            table.deleteRow(1);
            let row = table.insertRow(1);
            // PC
            row.insertCell(0).innerHTML = _CPU.PC.toString();
            // IR
            row.insertCell(1).innerHTML = _CPU.IR.toString();
            // ACC
            row.insertCell(2).innerHTML = _CPU.Acc.toString();
            // X
            row.insertCell(3).innerHTML = _CPU.Xreg.toString();
            // Y
            row.insertCell(4).innerHTML = _CPU.Yreg.toString();
            // Z
            row.insertCell(5).innerHTML = _CPU.Zflag.toString();

        }
    }
}
