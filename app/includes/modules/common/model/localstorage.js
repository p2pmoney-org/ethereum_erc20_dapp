/**
 * 
 */
'use strict';

var CacheStorage = class {
	constructor() {
		this.map = Object.create(null); // use a simple object to implement the map
	}
	
	getKeyJson(key) {
		if (key in this.map) {
			return this.map[key];
		} 
	}
	
	updateJson(key, json) {
		this.map[key] = json;
	}
	
	count() {
		return Object.keys(this.map).length;
	}
	
	empty() {
		this.map = Object.create(null);
	}
}

var LocalStorage = class {
	constructor(session) {
		this.session = session;
		
		this.storagemap = new CacheStorage();
	}
	
	getStorageAccessInstance() {
		return this.session.getStorageAccessInstance();
	}
	

	empty() {
		this.storagemap.empty();
	}
	
	keystostring(keys) {
		var key = '';
		
		for (var i =0; i < keys.length; i++) {
			key += (i > 0 ? '-' : '') + keys[i]
		}
		
		return key;
	}
	
	// update of cache
	_hasItemChildren(itemjson) {
		return (typeof itemjson === 'object')
	}
	
	_hasItemUUID(itemjson, uuid) {
		return (itemjson && itemjson['uuid'] && (itemjson['uuid'] == uuid));
	}
	
	_findJsonLeaf(parentjson, uuid) {
		if (!parentjson)
			return;
		
		var self = this;
		
		/*if (!this.loopcount) this.loopcount = 1;
		
		this.loopcount++; console.log('loop ' + this.loopcount);
		if (this.loopcount > 100) throw 'stop loop';*/

		var jsonkeys = Object.keys(parentjson);
		
		if (!jsonkeys)
			return;
		
		for (var i=0; i < jsonkeys.length; i++) {
			var key = jsonkeys[i];
			var itemjson = parentjson[key];
			//console.log('scanning key ' + key);
			//console.log('key value is ' + JSON.stringify(itemjson));
			
			if (this._hasItemUUID(itemjson, uuid))
				return itemjson;
			else {
				// to avoid scanning strings
				if (this._hasItemChildren(itemjson)) {
					//console.log('deep diving in key ' + key);
					var jsonleaf = self._findJsonLeaf(itemjson, uuid);
					
					if (jsonleaf)
						return jsonleaf;
				}
				else {
					//console.log('itemjson is ' + JSON.stringify(itemjson));
				}
			}
			
		};
		
	}
	
	getLocalJsonLeaf(keys, uuid) {
		var session = this.session;
		var localjson = this.readLocalJson(keys);
		
		console.log('searching in keys ' + JSON.stringify(keys) + ' uuid ' + uuid);
		
		return this._findJsonLeaf(localjson, uuid);
	}
	
	_replaceJsonLeaves(parentjson, uuid, childjson) {
		if (!parentjson)
			return;

		var self = this;
		
		Object.keys(parentjson).forEach(function(key) {
			
			if (self._hasItemUUID(parentjson[key], uuid)) {
				//console.log('replacing for key ' + key + ' json ' + JSON.stringify(parentjson[key]));
				//console.log('by json ' + JSON.stringify(childjson));
				
				delete parentjson[key];
				parentjson[key] = childjson;
			}
			else {
				if (self._hasItemChildren(parentjson[key])) {
					self._replaceJsonLeaves(parentjson[key], uuid, childjson);
				}
			}
		});
	}
	
	updateLocalJsonLeaf(keys, uuid, json) {
		console.log('update json leaf with uuid ' + uuid);

		var session = this.session;
		var localjson = this.readLocalJson(keys);
		
		this._replaceJsonLeaves(localjson, uuid, json);
		
		this.saveLocalJson(keys, localjson);
	}
	
	insertLocalJsonLeaf(keys, parentuuid, collectionname, json) {
		console.log('insert json leaf under uuid ' + parentuuid + ' with uuid ' + json['uuid'] + ' for collection ' + collectionname);

		var session = this.session;
		var localjson = this.readLocalJson(keys);
		
		if (!localjson)
			localjson = [];
		
		var parentjson = (parentuuid ? this._findJsonLeaf(localjson, parentuuid) : localjson);
		var collectionjsonarray = (collectionname ? parentjson[collectionname] : parentjson);
		
		if (!collectionjsonarray) {
			collectionjsonarray = [];
			
			if (collectionname)
				parentjson[collectionname] = collectionjsonarray;
			else
				parentjson = collectionjsonarray;
		}
		
		collectionjsonarray.push(json);
		
		this.saveLocalJson(keys, localjson);
	}	
	// read and save
	readLocalJson(keys, bForceRefresh, callback) {
		var self = this;
		var key = this.keystostring(keys);
		//var jsonstring = localStorage.getItem(key.toString());
		
		var entry = this.storagemap.getKeyJson(key);
		
		if ((entry) && (!bForceRefresh) && (bForceRefresh != true)) {
			return this.storagemap.getKeyJson(key);
		}
		
		var storageaccess = this.getStorageAccessInstance();
		var json;

		if (this.session.isAnonymous()) {
			json = storageaccess.readClientSideJson(keys);

			this.storagemap.updateJson(key, json);
			
			if (callback)
				callback(null, this.storagemap.getKeyJson(key));
		}
		else {
			// we return the information in cache
			// since we are sending a reference
			// json will be updated when callback is called
			
			// and start a new read to update the cache if necessary
			storageaccess.readUserJson(keys, function(err, res) {
				if (!err)
				self.storagemap.updateJson(key, res);
				
				if (callback)
					callback(null, self.storagemap.getKeyJson(key));
			})
			.catch(function (err) {
			     console.log("LocalStorage.readLocalJson promise rejected: " + err);
			});
		}
		
		//console.log("LocalStorage.readLocalJson: local storage json for key " + key.toString() + " is " + JSON.stringify(this.storagemap.getKeyJson(key)));
		
		return this.storagemap.getKeyJson(key);
	}
	
	saveLocalJson(keys, json, callback) {
		var storageaccess = this.getStorageAccessInstance();
		var key = this.keystostring(keys);
		
		console.log("saveLocalJson: local storage json for key " + key.toString() + " is " + JSON.stringify(json));
		
		this.storagemap.updateJson(key, json);
		
		if (this.session.isAnonymous()) {
			storageaccess.saveClientSideJson(keys, json);
			
			if (callback)
				callback(null, json);
		}
		else {
			storageaccess.saveUserJson(keys, json, function(err, res) {
				console.log("user json saved for key " + key);
				
				var returnedjson = res;
				
				if (callback)
					callback(null, returnedjson);
				
				return res;
			})
			.catch(function (err) {
			     console.log("LocalStorage.saveLocalJson promise rejected: " + err);
			});
		}

	}
	
	
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
	GlobalClass.registerModuleClass('common', 'LocalStorage', LocalStorage);
else
	module.exports = LocalStorage; // we are in node js
