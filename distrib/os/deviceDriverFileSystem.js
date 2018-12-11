///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends Device Driver
    var DeviceDriverFS = /** @class */ (function (_super) {
        __extends(DeviceDriverFS, _super);
        function DeviceDriverFS(formatted) {
            if (formatted === void 0) { formatted = false; }
            var _this = _super.call(this) || this;
            _this.formatted = formatted;
            _this.driverEntry = _this.krnFSDriverEntry;
            return _this;
        }
        DeviceDriverFS.prototype.krnFSDriverEntry = function () {
            this.status = "loaded";
        };
        DeviceDriverFS.prototype.concatTSB = function (t, s, b) {
            return t.toString() + s.toString() + b.toString();
        };
        DeviceDriverFS.prototype.getEmptyTSB = function () {
            var emptyTSB = '';
            for (var i = 0; i < 64; i++) {
                if (i >= 1 && i <= 3) {
                    emptyTSB += '-';
                }
                else {
                    emptyTSB += '0';
                }
            }
            return emptyTSB;
        };
        DeviceDriverFS.prototype.krnFSFormat = function () {
            var inititalTSB = "1---MASTER_BOOT_RECORD";
            var track = 0;
            var sector = 0;
            var block = 0;
            var tsb = this.concatTSB(track, sector, block);
            var emptyTSB = '';
            for (var i = 0; i < 64; i++) {
                if (i >= 1 && i <= 3) {
                    emptyTSB += '-';
                }
                else {
                    emptyTSB += '0';
                }
            }
            if (this.formatted) {
                _HDD.writeToHDD("000", inititalTSB);
                for (var i = 0; i < _HDD.tsbArray.length; i++) {
                    _HDD.writeToHDD(i, emptyTSB);
                }
                /**
                 * Check processes of ready queue in the resident list
                */
            }
            else {
                for (var i = 0; i <= 999; i++) {
                    // check to make sure not invalid TSB
                    if (track == 3 && sector == 7 && block == 8) {
                        break;
                    }
                    // check if tsb is the initial one
                    if (track == 0 && sector == 0 && block == 0) {
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
                        block++;
                    }
                }
                this.initHDDdisplay();
                this.formatted = true;
            }
        };
        DeviceDriverFS.prototype.krnFSCreateFile = function (fileName) {
            var fileNameCharArray = fileName.split("");
            var fileNameHexArray = new Array();
            for (var i = 0; i < fileNameCharArray.length; i++) {
                fileNameHexArray.push(fileNameCharArray[i].charCodeAt(0).toString(16));
            }
            for (var i = 0; i < 999; i++) {
                var tsb = _HDD.tsbArray[i];
                var validBitStatus = _HDD.readFromHDD(tsb).split("")[0];
                if (tsb == "100") {
                    // files full --- do something 
                    return -1;
                }
                if (validBitStatus == "1" && i > 0) {
                    var fileData = _HDD.readFromHDD(tsb).split("").splice(4);
                    var dataCheck = '';
                    for (var j = 0; j < fileNameHexArray.length; j++) {
                        dataCheck += fileNameHexArray[j];
                    }
                    for (var k = dataCheck.length - 1; k < 59; k++) {
                        dataCheck += '0';
                    }
                    if (fileData.join("") == dataCheck) {
                        return 0;
                    }
                }
                else if (validBitStatus == "0" && i > 0) {
                    var newDataTSB = this.krnGetNextFreeBlock();
                    var newData = _HDD.readFromHDD(newDataTSB);
                    var newDataArr = newData.split("");
                    newDataArr[0] = "1";
                    newData = newDataArr.join("");
                    _HDD.writeToHDD(newDataTSB, newData);
                    var fileData = "1" + newDataTSB;
                    for (var i_1 = 0; i_1 < fileNameHexArray.length; i_1++) {
                        fileData += fileNameHexArray[i_1];
                    }
                    for (var i_2 = fileData.length - 1; i_2 < 63; i_2++) {
                        fileData += "0";
                    }
                    _HDD.writeToHDD(tsb, fileData);
                    this.updateHDDdisplay();
                    console.log("created filename: " + fileName);
                    return 1;
                }
            }
        };
        DeviceDriverFS.prototype.krnFSWriteFile = function (fileName, fileData) {
            var data = fileData.split("");
            var fileDataHexArray = [];
            for (var i = 0; i < fileData.length; i++) {
                fileDataHexArray.push(data[i].charCodeAt(0).toString(16));
            }
            var fileDataHexString = fileDataHexArray.join("");
            var linkCount = fileDataHexString.length > 0 ? Math.ceil(fileDataHexString.length / 60) : 1;
            fileDataHexArray = fileDataHexString.split("");
            var tsb = this.krnGetFileBlock(fileName);
            var currTSBdata = _HDD.readFromHDD(tsb);
            var currTSBdataArray = currTSBdata.split("");
            tsb = '';
            tsb += currTSBdataArray[1];
            tsb += currTSBdataArray[2];
            tsb += currTSBdataArray[3];
            var copyOfTsb = tsb;
            var tsbArr = [copyOfTsb];
            while (true) {
                var tsbData = _HDD.readFromHDD(copyOfTsb);
                if (tsbData.split("")[1] != "-") {
                    copyOfTsb = "";
                    copyOfTsb += tsbData.split("")[1];
                    copyOfTsb += tsbData.split("")[2];
                    copyOfTsb += tsbData.split("")[3];
                    tsbArr.push(copyOfTsb);
                }
                else {
                    break;
                }
            }
            // clear the tsb
            if (tsbArr.length != 0) {
                for (var i = 0; i < tsbArr.length; i++) {
                    this.krnClearTSB(tsbArr[i]);
                }
            }
            var hexIndex = 2;
            for (var i = 0; i < linkCount; i++) {
                console.log("link count = " + linkCount);
                //console.log("lc:"  + linkCount)
                currTSBdata = _HDD.readFromHDD(tsb);
                var TSBdataArray = currTSBdata.split("");
                TSBdataArray[0] = "1";
                _HDD.writeToHDD(tsb, TSBdataArray.join(""));
                var inputData = "1";
                inputData += (i === linkCount - 1) ? "---" : this.krnGetNextFreeBlock();
                //console.log(inputData);
                for (var j = 0; j < 60; j++) {
                    if (hexIndex >= fileDataHexArray.length) {
                        inputData += "0";
                    }
                    else {
                        inputData += fileDataHexArray[hexIndex];
                        hexIndex++;
                    }
                }
                console.log("writing to tsb: " + tsb);
                console.log("with data: " + inputData);
                _HDD.writeToHDD(tsb, inputData);
                tsb = this.krnGetNextFreeBlock();
            }
            this.updateHDDdisplay();
        };
        DeviceDriverFS.prototype.krnFSReadFile = function (fileName) {
            var dataArray = this.getTSBDataBlock(fileName);
            var hexDataArray = [];
            for (var i = 0; i < dataArray.length; i++) {
                //console.log("data array: " + dataArray[i]);
                //console.log('to push: ' + _HDD.readFromHDD(dataArray[i]).split("").slice(4));
                hexDataArray.push(_HDD.readFromHDD(dataArray[i]).split("").slice(4));
            }
            //console.log("hda: " + hexDataArray[0]);
            var hexDataString = "";
            for (var i = 0; i < hexDataArray.length; i++) {
                for (var j = 0; j < hexDataArray[i].length; j++) {
                    hexDataString += hexDataArray[i][j];
                }
            }
            //console.log("hexDataString: " + hexDataString);
            var finalDataString = "";
            for (var i = 0; i < hexDataString.length; i += 2) {
                if (hexDataString.substring(i, i + 2) == "00") {
                    break;
                }
                finalDataString += String.fromCharCode(parseInt(hexDataString.substring(i, i + 2), 16));
            }
            //console.log("fds: " + finalDataString);
            return finalDataString;
        };
        DeviceDriverFS.prototype.getTSBDataBlock = function (fileName) {
            var tsbFileBlock = this.krnGetFileBlock(fileName);
            var fileArray = _HDD.readFromHDD(tsbFileBlock).split("");
            var data = "";
            data += fileArray[1];
            data += fileArray[2];
            data += fileArray[3];
            var dataArray = [data];
            while (true) {
                var tmpData = _HDD.readFromHDD(data);
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
        };
        DeviceDriverFS.prototype.krnFSDeleteFile = function (fileName) {
            var dataArray = this.getTSBDataBlock(fileName);
            for (var i = 0; i < dataArray.length; i++) {
                this.krnClearTSB(dataArray[i]);
            }
            this.updateHDDdisplay();
        };
        DeviceDriverFS.prototype.krnFSList = function () {
            var tsbFiles = new Array();
            for (var i = 0; i < _HDD.tsbArray.length; i++) {
                if (_HDD.tsbArray[i] == "100") {
                    break;
                }
                tsbFiles.push(_HDD.tsbArray[i]);
            }
            console.log("tsb files:" + tsbFiles);
            var activeFileNames = [];
            for (var i = 0; i < tsbFiles.length; i++) {
                if (_HDD.readFromHDD(tsbFiles[i]).split("")[0] == "1") {
                    var name_1 = "";
                    var hexString = _HDD.readFromHDD(tsbFiles[i]).split("").slice(4).join("");
                    //console.log("hex string: " + hexString);
                    for (var j = 0; j < hexString.length; j += 2) {
                        name_1 += String.fromCharCode(parseInt(hexString.substring(j, j + 2), 16));
                    }
                    activeFileNames.push(name_1);
                }
            }
            if (activeFileNames.length != 0) {
                for (var i = 1; i < activeFileNames.length; i++) {
                    //console.log("active file name: " + activeFileNames[i]);
                    _StdOut.putResponseText(activeFileNames[i]);
                    if (i != activeFileNames.length - 1) {
                        _StdOut.advanceLine();
                    }
                }
            }
            else {
                _StdOut.putText("No Files in the Hard Drive");
            }
        };
        DeviceDriverFS.prototype.krnClearTSB = function (tsb) {
            var data = "";
            for (var i = 0; i < 64; i++) {
                data += (i >= 1 && i <= 3) ? "-" : "0";
            }
            console.log('clearing:');
            console.log(tsb, data);
            _HDD.writeToHDD(tsb, data);
        };
        DeviceDriverFS.prototype.krnGetNextFreeBlock = function () {
            var start = 0;
            for (var i = 0; i < _HDD.tsbArray.length; i++) {
                //start = _HDD.tsbArray[i] == "100" ? i : 0;
                if (_HDD.tsbArray[i] == "100") {
                    start = i;
                    break;
                }
            }
            for (var i = start; i < _HDD.tsbArray.length; i++) {
                //console.log("Outside: " + _HDD.tsbArray[i].split("")[0]);
                //console.log("Outside readding hdd: " + _HDD.readFromHDD(_HDD.tsbArray[i].split("")[0]));
                if (_HDD.readFromHDD(_HDD.tsbArray[i]).split("")[0] == "0") {
                    // console.log("Inner: " + _HDD.tsbArray[i].split("")[0]);
                    // console.log("Return: " +_HDD.tsbArray[i]);
                    return _HDD.tsbArray[i];
                }
            }
        };
        DeviceDriverFS.prototype.krnGetFileBlock = function (fileName) {
            var name = fileName.split("");
            var fileNameHexArray = [];
            // creates an array of the file name into hex chars
            for (var i = 0; i < name.length; i++) {
                fileNameHexArray.push(name[i].charCodeAt(0).toString(16));
            }
            for (var i = 0; i < _HDD.tsbArray.length; i++) {
                var tsb = _HDD.tsbArray[i];
                var data = _HDD.readFromHDD(tsb).split("").slice(4);
                var dataCheck = "";
                for (var j = 0; j < fileNameHexArray.length; j++) {
                    dataCheck += fileNameHexArray[j];
                }
                for (var j = dataCheck.length - 1; j < 59; j++) {
                    dataCheck += "0";
                }
                if (data.join("") == dataCheck) {
                    return tsb;
                }
            }
        };
        DeviceDriverFS.prototype.initHDDdisplay = function () {
            var table = document.getElementById("tableHDD");
            var t = 0;
            var s = 0;
            var b = 0;
            var index = 1;
            while (!(t == 3 && s == 7 && b == 8)) {
                var row = table.insertRow(index);
                var tsbCell = row.insertCell(0);
                var dataCell = row.insertCell(1);
                if (b == 8) {
                    s++;
                    b = 0;
                }
                if (s == 8) {
                    t++;
                    s = 0;
                    b = 0;
                }
                var tsbFormatted = t.toString() + ":" + s.toString() + ":" + b.toString();
                tsbCell.innerHTML = tsbFormatted;
                var tsb = this.concatTSB(t, s, b);
                dataCell.innerHTML = _HDD.readFromHDD(tsb);
                b++;
                index++;
            }
        };
        DeviceDriverFS.prototype.updateHDDdisplay = function () {
            var table = document.getElementById("tableHDD");
            for (var i = 0; i < _HDD.tsbArray.length; i++) {
                var row = table.getElementsByTagName("tr")[i + 1];
                var tsb = _HDD.tsbArray[i];
                row.cells[1].innerHTML = _HDD.readFromHDD(tsb);
            }
        };
        DeviceDriverFS.prototype.krnRollOut = function (pcb, program) {
            var programData = program.join("");
            var programDataArray = programData.split("");
            console.log("PD:" + programData);
            console.log("PD::" + programData.length);
            if (pcb.location === "MEMORY") {
                _MemoryManager.freePartition(pcb.partitionIndex);
            }
            var tsb = this.krnGetNextFreeBlock();
            pcb.hddTSB = tsb;
            pcb.location = "HDD";
            _HDD.writeToHDD(pcb.hddTSB, this.getEmptyTSB());
            var linkCount = programData.length > 0 ? Math.ceil(programData.length / 60) : 1;
            console.log("link count: " + linkCount);
            var hexIndex = 0;
            for (var i = 0; i < linkCount; i++) {
                var inputData = "1";
                inputData += (i === linkCount - 1) ? "---" : this.krnGetNextFreeBlock();
                for (var j = 0; j < 60; j++) {
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
            console.log(pcb.hddTSB);
            this.updateHDDdisplay();
        };
        DeviceDriverFS.prototype.krnRollIn = function (pcb) {
            var tsb = pcb.hddTSB;
            var program = "";
            while (tsb != "---") {
                var tsbData = _HDD.readFromHDD(tsb);
                program += tsbData.slice(4);
                tsb = tsbData.slice(1, 4) != "---" ? this.getNextTSB(tsb) : "---";
            }
            program = program.substring(0, 512);
            if (program.length % 2 != 0) {
                program += "0";
            }
            var programArray = [];
            for (var i = 0; i < program.length; i += 2) {
                var instruction = program.charAt(i) + program.charAt(i + 1);
                programArray.push(instruction);
            }
            console.log(programArray);
            pcb.location = "MEMORY";
            pcb.hddTSB = null;
            _MemoryManager.loadProgramFromHDD(pcb, programArray);
        };
        DeviceDriverFS.prototype.getNextTSB = function (tsb) {
            var t = tsb.charAt(0);
            var s = tsb.charAt(1);
            var b = tsb.charAt(2);
            if (b == 7) {
                s++;
                b = 0;
            }
            else {
                b++;
            }
            if (s == 7) {
                t++;
                s = 0;
                b = 0;
            }
            return this.concatTSB(t, s, b);
        };
        return DeviceDriverFS;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFS = DeviceDriverFS;
})(TSOS || (TSOS = {}));
