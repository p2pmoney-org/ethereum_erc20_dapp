'use strict';

class Constants {
	
	static push(key, value) {
		if (!Constants.valuemap) {
			Constants.valuemap = Object.create(null);
		}
		
		var keystring = key.toString().trim().toLowerCase();
		
		if (!Constants.valuemap[keystring]) {
			Constants.valuemap[keystring] = value;
		}
		else {
			if (Array.isArray(Constants.valuemap[keystring]) === false) {
				var array = [];
				array.push(Constants.valuemap[keystring]);
				Constants.valuemap[keystring] = array;
			}
			
			Constants.valuemap[keystring].push(value);
		}
	}
	
	static get(key) {
		if (!Constants.valuemap) {
			Constants.valuemap = Object.create(null);
		}

		var keystring = key.toString().trim().toLowerCase();

		return Constants.valuemap[keystring];
	}
	
}

//export
if ( typeof window !== 'undefined' && window ) // if we are in browser and not node js (e.g. truffle)
window.Constants = Constants;
else
module.exports = Constants; // we are in node js
