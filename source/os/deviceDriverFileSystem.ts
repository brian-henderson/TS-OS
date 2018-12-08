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

         public concatTSB(t, s, b): string {
            return t.toString() + s.toString() + b.toString();
         }

         public krnFSFormat(): void {
            let inititalTSB: string = "1---MBR";
            let track: number = 0;
            let sector: number = 0;
            let block: number = 0;
            let tsb = this.concatTSB(track, sector, block);
            let emptyTSB: string = '';

            for (let i = 0; i < 64; i++) {
               if (i >= 1 && i <= 3) {
                  emptyTSB += '-';
               }
               else {
                  emptyTSB += '0';
               }
            }

            if (this.formatted) {
               _HDD.writeToHDD("000", inititalTSB);
               for(let i = 0; i < _HDD.tsbArray.length; i++) {
                  _HDD.writeToHDD(i, emptyTSB);
               }
               /**
                * Check processes of ready queue in the resident list
               */ 
            }
            else {
               for (let i = 0; i <= 999; i++) {
                  // check to make sure not invalid TSB
                  if (track == 3 && sector == 7 && block == 8) {
                     break;
                  }
                  // check if tsb is the initial one
                  if (track == 0 && sector == 0 && block ==0) {
                     _HDD.writeToHDD(tsb, inititalTSB);
                     _HDD.tsbArray.push(tsb);
                     block++;
                  }
                  else {
                     if (block == 8) {
                        block = 0;
                        sector++;
                     }
                     if (sector == 8) {
                        block = 0;
                        sector = 0;
                        track++;
                     }
                     tsb = this.concatTSB(track, sector, block);
                     _HDD.tsbArray.push(tsb);
                     _HDD.writeToHDD(tsb, emptyTSB);
                     block ++;
                  }
               /**
                * Initialize HDD HTML table with data here from TSB
               */
               this.formatted = true;
               }
               /**
                * Update the HTML HDD table with all the tsbs that went through loop
               */
            }

            



         }



        
  
      }
  }
      