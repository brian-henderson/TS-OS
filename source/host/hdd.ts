///<reference path="../globals.ts" />

module TSOS{

	export class hdd{
		constructor(public tsbArray = []){}

		public writeToHDD(tsb, data){
			sessionStorage[tsb] = data;
		}

		public readFromHDD(tsb){
         //console.log("tsb in ss:" + tsb);
         //console.log("ss: " + sessionStorage[tsb])
			return sessionStorage[tsb];
		}
	}
}