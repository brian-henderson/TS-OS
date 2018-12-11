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

         public getEmptyTSB(): string {
            let emptyTSB: string = '';

            for (let i = 0; i < 64; i++) {
               if (i >= 1 && i <= 3) {
                  emptyTSB += '-';
               }
               else {
                  emptyTSB += '0';
               }
            }
            return emptyTSB;

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
                  let newDataTSB = this.krnGetNextFreeBlock();
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
            let data = fileData.split("");
            let fileDataHexArray = [];

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

            // clear the tsb
            if (tsbArr.length != 0) {
               for (let i = 0; i < tsbArr.length; i++) {
                  this.krnClearTSB(tsbArr[i]);
               }
            }
            let hexIndex = 2;
            
            for (let i = 0; i < linkCount; i++) {
               //console.log("lc:"  + linkCount)
               currTSBdata = _HDD.readFromHDD(tsb);
               let TSBdataArray = currTSBdata.split("");
               TSBdataArray[0] = "1";
               _HDD.writeToHDD(tsb, TSBdataArray.join(""));
               
               let inputData = "1";
               inputData += (i === linkCount-1) ? "---" : this.krnGetNextFreeBlock();
               //console.log(inputData);
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
               tsb = this.krnGetNextFreeBlock();
            }
            this.updateHDDdisplay();
         }

         public krnFSReadFile(fileName): string {

            let dataArray = this.getTSBDataBlock(fileName);

            let hexDataArray = [];
            for (let i = 0; i < dataArray.length; i++) {
               //console.log("data array: " + dataArray[i]);
               //console.log('to push: ' + _HDD.readFromHDD(dataArray[i]).split("").slice(4));
               hexDataArray.push(_HDD.readFromHDD(dataArray[i]).split("").slice(4));
            }
            //console.log("hda: " + hexDataArray[0]);

            let hexDataString = "";
            for (let i = 0; i < hexDataArray.length; i++) {
               for (let j = 0; j < hexDataArray[i].length; j++) {
                  hexDataString += hexDataArray[i][j];
               }
            }
            //console.log("hexDataString: " + hexDataString);
            
            let finalDataString = ""
            for (let i = 0; i < hexDataString.length; i += 2) {
               if (hexDataString.substring(i, i+2) == "00") {
                  break;
               }
               finalDataString += String.fromCharCode(parseInt(hexDataString.substring(i, i+2), 16));
            }
            //console.log("fds: " + finalDataString);
            return finalDataString;

         }

         public getTSBDataBlock(fileName): string[] {
           let tsbFileBlock = this.krnGetFileBlock(fileName);
           let fileArray = _HDD.readFromHDD(tsbFileBlock).split("");

           let data = "";
           data += fileArray[1];
           data += fileArray[2];
           data += fileArray[3];
           
           let dataArray = [data];

           while (true) {
              let tmpData = _HDD.readFromHDD(data);
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
           return dataArray;

         }


         public krnFSDeleteFile(fileName) {
     
          let dataArray = this.getTSBDataBlock(fileName);

            for (let i = 0; i < dataArray.length; i++) {
               this.krnClearTSB(dataArray[i]);
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

            let activeFileNames = [];
            for (let i = 0; i < tsbFiles.length; i++) {
               if (_HDD.readFromHDD(tsbFiles[i]).split("")[0] == "1") {
                  let name = "";
                  let hexString = _HDD.readFromHDD(tsbFiles[i]).split("").slice(4).join("");
                  //console.log("hex string: " + hexString);
                  for (let j = 0; j < hexString.length; j+= 2) {
                     name += String.fromCharCode(parseInt(hexString.substring(j, j+2), 16))
                  }
                  activeFileNames.push(name);
               }
            }

            if (activeFileNames.length != 0) {
               for (let i = 1; i < activeFileNames.length; i++) {
                  //console.log("active file name: " + activeFileNames[i]);
                  _StdOut.putResponseText(activeFileNames[i]);
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

         public krnGetNextFreeBlock() {
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

         public krnGetFileBlock(fileName): string {
            let name = fileName.split("");
            let fileNameHexArray = [];
            
            // creates an array of the file name into hex chars
            for (let i = 0; i < name.length; i++) {
               fileNameHexArray.push(name[i].charCodeAt(0).toString(16));
            }

            for (let i = 0; i < _HDD.tsbArray.length; i++) {
               let tsb = _HDD.tsbArray[i];
               let data = _HDD.readFromHDD(tsb).split("").slice(4);
               
               let dataCheck = "";
               for (let j = 0; j < fileNameHexArray.length; j++) {
                  dataCheck += fileNameHexArray[j];
               }
               
               for (let j = dataCheck.length-1; j < 59; j++) {
                  dataCheck += "0";
               }

               if (data.join("") == dataCheck) {
                  return tsb;
               }

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


         // WRITE TO HARDDRIVE
         public krnRollOut(pcb: ProcessControlBlock, program) {
            let programData = program.join("");
            let programDataArray = programData.split("");

            if (pcb.location === "MEMORY") {
               _MemoryManager.freePartition(pcb.partitionIndex);
            }

            let tsb = this.krnGetNextFreeBlock();
            pcb.hddTSB = tsb;
            pcb.location = "HDD";

            _HDD.writeToHDD(pcb.hddTSB, this.getEmptyTSB());

            let linkCount = programData.length > 0 ? Math.ceil(programData.length/60) : 1;
            let hexIndex = 0;
            for (let i = 0; i < linkCount; i++) {
               let inputData = "1";
               inputData += (i === linkCount-1) ? "---" : this.krnGetNextFreeBlock();

               for (let j = 0; j < 60; j++) {
                  if (hexIndex >= programDataArray.length) {
                     inputData += "0";
                  }
                  else {
                     inputData += programDataArray[hexIndex];
                     hexIndex++;
                  }
               }
               _HDD.writeToHDD(tsb, inputData);
               tsb = this.krnGetNextFreeBlock();
            }
            console.log("writing data to tsb: " + pcb.hddTSB);
            _Control.updatePcbDisplay(pcb);
            this.updateHDDdisplay();
            
         }

         // GET PCB FROM HARDDRIVE AND PUT IN MEMORY
         public krnRollIn(pcb: ProcessControlBlock): void {
            let tsb = pcb.hddTSB;
            let program = "";
            while (tsb != "---") {
               let tsbData = _HDD.readFromHDD(tsb);
               program += tsbData.slice(4);
               tsb = tsbData.slice(1, 4) != "---" ? this.getNextTSB(tsb) : "---";
            }
            program = program.substring(0, 512);
            
            if (program.length % 2 != 0) {
               program += "0";
            }

            let programArray = [];
            for (let i = 0; i < program.length; i+=2) {
               let instruction = program.charAt(i) + program.charAt(i+1);
               programArray.push(instruction);
            }
         
            pcb.location = "MEMORY";
            pcb.hddTSB = null;
            //console.log("Part")
            _MemoryManager.loadProgramFromHDD(pcb, programArray);
            _Control.updatePcbDisplay(pcb);
            
         }

         public getNextTSB(tsb): string {
            let t = tsb.charAt(0);
            let s = tsb.charAt(1);
            let b = tsb.charAt(2);

            if (b == 7) {
               s ++;
               b = 0;
            }
            else {
               b++;
            }
            
            if (s == 7) {
               t ++;
               s = 0;
               b = 0;
            }

            return this.concatTSB(t, s, b);
         }

      }
  }