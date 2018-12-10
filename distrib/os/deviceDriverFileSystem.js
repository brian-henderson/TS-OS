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
            _this.driverEntry = _this.krnFSDriverEntry();
            return _this;
        }
        DeviceDriverFS.prototype.krnFSDriverEntry = function () {
            this.status = "loaded";
        };
        DeviceDriverFS.prototype.concatTSB = function (t, s, b) {
            return t.toString() + s.toString() + b.toString();
        };
        DeviceDriverFS.prototype.krnFSFormat = function () {
            var inititalTSB = "1---MBR";
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
                    /**
                     * Initialize HDD HTML table with data here from TSB
                    */
                    this.formatted = true;
                }
                /**
                 * Update the HTML HDD table with all the tsbs that went through loop
                */
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
                    var newDataTSB = this.krnGetNewBlock();
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
                    /**
                     * UPDATE HTML HERE
                     */
                    return 1;
                }
            }
        };
        DeviceDriverFS.prototype.krnFSWriteFile = function (fileName, fileData) {
            var data = fileData.split("");
            var fileDataHexArray = new Array();
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
            if (tsbArr.length != 0) {
                for (var i = 0; i < tsbArr.length; i++) {
                    this.krnClearTSB(tsbArr[i]);
                }
            }
            var hexIndex = 0;
            for (var i = 0; i < linkCount; i++) {
                currTSBdata = _HDD.readFromHDD(tsb);
                currTSBdataArray = currTSBdata.split("");
                currTSBdataArray[0] = "1";
                _HDD.writeToHDD(tsb, currTSBdataArray.join(""));
                var inputData = "1";
                inputData += (i === linkCount - 1) ? "---" : this.krnGetNewBlock();
                for (var j = 0; j < 60; j++) {
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
        };
        DeviceDriverFS.prototype.krnFSReadFile = function (fileName) {
            var tsb = this.krnGetFileBlock(fileName);
            var fileArray = _HDD.readFromHDD(tsb).split("");
            var data = "";
            data += fileArray[1];
            data += fileArray[2];
            data += fileArray[3];
            var dataArray = [data];
            while (true) {
                var tmpData = _HDD.readFromHDD(tsb);
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
            var hexDataArray = [];
            for (var i = 0; i < hexDataArray.length; i++) {
                hexDataArray.push(_HDD.readFromHDD(dataArray[i].split("").slice(4)));
            }
            var hexDataString = "";
            for (var i = 0; i < hexDataArray.length; i++) {
                for (var j = 0; j < hexDataArray[i].length; j++) {
                    hexDataString += hexDataArray[i][j];
                }
            }
            var finalDataString = "";
            for (var i = 0; i < hexDataString.length; i += 2) {
                if (hexDataString.substring(i, i + 2) == "00") {
                    break;
                }
                finalDataString += String.fromCharCode(parseInt(hexDataString.substring(i, i + 2), 16));
            }
            return finalDataString;
        };
        DeviceDriverFS.prototype.krnFSDeleteFile = function (fileName) {
            var tsb = this.krnGetFileBlock(fileName);
            var fileDataArray = _HDD.readFromHDD(tsb).split("");
            var fileDataString = "";
            fileDataString += fileDataArray[1];
            fileDataString += fileDataArray[2];
            fileDataString += fileDataArray[3];
            var tsbDataArray = [tsb, fileDataString];
            while (true) {
                var fileData = _HDD.readFromHDD(tsb);
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
            for (var i = 0; i < tsbDataArray.length; i++) {
                this.krnClearTSB(tsbDataArray[i]);
            }
            /**
             * UDPDATE HTML CODE HERE
             */
        };
        DeviceDriverFS.prototype.krnFSList = function () {
            var tsbFiles = new Array();
            for (var i = 0; i < _HDD.tsbArray.length; i++) {
                if (_HDD.tsbArray[i] == "100") {
                    break;
                }
                tsbFiles.push(_HDD.tsbArray[i]);
            }
            var activeFileNames = new Array();
            for (var i = 0; i < tsbFiles.length; i++) {
                if (_HDD.readFromHDD(tsbFiles[i].split("")[0] == "1")) {
                    var name_1 = "";
                    var hexString = _HDD.readFromHDD(tsbFiles[i]).split("").slice(4).join("");
                    for (var j = 0; j < hexString.length; j++) {
                        name_1 += String.fromCharCode(parseInt(hexString.substring(j, j + 2), 16));
                    }
                    activeFileNames.push(name_1);
                }
            }
            if (activeFileNames.length != 0) {
                for (var i = 0; i < activeFileNames.length; i++) {
                    _StdOut.putText(activeFileNames[i]);
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
            _HDD.writeToHDD(tsb, data);
        };
        DeviceDriverFS.prototype.krnGetNewBlock = function () {
            var start = 0;
            for (var i = 0; i < _HDD.tsbArray.length; i++) {
                start = _HDD.tsbArray[i] == "100" ? i : 0;
                if (_HDD.tsbArray[i] == "100")
                    break;
            }
            for (var i = start; _HDD.tsbArray.length; i++) {
                if (_HDD.readFromHDD(_HDD.tsbArray[i].split("")[0] == "0")) {
                    return _HDD.tsbArray[i];
                }
            }
        };
        DeviceDriverFS.prototype.krnGetFileBlock = function (fileName) {
            var newFileName = fileName.split("");
            var fileDataHexArray = new Array();
            for (var i = 0; i < newFileName.length; i++) {
                fileDataHexArray.push(newFileName[i].charCodeAt(0).toString(16));
            }
            for (var i = 0; i < _HDD.tsbArray.length; i++) {
                var tsb = _HDD.tsbArray[i];
                var data = _HDD.readFromHDD(tsb).split("").slice(4);
                var dataCheck = "";
                for (var j = 0; j < fileDataHexArray.length; j++) {
                    dataCheck += fileDataHexArray[i];
                }
                for (var j = dataCheck.length - 1; j < 59; j++) {
                    dataCheck += "0";
                }
                if (data.join("") == dataCheck) {
                    return tsb;
                }
            }
        };
        return DeviceDriverFS;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFS = DeviceDriverFS;
})(TSOS || (TSOS = {}));