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

            let tsb = this.krnGetFileBlock(fileName);
            let currTSBdata = _HDD.readFromHDD(tsb);
            let currTSBdataArray = currTSBdata.split("");
            tsb = '';
            tsb += currTSBdataArray[1];
            tsb += currTSBdataArray[2];
            tsb += currTSBdataArray[3];
            
            let copyOfTsb = tsb;
            let tsbArr = [copyOfTsb];

            while(true) {
               let tsbData = _HDD.readFromHDD(copyOfTsb);
               if ( tsbData.split("")[1] != "-") {
                  copyOfTsb = "";
                  copyOfTsb += tsbData.split("")[1];
                  copyOfTsb += tsbData.split("")[2];
                  copyOfTsb += tsbData.split("")[3];
                  tsbArr.push(copyOfTsb)
               }
               else {
                  break;
               }
            }

            if (tsbArr.length != 0) {
               for (let i = 0; i < tsbArr.length; i++) {
                  this.krnClearTSB(tsbArr[i]);
               }
            }

            let hexIndex = 0;

            for (let i = 0; i < linkCount; i++) {
               currTSBdata = _HDD.readFromHDD(tsb);
               currTSBdataArray = currTSBdata.split("");
               currTSBdataArray[0] = "1";
               _HDD.writeToHDD(tsb, currTSBdataArray.join(""));
               let inputData = "1";
               inputData += (i === linkCount-1) ? "---" : this.krnGetNewBlock();

               for (let j = 0; j < 60; j++) {
                  if (hexIndex >= fileDataHexArray.length) {
                     inputData += "0";
                  }
                  else {
                     inputData += fileDataHexArray[hexIndex];
                     hexIndex++;
                  }
               }
               _HDD.writeToHDD(tsb, inputData);
               tsb = this.krnGetNewBlock();
            }
            /**
             * UPDATE HTML HERE
             */
         }

         public krnFSReadFile(fileName): string {
            let tsb = this.krnGetFileBlock(fileName);
            let fileArray = _HDD.readFromHDD(tsb).split("");
            
            let data = "";
            data += fileArray[1];
            data += fileArray[2];
            data += fileArray[3];
            
            let dataArray = [data];
            while (true) {
               let tmpData = _HDD.readFromHDD(tsb);
               if (tmpData.split("")[1] != "-") {
                  data = "";
                  data += tmpData.split("")[1];
                  data += tmpData.split("")[2];
                  data += tmpData.split("")[3];
                  dataArray.push(data);
               }
               else {
                  break;
               }
            }

            let hexDataArray = [];
            for (let i = 0; i < hexDataArray.length; i++) {
               hexDataArray.push(_HDD.readFromHDD(dataArray[i].split("").slice(4)));
            }

            let hexDataString = "";
            for (let i = 0; i < hexDataArray.length; i++) {
               for (let j = 0; j < hexDataArray[i].length; j++) {
                  hexDataString += hexDataArray[i][j];
               }
            }
            
            let finalDataString = ""
            for (let i = 0; i < hexDataString.length; i += 2) {
               if (hexDataString.substring(i, i+2) == "00") {
                  break;
               }
               finalDataString += String.fromCharCode(parseInt(hexDataString.substring(i, i+2), 16));
            }
            return finalDataString;

         }

         public krnClearTSB(tsb) {
            let data = "";
            for (let i = 0; i < 64; i++) {
               data += (i >= 1 && i <= 3) ? "-" : "0";
            }
            _HDD.writeToHDD(tsb, data);
         }

         public krnGetNewBlock() {
            let start = 0;
            for (let i = 0; i < _HDD.tsbArray.length; i ++ ) {
               start = _HDD.tsbArray[i] == "100" ? i : 0;
               if (_HDD.tsbArray[i] == "100")
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
      