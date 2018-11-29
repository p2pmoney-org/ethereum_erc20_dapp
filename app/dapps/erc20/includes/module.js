'use strict';

var Module = class {
	
	constructor() {
		this.name = 'erc20';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.controllers = null;
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

		// noticebook
		var modulescriptloader = global.getScriptLoader('erc20loader', parentscriptloader);
		
		var moduleroot = './dapps/erc20/includes';

		modulescriptloader.push_script( moduleroot + '/control/controllers.js');

		modulescriptloader.push_script( moduleroot + '/model/erc20token.js');
		
		modulescriptloader.push_script( moduleroot + '/model/interface/erc20token-contractinterface.js');
		modulescriptloader.push_script( moduleroot + '/model/interface/erc20token-localpersistor.js');
		
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
		
		var global = this.global;
		
		global.registerHook('postFinalizeGlobalScopeInit_hook', 'erc20', this.postFinalizeGlobalScopeInit_hook);
	}
	
	//
	// hooks
	//
	postFinalizeGlobalScopeInit_hook(result, params) {
		console.log('postFinalizeGlobalScopeInit_hook called for ' + this.name);
		
		var global = this.global;

		var commonmodule = this.global.getModuleObject('common');
		
		var contracts = commonmodule.getContractsObject();
		
		// register PublicNoticeBook in the contracts global object
		contracts.registerContractClass('TokenERC20', this.ERC20Token);
		
		// force refresh of list
		commonmodule.getContractsObject(true);

		result.push({module: 'erc20', handled: true});
		
		return true;
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
	
	// erc20 tokens
	_filterContracts(contracts) {
		var array = [];
		
		if (!contracts)
			return array;
		
		var locals = contracts.getLocalOnlyContractObjects();

		for (var i = 0; i < locals.length; i++) {
			var local = locals[i];
			
			if (local.getContractType() == 'TokenERC20')
			array.push(local);
		}

		return array;
	}
	
	getLocalERC20Tokens(session, bForceRefresh, callback) {
		var global = this.global;
		var self = this;
		
		var commonmodule = global.getModuleObject('common');
		
		var contracts = commonmodule.getContractsObject(bForceRefresh, function(err, contracts) {
			if (callback) {
				var array = self._filterContracts(contracts);
				
				callback(null, array);
			}
		});
		
		var array = this._filterContracts(contracts);
		
		return array;
	}
	
	getChainERC20Tokens(session, bForceRefresh) {
		var global = this.global;
		var commonmodule = global.getModuleObject('common');
		
		var contracts = commonmodule.getContractsObject(bForceRefresh);
		
		var array = [];
		
		var chains = contracts.getChainContractObjects();

		for (var i = 0; i < chains.length; i++) {
			var chain = chains[i];
			
			if (chain.getContractType() == 'TokenERC20')
			array.push(chain);
		}

		return array;
	}
	
	findChainERC20Token(noticebookarray, address) {
		if (!address)
			return;
		
		var addr = address.trim().toLowerCase();
		
		for (var i = 0; i < noticebookarray.length; i++) {
			var bookaddress = noticebookarray[i].getAddress().trim().toLowerCase();
			if (bookaddress == addr)
				return noticebookarray[i];
		}
	}
}

GlobalClass.getGlobalObject().registerModuleObject(new Module());

// dependencies
GlobalClass.getGlobalObject().registerModuleDepency('erc20', 'erc20-dapp');
