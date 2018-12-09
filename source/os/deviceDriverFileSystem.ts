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

         

         public krnFSCreateFile(fileName) {
            let fileNameCharArray = fileName.split("");
            let fileNameHexArray = new Array();
            for (let i = 0; i < fileNameCharArray.length; i ++) {
               fileNameHexArray.push(fileNameCharArray[i].charCodeAt(0).toString(16));
            }

            for (let i = 0; i < 999; i++) {
               let tsb = _HDD.tsbArray[i];
               let validBitStatus = _HDD.readFromHDD(tsb).split("")[0];
               
               if (tsb == "100") {
                  // files full --- do something 
                  return -1;
               }

               if (validBitStatus == "1" && i > 0) {
                  let fileData = _HDD.readFromHDD(tsb).split("").splice(4);
                  let dataCheck = '';

                  for (let j = 0; j < fileNameHexArray.length; j++) {
                     dataCheck += fileNameHexArray[j];
                  }

                  for (let k = dataCheck.length-1; k < 59; k++ ) {
                     dataCheck += '0';
                  }

                  if (fileData.join("") == dataCheck) {
                     return 0;
                  }
               }
               else if (validBitStatus == "0" && i > 0) {
                  let newDataTSB = this.krnGetNewBlock();
                  let newData = _HDD.readFromHDD(newDataTSB);
                  let newDataArr = newData.split("");
                  newDataArr[0] = "1";
                  newData = newDataArr.join("");
                  _HDD.writeToHDD(newDataTSB, newData);
                  let fileData = "1" + newDataTSB;
                  for (let i = 0; i < fileNameHexArray.length; i++) {
                     fileData += fileNameHexArray[i];
                  }
                  for (let i = fileData.length-1; i < 63; i++) {
                     fileData += "0";
                  }
                  _HDD.writeToHDD(tsb, fileData);
                  /**
                   * UPDATE HTML HERE
                   */
                  return 1;
               }
            }
          }

         public krnFSWriteFile(fileName, fileData): void {
            let data = fileData.split("");
            let fileDataHexArray = new Array();
            for (let i = 0; i < fileData.length; i++) {
               fileDataHexArray.push(data[i].charCodeAt(0).toString(16));
            }
            let fileDataHexString = fileDataHexArray.join("");
            let linkCount = fileDataHexString.length > 0 ? Math.ceil(fileDataHexString.length/60) : 1;
            fileDataHexArray = fileDataHexString.split("");

            let tsb = this.krnGetNewBlock()

         }

         public krnFSReadFile(): void {
                 
         }

         public krnGetNewBlock() {
            let start = 0;
            for (let i = 0; i < _HDD.tsbArray.length; i ++ ) {
               start = _HDD.tsbArray[i] == "100" ? i : 0;
               break;
            }
            for (let i = start; _HDD.tsbArray.length; i++) {
               if (_HDD.readFromHDD(_HDD.tsbArray[i].split("")[0] == "0")) {
                  return _HDD.tsbArray[i];
               }
            }
         }

         public krnGetFileBlock(fileName) {
            let newFileName = fileName.split("");
            let fileDataHexArray = new Array();
            for (let i = 0; i < newFileName.length; i++) {
               fileDataHexArray.push(newFileName[i].charCodeAt(0).toString(16));
            }

            for (let i = 0; i < _HDD.tsbArray.length; i++) {
               let tsb = _HDD.tsbArray[i];
               let data = _HDD.readFromHDD(tsb).split("").slice(4);
               let dataCheck = "";
               for (let j = 0; j < fileDataHexArray.length; j++) {
                  dataCheck += fileDataHexArray[i];
               }
               for (let j = dataCheck.length-1; j < 59; j++) {
                  dataCheck += "0";
               }
               if (data.join("") == dataCheck) {
                  return tsb;
               }
            }


         }



        
  
      }
  }
      