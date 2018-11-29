'use strict';

var ETHER_TO_WEI = 1000000000000000000;

var Module = class {
	constructor() {
		this.name = 'common';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		// control
		this.controllers = null;
		
		// model
		this.session = null;
	}
	
	init() {
		console.log('module init called for ' + this.name);
		
		this.isready = true;
	}
	
	// compulsory  module functions
	loadModule(parentscriptloader, callback) {
		console.log('loadModule called for module ' + this.name);
		
		if (this.isloading)
			return;
			
		this.isloading = true;

		var self = this;
		var global = this.global;

		var modulescriptloader = global.getScriptLoader('commonmoduleloader', parentscriptloader);
		
		var moduleroot = './includes/modules/common';

		modulescriptloader.push_script( moduleroot + '/control/controllers.js');

		modulescriptloader.push_script( moduleroot + '/model/localstorage.js');
		modulescriptloader.push_script( moduleroot + '/model/restconnection.js');
		modulescriptloader.push_script( moduleroot + '/model/contracts.js');
		modulescriptloader.push_script( moduleroot + '/model/contractinstance.js');
		modulescriptloader.push_script( moduleroot + '/model/cryptokey.js');
		modulescriptloader.push_script( moduleroot + '/model/account.js');
		modulescriptloader.push_script( moduleroot + '/model/transaction.js');
		modulescriptloader.push_script( moduleroot + '/model/user.js');
		modulescriptloader.push_script( moduleroot + '/model/session.js'); // should be last

		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });
		
		return modulescriptloader;
	}
	
	isReady() {
		return this.isready;
	}
	
	hasLoadStarted() {
		return this.isloading;
	}

	// optional  module functions
	registerHooks() {
		console.log('module registerHooks called for ' + this.name);
		
	}
	
	//
	// control
	//
	
	getControllersObject() {
		if (this.controllers)
			return this.controllers;
		
		this.controllers = new this.Controllers(this);
		
		return this.controllers;
	}

	//
	// model
	//
	
	// web3
	getWeb3ProviderUrl() {
		return this.global.globalscope.Config.getWeb3ProviderUrl();
	}
	
	getDefaultGasLimit() {
		return this.global.globalscope.Config.getDefaultGasLimit();
	}
	
	getDefaultGasPrice() {
		return this.global.globalscope.Config.getDefaultGasPrice();
	}
	
	// wallet
	useWalletAccount() {
		var wallletaccount = this.global.globalscope.Config.getWalletAccountAddress();
		
		if (wallletaccount)
			return true;
		else
			return false;
	}
	
	getWalletAccountAddress() {
		return this.global.globalscope.Config.getWalletAccountAddress();
	}
	
	useWalletAccountChallenge() {
		return this.global.globalscope.Config.useWalletAccountChallenge();
	}
	
	needToUnlockAccounts() {
		return this.global.globalscope.Config.needToUnlockAccounts();
	}
	
	// client side persistence
	readLocalJson(session, keys) {
		var commonkeys = ['common'];
		
		var _keys = commonkeys.concat(keys);
		
		var localstorage = session.getLocalStorageObject();

		var json = localstorage.readLocalJson(_keys);
		
		return json;
	}
	
	saveLocalJson(session, keys, json) {
		var commonkeys = ['common'];
		
		var _keys = commonkeys.concat(keys);
		
		var localstorage = session.getLocalStorageObject();

		localstorage.saveLocalJson(_keys, json);
	}
	
	/*_hasItemChildren(itemjson) {
		return (typeof itemjson === 'object')
	}
	
	_hasItemUUID(itemjson, uuid) {
		return (itemjson && itemjson['uuid'] && (itemjson['uuid'] == uuid));
	}
	
	_findJsonLeaf(parentjson, uuid) {
		if (!parentjson)
			return;
		
		var self = this;
		
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
		
	}*/
	
	getLocalJsonLeaf(session, keys, uuid) {
		var commonkeys = ['common'];
		
		var _keys = commonkeys.concat(keys);
		
		var localstorage = this.session.getLocalStorageObject();
		return localstorage.getLocalJsonLeaf(_keys, uuid);
		
		/*var localjson = this.readLocalJson(session, keys);
		
		console.log('searching in keys ' + JSON.stringify(keys) + ' uuid ' + uuid);
		
		return this._findJsonLeaf(localjson, uuid);*/
	}
	
	/*_replaceJsonLeaves(parentjson, uuid, childjson) {
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
	}*/
	
	updateLocalJsonLeaf(session, keys, uuid, json) {
		var commonkeys = ['common'];
		
		var _keys = commonkeys.concat(keys);

		var localstorage = this.session.getLocalStorageObject();
		return localstorage.updateLocalJsonLeaf(_keys, uuid, json);
		
		/*console.log('update json leaf with uuid ' + uuid);

		var localjson = this.readLocalJson(session, keys);
		
		this._replaceJsonLeaves(localjson, uuid, json);
		
		this.saveLocalJson(session, keys, localjson);*/
	}
	
	insertLocalJsonLeaf(session, keys, parentuuid, collectionname, json) {
		var commonkeys = ['common'];
		
		var _keys = commonkeys.concat(keys);

		var localstorage = this.session.getLocalStorageObject();
		return localstorage.insertLocalJsonLeaf(_keys, parentuuid, collectionname, json);
		
		/*console.log('insert json leaf under uuid ' + parentuuid + ' with uuid ' + json['uuid'] + ' for collection ' + collectionname);

		var localjson = this.readLocalJson(session, keys);
		
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
		
		this.saveLocalJson(session, keys, localjson);*/
	}
	
	// session
	getSessionObject() {
		if (this.session)
			return this.session;
		
		console.log('Creating Session Object')
		
		this.Session.Config = this.global.globalscope.Config;
		
		// libs
		this.Session.EthereumNodeAccess = this.global.globalscope.EthereumNodeAccess;
		this.Session.AccountEncryption = this.global.globalscope.AccountEncryption;
		
		// model classes
		this.Session.Contracts = this.Contracts;
		this.Session.ContractInstance = this.ContractInstance;
		
		this.Session.CryptoKey = this.CryptoKey;
		this.Session.CryptoKeyMap = this.CryptoKeyMap;
		
		this.Session.Account = this.Account;
		this.Session.AccountMap = this.AccountMap;
		
		this.Session.Transaction = this.Transaction;
		
		var web3providerurl = this.getWeb3ProviderUrl();

		this.session = new this.Session(this.global);
		
		// web3
		this.session.setWeb3ProviderUrl(web3providerurl);
		
		// config
		this.session.setWalletAccountAddress(this.getWalletAccountAddress());
		this.session.setNeedToUnlockAccounts(this.needToUnlockAccounts());
		
		// calling creatingSession_hook
		var global = this.global;

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this.session);
		
		var ret = global.invokeHooks('creatingSession_hook', result, inputparams);
		
		if (ret && result && result.length) {
			console.log('session creation hook handled by a module');			
		}

		return this.session;
	}
	
	resetSessionObject() {
		if (this.session) {
			// re-read config
			this.session.setWalletAccountAddress(this.getWalletAccountAddress());
			this.session.setNeedToUnlockAccounts(this.needToUnlockAccounts());
		}
	}
	
	// user
	createBlankUserObject() {
		var session = this.getSessionObject();
		
		return new this.User(session);
	}
	
	// contracts
	getContractsObject(bForceRefresh, callback) {
		var session = this.getSessionObject();
		
		return session.getContractsObject(bForceRefresh, callback);
	}
	
	// crypto keys
	getCryptoKeyObject(address) {
		var session = this.getSessionObject();
		
		return session.getCryptoKeyObject(address);
	}
	
	createBlankCryptoKeyObject() {
		var session = this.getSessionObject();
		
		return session.createBlankCryptoKeyObject();
	}
	
	// accounts
	getAccountObject(address) {
		var session = this.getSessionObject();
		
		return session.getAccountObject(address);
	}
	
	createBlankAccountObject() {
		var session = this.getSessionObject();
		
		return session.createBlankAccountObject();
	}
	
	// transactions
	getTransactionObject(transactionuuid) {
		var session = this.getSessionObject();
		
		return session.getTransactionObject(transactionuuid);
	}
	
	getTransactionList(callback) {
		var session = this.getSessionObject();
		var EthereumNodeAccess = session.getEthereumNodeAccessInstance();
		
		return EthereumNodeAccess.web3_getTransactionList(callback);
	}
	
	// ether
	static getWeiFromEther(numofether) {
		var wei = numofether * ETHER_TO_WEI;

		return wei;
	}
	
	getEtherFromwei(numofwei) {
		var ether = numofwei / ETHER_TO_WEI;

		return ether;
	}
}

GlobalClass.getGlobalObject().registerModuleObject(new Module());