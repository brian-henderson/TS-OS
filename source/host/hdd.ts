///<reference path="../globals.ts" />

module TSOS{

	export class hdd{
		constructor(public tsbArray = []){}

		public writeToHDD(tsb, data){
			sessionStorage[tsb] = data;
		}

		public readFromHDD(tsb){
			return sessionStorage[tsb];
		}
	}
}