///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

   module TSOS {

      // Extends Device Driver
      export class DeviceDriverFS extends DeviceDriver {
         
         constructor ( public formatted: boolean = false ) {
            super();
            this.driverEntry = this.krnFSDriverEntry();
         }

         public krnFSDriverEntry(): void {
            this.status = "loaded";
         }

         public krnFSFormat(): void {
            let inititalTSB: string = "1---MBR";
            let track: number = 0;
            let sector: number = 0;
            let block: number = 0;
            let tsb = track.toString() + sector.toString() + block.toString();
            let emptyTSB: string = '';

            for (let i = 0; i < 64; i++) {
               if (i >= 1 && i <= 3) {
                  emptyTSB += '-';
               }
               else {
                  emptyTSB += '0';
               }
            }

            



         }



        
  
      }
  }
      