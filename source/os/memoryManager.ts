
    module TSOS {
        export class MemoryManager { 
            constructor(
                public memorySpace = [0],
                public pidMemoryLoc = [-1],
                public executedPid = [],
                public opIndex = 0
            ){};      
    
        public loadProgram(program): void {
            for (let i = 0; i < program.length; i++) {
                _Memory.memoryStorage[i] = program[i];
                console.log( _Memory.memoryStorage[i]);
            }
        }

        public checkMemorySpace(programLength:number): boolean {
            return programLength <= _Memory.memoryStorage.length;
        }

        public createProcess(program): void {
            if (this.checkMemorySpace(program.length)) {
                let pcb = new ProcessControlBlock(_PID);
                _PID++;
                this.loadProgram(program);
                _StdOut.putText("Program loaded to memory with PID " + pcb.getPID);
            }
            else {
                _StdOut.putText("Program not loaded to memory, too big");
            }
        }

        }

    }