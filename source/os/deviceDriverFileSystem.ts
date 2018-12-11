///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

   module TSOS {

      // Extends Device Driver
      export class DeviceDriverFS extends DeviceDriver {
         
         constructor ( public formatted: boolean = false ) {
            super();
            this.driverEntry = this.krnFSDriverEntry;
         }
         
         public krnFSDriverEntry(): void {
            this.status = "loaded";
         }

         public concatTSB(t, s, b): string {
            return t.toString() + s.toString() + b.toString();
         }

         public krnFSFormat(): void {
            let inititalTSB: string = "1---MASTER_BOOT_RECORD";
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
               }
               this.initHDDdisplay();
               this.formatted = true;
            }

         }

         public krnFSCreateFile(fileName): number {
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
                  this.updateHDDdisplay();
                  return 1;
               }
            }
          }

         public krnFSWriteFile(fileName, fileData): void {
            console.log("FD: " + fileData);
            let data = fileData.split("");
            let fileDataHexArray = [];

            for (let i = 0; i < fileData.length; i++) {
               fileDataHexArray.push(data[i].charCodeAt(0).toString(16));
            }

            let fileDataHexString = fileDataHexArray.join("");
            console.log("Split string: " + fileDataHexString);
            let linkCount = fileDataHexString.length > 0 ? Math.ceil(fileDataHexString.length/60) : 1;
            fileDataHexArray = fileDataHexString.split("");
            console.log("arr string: " + fileDataHexArray);


            let tsb = this.krnGetFileBlock(fileName);
            console.log("tsb: " + tsb);
            let currTSBdata = _HDD.readFromHDD(tsb);
            console.log("currTSB data: " + currTSBdata);
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
            this.updateHDDdisplay();
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


         public krnFSDeleteFile(fileName) {
            let tsb = this.krnGetFileBlock(fileName);
            let fileDataArray = _HDD.readFromHDD(tsb).split("");
            
            let fileDataString = "";
            fileDataString += fileDataArray[1];
            fileDataString += fileDataArray[2];
            fileDataString += fileDataArray[3];

            let tsbDataArray = [tsb, fileDataString];
            while (true) {
               let fileData = _HDD.readFromHDD(tsb);
               if (fileData.split("")[1] != "-") {
                  fileDataString = "";
                  fileDataString += fileData.split("")[1];
                  fileDataString += fileData.split("")[2];
                  fileDataString += fileData.split("")[3];
                  tsbDataArray.push(fileDataString);
               }
               else {
                  break;
               }
            }

            for (let i = 0; i < tsbDataArray.length; i++) {
               this.krnClearTSB(tsbDataArray[i]);
            }
            this.updateHDDdisplay();
         }

         public krnFSList() {
            let tsbFiles = new Array();
            for (let i = 0; i < _HDD.tsbArray.length; i++) {
               if (_HDD.tsbArray[i] == "100") {
                  break;
               }
               tsbFiles.push(_HDD.tsbArray[i]);
            }

            let activeFileNames = new Array();
            for (let i = 0; i < tsbFiles.length; i++) {
               if (_HDD.readFromHDD(tsbFiles[i].split("")[0] == "1")) {
                  let name = "";
                  let hexString = _HDD.readFromHDD(tsbFiles[i]).split("").slice(4).join("");
                  for (let j = 0; j < hexString.length; j++) {
                     name += String.fromCharCode(parseInt(hexString.substring(j, j+2), 16))
                  }
                  activeFileNames.push(name);
               }
            }

            if (activeFileNames.length != 0) {
               for (let i = 0; i < activeFileNames.length; i++) {
                  _StdOut.putText(activeFileNames[i]);
                  if (i != activeFileNames.length-1) {
                     _StdOut.advanceLine();
                  }
               }
            }
            else {
               _StdOut.putText("No Files in the Hard Drive");
            }
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
               //start = _HDD.tsbArray[i] == "100" ? i : 0;
               if (_HDD.tsbArray[i] == "100") {
                  start = i;
                  break;
               }
            }

            for (let i = start; i < _HDD.tsbArray.length; i++) {
               //console.log("Outside: " + _HDD.tsbArray[i].split("")[0]);
               //console.log("Outside readding hdd: " + _HDD.readFromHDD(_HDD.tsbArray[i].split("")[0]));
               if (_HDD.readFromHDD(_HDD.tsbArray[i]).split("")[0] == "0") {
                 // console.log("Inner: " + _HDD.tsbArray[i].split("")[0]);
                 // console.log("Return: " +_HDD.tsbArray[i]);
                  return _HDD.tsbArray[i];
               }
            }
         }

         public krnGetFileBlock(fileName) {
            let newFileName = fileName.split("");
            console.log("nfn: " + newFileName)
            let fileDataHexArray = [];
            for (let i = 0; i < newFileName.length; i++) {
               fileDataHexArray.push(newFileName[i].charCodeAt(0).toString(16));
            }
            console.log("fileDataHexArray: " + fileDataHexArray)

            for (let i = 0; i < _HDD.tsbArray.length; i++) {
               console.log("----------------------------------");
               
               let tsb = _HDD.tsbArray[i];
               console.log("tsb:" + tsb);

               let data = _HDD.readFromHDD(tsb).split("").slice(4);
               console.log("data:" + data);
               
               let dataCheck = "";
               for (let j = 0; j < fileDataHexArray.length; j++) {
                  dataCheck += fileDataHexArray[i];
               }
               console.log("dataCheck:" + dataCheck);
               
               for (let j = dataCheck.length-1; j < 59; j++) {
                  dataCheck += "0";
               }
               
               console.log("dataCheck:" + dataCheck);
               console.log('data.join("")' + data.join(""));
               if (data.join("") == dataCheck) {
                  return tsb;
               }

            }

         }

         public logHardDrive(): void {

            for (let i = 0; i < _HDD.tsbArray.length; i ++) {
               let tsb = _HDD.tsbArray[i]
               let output = _HDD.readFromHDD(tsb);
              // console.log( tsb + "  " + output);
            }
         }

         public initHDDdisplay(): void {
            let table = (<HTMLTableElement>document.getElementById("tableHDD"));
            let t = 0; 
            let s = 0; 
            let b = 0;
            let index = 1;

            while ( ! (t == 3 && s == 7 && b == 8) ) {
               let row = table.insertRow(index);
               let tsbCell = row.insertCell(0);
               let dataCell = row.insertCell(1);

               if (b == 8) {
                  s ++;
                  b = 0;
               }
               
               if (s == 8) {
                  t ++;
                  s = 0;
                  b = 0;
               }

               let tsbFormatted = t.toString() + ":" + s.toString() + ":" + b.toString();
               tsbCell.innerHTML = tsbFormatted;
               let tsb = this.concatTSB(t, s, b);
               dataCell.innerHTML = _HDD.readFromHDD(tsb);
               
               b++;
               index++;
            }
         }

         public updateHDDdisplay(): void {
            let table = (<HTMLTableElement>document.getElementById("tableHDD"));
            for (let i = 0; i < _HDD.tsbArray.length; i ++) {
               let row = table.getElementsByTagName("tr")[i+1]
               let tsb = _HDD.tsbArray[i];
               row.cells[1].innerHTML = _HDD.readFromHDD(tsb);
            }

         }

      }
  }
      