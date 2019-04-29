'use strict';

var Module = class {
	
	constructor() {
		this.name = 'erc20-dapp';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.controllers = null; // one object, even if plural used
		
		this.plugins = {}; // map
		
		this.registerModel();
	}
	
	init() {
		console.log('module init called for ' + this.name);
		
		var global = this.global;
		var dappsmodule = global.getModuleObject('dapps');
		
		// create controllers
		var erc20controllers = new this.ERC20AngularControllers(global);
		dappsmodule.pushAngularController(erc20controllers);
		
		this.controllers = erc20controllers;
		
		this.isready = true;
	}
	
	// compulsory  module functions
	loadModule(parentscriptloader, callback) {
		console.log('loadModule called for module ' + this.name);

		if (this.isready) {
			if (callback)
				callback(null, this);
			
			return;
		}

		if (this.isloading) {
			var error = 'calling loadModule while still loading for module ' + this.name;
			console.log('error: ' + error);
			
			if (callback)
				callback(error, null);
			
			return;
		}
			
		this.isloading = true;

		var self = this;
		var global = this.global;
		var bootstrapobject = global.getBootstrapObject();

		// erc20 ui
		var modulescriptloader = global.getScriptLoader('erc20dapploader', parentscriptloader);
		
		var moduleroot = './dapps/erc20';

		var mvcui = bootstrapobject.getMvcUI();
		
		if (mvcui == 'angularjs-1.x') {
			modulescriptloader.push_script( moduleroot + '/angular-ui/js/src/control/controllers.js');
			modulescriptloader.push_script( moduleroot + '/angular-ui/js/src/view/views.js');
		}
		
		
		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });
		
		return modulescriptloader;
	}
	
	isReady() {
		return this.isready;
	}

	hasLoadStarted() {
		return this.isloading;
	}
	
	registerModel() {
		var global = (this.global ? this.global : GlobalClass.getGlobalObject());
		
		if (global.isGlobalScopeInitializing())
			throw 'registerModel is called too late, after global scope intialization started.'
		
		console.log('registerModel called for ' + this.name);

		var dappsmodelsloader = global.findScriptLoader('dappsmodelsloader');

		var moduleroot = './dapps/erc20';
		
		// erc20 module
		dappsmodelsloader.push_script( moduleroot + '/includes/module.js', function() {
			// load module if initialization has finished
			if (global.isReady())
			global.loadModule('erc20', dappsmodelsloader);
		 });
		
	}
	
	// functions
	getControllersObject() {
		if (this.controllers)
			return this.controllers;
		
		var global = this.global;
		this.controllers = new this.Controllers(global);
		
		return this.controllers;
	}
	

}

GlobalClass.getGlobalObject().registerModuleObject(new Module());

// dependencies
GlobalClass.getGlobalObject().registerModuleDepency('erc20-dapp', 'dapps');
