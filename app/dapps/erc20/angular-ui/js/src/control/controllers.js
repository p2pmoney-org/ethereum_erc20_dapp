'use strict';

var DAPPControllers = class {
	
	constructor(global) {
		this.global = global;
		this.app = null; // filled in registerControllers
		
		this.name = 'erc20';
		
		// views
		var ERC20TokenViews = global.getModuleObject('dapps').ERC20TokenAngularViews;
		this.erc20tokenviews = new ERC20TokenViews(global);
	}
	
	getAppObject() {
		return this.app;
	}
	
	getAngularControllers() {
		var mvcmodule = this.global.getModuleObject('mvc');
		
		return mvcmodule.getControllersObject();
	}
	
	registerControllers(app) {
		this.app = app;
		
		var global = this.global;
		
		var angular_app = app.getAngularApp();
		var controllers = this;

		
		//
		// registering controllers
		//
		
		
		//
		// Controllers for views
		//
		
		// templates
		
		// partials
		
		// list of erc20 tokens
		angular_app.controller("ERC20TokensViewCtrl",  ['$scope', function ($scope) {
			controllers.prepareERC20TokensView($scope);
		}]);

		// erc20 token view
		angular_app.controller("ERC20TokenViewCtrl",  ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenView($scope, $state, $stateParams);
		}]);
		

		// erc20 token accounts positions view
		angular_app.controller("ERC20TokenAccountPositionsViewCtrl",  ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenAccountsPositionsView($scope, $state, $stateParams);
		}]);
		

		//
		// Controllers for forms
		//
		
		// erc20 tokens
		angular_app.controller("ERC20TokenCreateFormCtrl", ['$scope', function ($scope) {
			controllers.prepareERC20TokenCreateForm($scope);
		}]);
		
		
		angular_app.controller("ERC20TokenImportFormCtrl", ['$scope', function ($scope) {
			controllers.prepareERC20TokenImportForm($scope);
		}]);
		
		angular_app.controller("ERC20TokenModifyFormCtrl", ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenModifyForm($scope, $state, $stateParams);
		}]);
		
		angular_app.controller("ERC20TokenDeployFormCtrl", ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenDeployForm($scope, $state, $stateParams);
		}]);
		
		
		angular_app.controller("ERC20TokenAccountTransferFormCtrl", ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenAccountTransferForm($scope, $state, $stateParams);
		}]);
		
		angular_app.controller("ERC20TokenAccountBurnFormCtrl", ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenAccountBurnForm($scope, $state, $stateParams);
		}]);
		
		angular_app.controller("ERC20TokenAccountApproveFormCtrl", ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenAccountApproveForm($scope, $state, $stateParams);
		}]);
		
		angular_app.controller("ERC20TokenAccountApproveAndCallFormCtrl", ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.prepareERC20TokenAccountApproveAndCallForm($scope, $state, $stateParams);
		}]);
		
		
		//
		// Handlers for requests (clicks, forms,..)
		//
		
		// erc20 tokebs
		angular_app.controller("ERC20TokenRemoveRequestHandler", ['$scope','$state', '$stateParams', function ($scope, $state, $stateParams) {
			controllers.handleRemoveERC20TokenRequestFromList($scope, $state, $stateParams);
		}]);
		
		
		
	}
	
	registerStates($stateProvider) {
		var global = this.global;
		
		$stateProvider
	    .state('home.erc20tokens', {url: '/erc20tokens', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20tokens.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('ERC20 Tokens') }})
	    .state('home.erc20tokens.create', {url: '/create', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-create.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Create') }})
	    .state('home.erc20tokens.import', {url: '/import', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-import.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Import') }})
	    .state('home.erc20tokens.modify', {url: '/modify/:uuid', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-modify.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Modify') }})
	    .state('home.erc20tokens.deploy', {url: '/deploy/:uuid', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-deploy.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Publish') }})
	    .state('home.erc20tokens.view', {url: '/view/:uuid', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-view.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('View') }})
	    .state('home.erc20tokens.view.account', {url: '/account/:address', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-account-view.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Account') }})
	    .state('home.erc20tokens.view.account.transfer', {url: '/transfer', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-account-tranfer.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Transfer') }})
	    .state('home.erc20tokens.view.account.burn', {url: '/burn', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-account-burn.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Burn') }})
	    .state('home.erc20tokens.view.account.approve', {url: '/approve', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-account-approve.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Approve') }})
	    .state('home.erc20tokens.view.account.approveandcall', {url: '/approveandcall', views: {'main@': {templateUrl: './dapps/erc20/angular-ui/templates/erc20token-account-approveandcall.html', controller: "PageRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Approve') }})
	    .state('home.erc20tokens.delete', {url: '/delete/:uuid', views: {'main@': {controller: "ERC20TokenRemoveRequestHandler",}},
	        ncyBreadcrumb: { label: global.t('Delete') }})
	}
	
	//
	// Requests
	//
	
	handleRemoveERC20TokenRequestFromList($scope, $state, $stateParams) {
		console.log("Controllers.handleRemoveERC20TokenRequestFromList called");
	    
		var self = this;
		var global = this.global;
		var app = this.getAppObject();

	    var contractuuid = $stateParams.uuid;

	    var global = this.global;
	    
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();
	    
		var erc20tokenmodule = global.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		
		if (erc20tokencontract) {
			if (confirm('Are you sure you want to remove "' + erc20tokencontract.getLocalName() + '"?')) {
				erc20tokencontrollers.removeERC20TokenObject(erc20tokencontract);
				
				erc20tokencontrollers.saveERC20Tokens(function(err, res) {
					self.getAngularControllers().gotoStatePage('home.erc20tokens');
				});
			}
			else {
				this.getAngularControllers().gotoStatePage('home.erc20tokens');
			}
		}
		else {
			alert(contractuuid + 'not found');
			
			this.getAngularControllers().gotoStatePage('home.erc20tokens');
		}
		
	}
		  
	//
	// Views
	//
	
	// templates elements
	
	_getViewERC20TokenArray($scope, views, contract) {
		var global = this.global;
		
		var erc20token = [];
		
		erc20token.index = contract.getContractIndex();
		erc20token.uuid = contract.getUUID();

		erc20token.isLocalOnly = contract.isLocalOnly();
		
		erc20token.status = contract.getStatus();
		erc20token.statusstring = views.getERC20TokenStatusString(contract);

		erc20token.contracttype = contract.getContractType();

		erc20token.description = contract.getLocalDescription();
		erc20token.name = (contract.isLocalOnly() ? contract.getLocalName() : global.t('loading'));
		erc20token.symbol = (contract.isLocalOnly() ? contract.getLocalSymbol() : global.t('loading'));
		erc20token.decimals = (contract.isLocalOnly() ? contract.getLocalDecimals() : global.t('loading'));
		erc20token.totalsupply = (contract.isLocalOnly() ? contract.getLocalTotalSupply() : global.t('loading'));
		
		erc20token.address = (contract.isLocalOnly() ? null: contract.getAddress());
		
	    var writename = function (contract, erc20token) {
			return contract.getChainName(function(err, res) {

				if (res) {
					console.log('chain name resolved to ' + res);
					erc20token.name = res;
				}
				
				if (err)  {
					console.log('error in chain name ' + res);
					erc20token.name = global.t('not found');
				}
				
				// tell scope a value has changed
				$scope.$apply();
			})
			.catch(err => {
			    console.log('getChainName error', err);
			});
		};

	    var writestatus = function (contract, erc20token) {
	    	var oldstatus = contract.getStatus();
	    	
			return contract.checkStatus(function(err, res) {

				if (err)  {
					console.log('error in checkStatus ' + res);
				}
				
				var refresh = false;
		    	var newstatus = contract.getStatus();

		    	if (newstatus != oldstatus) {
		    		erc20token.statusstring = views.getERC20TokenLiveStatusString(contract);
		    		refresh = true;
		    		
		    		// save token
		    		var erc20tokenmodule = global.getModuleObject('erc20');
		    		
		    		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		    		
		    		erc20tokencontrollers.saveERC20TokenObject(contract);
		    	}
				
				// tell scope a value has changed
				if (refresh)
				$scope.$apply();
			})			
			.catch(err => {
			    console.log('checkStatus error', err);
			});
		};
		
	    var writesymbol = function (contract, erc20token) {
			return contract.getChainSymbol(function(err, res) {

				if (res) {
					console.log('chain symbol resolved to ' + res);
					erc20token.symbol = res;
				}
				
				if (err)  {
					console.log('error in chain symbol ' + res);
					erc20token.symbol = global.t('not found');
				}
				
				// tell scope a value has changed
				$scope.$apply();
			})			
			.catch(err => {
			    console.log('writesymbol error', err);
			});
		};

		
	    var writedecimals = function (contract, erc20token) {
			return contract.getChainDecimals(function(err, res) {

				if (res) {
					console.log('chain decimals resolved to ' + res);
					erc20token.decimals = res;
				}
				
				if (err)  {
					console.log('error in chain decimals ' + res);
					erc20token.decimals = global.t('not found');
				}
				
				// tell scope a value has changed
				$scope.$apply();
			})			
			.catch(err => {
			    console.log('writedecimals error', err);
			});
		};

	    var writetotalsupply = function (contract, erc20token) {
			return contract.getChainTotalSupply(function(err, res) {

				if (res) {
					console.log('chain totalsupply resolved to ' + res);
					erc20token.totalsupply = res;
				}
				
				if (err)  {
					console.log('error in chain totalsupply ' + res);
					erc20token.totalsupply = global.t('not found');
				}
				
				// tell scope a value has changed
				$scope.$apply();
			})			
			.catch(err => {
			    console.log('writetotalsupply error', err);
			});
		};

		
		if (contract.isLocalOnly() == false) {
			writename(contract, erc20token);
			writesymbol(contract, erc20token);
			writedecimals(contract, erc20token);
			writetotalsupply(contract, erc20token);
		}
		
		// for local and on chain
		writestatus(contract, erc20token);
		
		return erc20token;
	}
	
	_getViewERC20TokensArray($scope, views, modelerc20tokenarray) {
		var viewerc20tokens = [];
		
		if (modelerc20tokenarray) {
			for (var i = 0; i < modelerc20tokenarray.length; i++) {
				var contract = modelerc20tokenarray[i];
				
				if (contract) {
					var viewerc20token = this._getViewERC20TokenArray($scope, views, contract);
					
					viewerc20tokens.push(viewerc20token);
				}
			}
		}
		
		return viewerc20tokens;
	}
	
	prepareERC20TokensView($scope) {
		console.log("Controllers.prepareERC20TokensView called");
		
		var global = this.global;
		var self = this;
		var app = this.getAppObject();

		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();
		
		var views = this.erc20tokenviews;

		// local contracts
		// (in memory)
		var localerc20tokens = [];
		
		var erc20tokenmodule = global.getModuleObject('erc20');
		var localerc20tokenarray = erc20tokenmodule.getLocalERC20Tokens(session, false);
		
		if (localerc20tokenarray) {
			localerc20tokens = this._getViewERC20TokensArray($scope, views, localerc20tokenarray);
		}
		
		$scope.localerc20tokens = localerc20tokens;
		

		// chain contracts
		// (in memory)
		var chainerc20tokens = [];
		
		var chainerc20tokenarray = erc20tokenmodule.getChainERC20Tokens(session, false);
		
		if (chainerc20tokenarray) {
			chainerc20tokens = this._getViewERC20TokensArray($scope, views, chainerc20tokenarray)
		}
		
		$scope.chainerc20tokens = chainerc20tokens;
		
		// refresh list to update both parts
		erc20tokenmodule.getERC20Tokens(session, true, function(err, res) {
			
			// list of contracts has been refreshed
			
			// update local and chain lists
			$scope.localerc20tokens = self._getViewERC20TokensArray($scope, views, erc20tokenmodule.getLocalERC20Tokens(session, false));
			
			$scope.chainerc20tokens = self._getViewERC20TokensArray($scope, views, erc20tokenmodule.getChainERC20Tokens(session, false));
		
			// putting $apply in a deferred call to avoid determining if callback is called
			// from a promise or direct continuation of the code
			setTimeout(function() {
			    $scope.$apply();
			  }, 100);
		});
	}
	
	prepareERC20TokenView($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenView called");
		
	    var contractuuid = $stateParams.uuid;

	    var global = this.global;
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		var erc20tokenviews = this.erc20tokenviews;
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		
		if (erc20tokencontract) {
			$scope.erc20tokenindex = erc20tokencontract.getContractIndex();
			$scope.erc20tokenuuid = erc20tokencontract.getUUID();
			$scope.isLocalOnly = erc20tokencontract.isLocalOnly();
			
			
			var statusstring = erc20tokenviews.getERC20TokenStatusString(erc20tokencontract);
			var livestatusstring = erc20tokenviews.getERC20TokenLiveStatusString(erc20tokencontract);


			
			$scope.erc20tokenuuid = {
					text: erc20tokencontract.getUUID()
			};	
			
			// local part
			$scope.address = {
					text: erc20tokencontract.getAddress()
			};	
			
			$scope.localdescription = {
					text: erc20tokencontract.getLocalDescription()
			};	
			
			$scope.localname = {
					text: erc20tokencontract.getLocalName()
			};	
			
			$scope.localsymbol = {
					text: erc20tokencontract.getLocalSymbol()
			};	
			
			$scope.localdecimals = {
					text: erc20tokencontract.getLocalDecimals()
			};	
			
			$scope.localtotalsupply = {
					text: erc20tokencontract.getLocalTotalSupply()
			};	
			
			$scope.status = {
					text: statusstring
			};
			
			
			// chain part
			
			// name
			$scope.chainname = {
					text: (erc20tokencontract.isLocalOnly() ? global.t('not deployed yet') : global.t('loading'))
			};
			
			var writename = function (contract) {
				return contract.getChainName(function(err, res) {
					if (res) $scope.chainname.text = res;
					
					if (err) $scope.chainname.text = global.t('not found');
					
					$scope.$apply();
				})
			};

			if (erc20tokencontract.isLocalOnly() == false)
				writename(erc20tokencontract);

			// symbol
			$scope.chainsymbol = {
					text: (erc20tokencontract.isLocalOnly() ? global.t('not deployed yet') : global.t('loading'))
			};
			
			var writesymbol = function (contract) {
				return contract.getChainSymbol(function(err, res) {
					if (res) $scope.chainsymbol.text = res;
					
					if (err) $scope.chainsymbol.text = global.t('not found');
					
					$scope.$apply();
				})
			};

			if (erc20tokencontract.isLocalOnly() == false)
				writesymbol(erc20tokencontract);
			
			// decimals
			$scope.chaindecimals = {
					text: (erc20tokencontract.isLocalOnly() ? global.t('not deployed yet') : global.t('loading'))
			};
			
			var writedecimals = function (contract) {
				return contract.getChainDecimals(function(err, res) {
					if (res) $scope.chaindecimals.text = res;
					
					if (err) $scope.chaindecimals.text = global.t('not found');
					
					$scope.$apply();
				})
			};

			if (erc20tokencontract.isLocalOnly() == false)
				writedecimals(erc20tokencontract);
			
			// decimals
			$scope.chaintotalsupply = {
					text: (erc20tokencontract.isLocalOnly() ? global.t('not deployed yet') : global.t('loading'))
			};
			
			var writetotalsupply = function (contract) {
				return contract.getChainTotalSupply(function(err, res) {
					if (res) $scope.chaintotalsupply.text = res;
					
					if (err) $scope.chaintotalsupply.text = global.t('not found');
					
					$scope.$apply();
				})
			};

			if (erc20tokencontract.isLocalOnly() == false)
				writetotalsupply(erc20tokencontract);
			
			// live status
			$scope.livestatus = {
					text: livestatusstring
			};	
			

		
		}
		
	}	
	
	prepareERC20TokenAccountsPositionsView($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenView called");
		
	    var contractuuid = $stateParams.uuid;

	    var global = this.global;
	    
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();

		var erc20tokenmodule = global.getModuleObject('erc20');
		
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		
		var accountpositions = [];
		
		if (erc20tokencontract) {
			var symbol = erc20tokencontract.getLocalSymbol();
			// get list of our accounts
			var accountarray = session.getSessionAccountObjects();
			
			if (accountarray) {
				for (var i = 0; i < accountarray.length; i++) {
					var account = accountarray[i];
					
					if (account) {
						var accountposition = [];
						var accountaddress = account.getAddress();
						var accountdescription = account.getDescription();
						
						accountposition['erc20tokenindex'] = erc20tokencontract.getContractIndex();
						accountposition['erc20tokenuuid'] = erc20tokencontract.getUUID();
						
						accountposition['address'] = accountaddress;
						accountposition['description'] = accountdescription;
						accountposition['balance'] = global.t('loading');
						accountposition['ether_balance'] = global.t('loading');
						
						// write token balance for this account
						var writebalance = function(accountposition, account) {
							erc20tokencontract.balanceOf(account, function(err, res) {
								if (err) {
									accountposition['balance'] = global.t('error');
								}
								else {
									accountposition['balance'] = res + ' ' + symbol;
								}
								
								// tell scope a value has changed
								$scope.$apply();
							});
						};
						
						writebalance(accountposition, account);
						
						
						// write ether balance for this account
						var writeetherbalance = function(accountposition, account) {
							account.getChainBalance(function(err, res) {
								if (err) {
									accountposition['ether_balance'] = global.t('error');
								}
								else {
									var etherbalance = commoncontrollers.getEtherStringFromWei(res);
									accountposition['ether_balance'] = etherbalance + ' ETH';
								}
								
								// tell scope a value has changed
								$scope.$apply();
							});
						};
						
						writeetherbalance(accountposition, account);
						
						
						accountpositions.push(accountposition);
					}
				}
			}
		}		
		
		$scope.accountpositions = accountpositions;
	}
		
	//
	// Forms
	//
	
	// erc20 token creation
	prepareERC20TokenCreateForm($scope) {
		console.log("Controllers.prepareERC20TokenCreateForm called");

		var global = this.global;
		var self = this;
		  
		// filling fields
		$scope.description = {
				text: global.t('Enter description')
		};
		  
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenCreateSubmit($scope);
		}
	}
	
	handleERC20TokenCreateSubmit($scope) {
		console.log("Controllers.handleERC20TokenCreateSubmit called");

		// fill data array
		var data = [];
		
		data['name'] = $scope.name.text;
		data['symbol'] = $scope.symbol.text;
		data['decimals'] = $scope.decimals.text;
		data['totalsupply'] = $scope.totalsupply.text;
		
		data['description'] = $scope.description.text;
		
		// call module controller
		var global = this.global;
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		// create (local) erc20token for these values
		var erc20token = erc20tokencontrollers.createERC20TokenObject(data);
		
		// save erc20token
		var self = this;
		erc20tokencontrollers.saveERC20TokenObject(erc20token, function(err, res) {
			self.getAngularControllers().gotoStatePage('home.erc20tokens');
		});
		
	}
	
	// notice import
	prepareERC20TokenImportForm($scope) {
		console.log("Controllers.prepareERC20TokenImportForm called");

		var global = this.global;
		var self = this;
		  
		// filling fields
		$scope.description = {
				text: global.t('Enter description')
		};
		  
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenImportSubmit($scope);
		}
	}
	
	handleERC20TokenImportSubmit($scope) {
		console.log("Controllers.handleERC20TokenImportSubmit called");

		// fill data array
		var data = [];
		
		data['description'] = $scope.description.text;
		data['address'] = $scope.address.text;
		
		// call module controller
		var self = this;
		var global = this.global;
		var app = this.getAppObject();
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		// create (local) contract for these values
		var contract = erc20tokencontrollers.createERC20TokenObject(data);
		
		if (contract) {
			// save contract
			erc20tokencontrollers.saveERC20TokenObject(contract, function(err, res) {
				// start a promise chain, to collect name, symbol,..
				console.log("starting retrieving chain data");

				var promise = contract.getChainName(function(err, res) {
					var name = res;
					
					console.log("chain name is " + res);
					
					contract.setLocalName(name);

					return res;
				})
				.then(function(res) {
					return contract.getChainSymbol(function(err, res) {
						var symbol = res;
						
						console.log("symbol is " + res);
						
						contract.setLocalSymbol(symbol);
						
						return res;
					})
				})
				.then(function(res) {
					return contract.getChainDecimals(function(err, res) {
						var decimals = res;
						
						console.log("decimals is " + res);
						
						contract.setLocalDecimals(decimals);
						
						return res;
					})
				})
				.then(function(res) {
					return contract.getChainTotalSupply(function(err, res) {
						var totalsupply = res;
						
						console.log("total supply is " + res);
						
						contract.setLocalTotalSupply(totalsupply);
						
						return res;
					})
				})
				.then( function (res) {
					
					console.log("deployed contract completely retrieved");

					app.setMessage("deployed contract completely retrieved");
					
					// save erc20token
					return erc20tokencontrollers.saveERC20TokenObject(contract, function(err, res) {
						self.getAngularControllers().gotoStatePage('home.erc20tokens');
					});
				});
			});
			
		}
		else {
			this.getAngularControllers().gotoStatePage('home.erc20tokens');
		}
		
	}
	
	// erc20 token modification
	prepareERC20TokenModifyForm($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenModifyForm called");
		
		var self = this;

	    var contractuuid = $stateParams.uuid;

		// call module controller
		var global = this.global;
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);

		// filling fields
		var erc20token = [];
		
		$scope.erc20token = erc20token;
		
		if (erc20tokencontract) {
			erc20token.index = erc20tokencontract.getContractIndex();
			erc20token.uuid = erc20tokencontract.getUUID();
			
			$scope.name = {
					text: (erc20tokencontract ? erc20tokencontract.getLocalName() : global.t('no name'))
			};
			  
			$scope.symbol = {
					text: (erc20tokencontract ? erc20tokencontract.getLocalSymbol() : global.t('no symbol'))
			};
			  
			$scope.decimals = {
					text: (erc20tokencontract ? erc20tokencontract.getLocalDecimals() : 18)
			};
			  
			$scope.totalsupply = {
					text: (erc20tokencontract ? erc20tokencontract.getLocalTotalSupply() : 1)
			};
			  
			$scope.description = {
					text: (erc20tokencontract ? erc20tokencontract.getLocalDescription() : global.t('no description'))
			};
			  
		}

		  
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenModifySubmit($scope);
		}
	}

	handleERC20TokenModifySubmit($scope) {
		console.log("Controllers.handleERC20TokenModifySubmit called");
	    
		var contractuuid = $scope.erc20token.uuid;

		var data = [];
		
		data['name'] = $scope.name.text;
		data['symbol'] = $scope.symbol.text;
		data['decimals'] = $scope.decimals.text;
		data['totalsupply'] = $scope.totalsupply.text;

	    data['description'] = $scope.description.text;
		
		var global = this.global;
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		// get (local) erc20token 
		var erc20token = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		
		erc20token = erc20tokencontrollers.modifyERC20TokenObject(erc20token, data);
		
		// save erc20token
		var self = this;
		
		erc20tokencontrollers.saveERC20TokenObject(erc20token, function(err,res) {
			self.getAngularControllers().gotoStatePage('home.erc20tokens');
		});
		
	}
	
	// erc20 token deployment
	prepareERC20TokenDeployForm($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenDeployForm called");
		
		var self = this;

	    var contractuuid = $stateParams.uuid;

		// call module controller
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();
		
		var erc20tokenmodule = global.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		

		// filling fields
		var erc20token = [];
		
		$scope.erc20token = erc20token;

		

		if (erc20tokencontract) {
			erc20token.index = erc20tokencontract.getContractIndex();
			erc20token.uuid = erc20tokencontract.getUUID();
		}
		
		// prepare wallet part
		var mvcmodule = global.getModuleObject('mvc');
		var mvcontrollers = mvcmodule.getControllersObject();

		mvcontrollers.prepareWalletFormPart(session, $scope, $state, $stateParams);

		
		// call hooks
		var erc20tokendeployform = document.getElementById("erc20tokendeployForm");
		
		angular.element(document).ready(function () {
			var result = [];
			
			var params = [];
			
			params.push($scope);
			params.push(erc20tokendeployform);

			var ret = global.invokeHooks('alterERC20TokenDeployForm_hook', result, params);
			
			if (ret && result && result.length) {
				console.log('erc20tokendeployform overload handled by a module');			
			}
	    });
		
		
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenDeploySubmit($scope);
		}
	}
	
	handleERC20TokenDeploySubmit($scope) {
		console.log("Controllers.handleERC20TokenDeploySubmit called");
		
		var self = this;
		var global = this.global;
		var app = this.getAppObject();
		
		// call hooks
		var result = [];
		
		var params = [];
		
		params.push($scope);

		var ret = global.invokeHooks('handleERC20TokenDeploySubmit_hook', result, params);
		
		if (ret && result && result.length) {
			console.log('handleERC20TokenDeploySubmit overloaded by a module');			
		}
		else {
			var wallet = $scope.walletused.text;
			var password = $scope.password.text;
			
			var gaslimit = $scope.gaslimit.text;
			var gasPrice = $scope.gasprice.text;
			
			var contractuuid = $scope.erc20token.uuid;
			
			
			var commonmodule = global.getModuleObject('common');
			var contracts = commonmodule.getContractsObject();
			
			var erc20tokenmodule = global.getModuleObject('erc20');
			var erc20tokencontrollers = erc20tokenmodule.getControllersObject();


			var contract = contracts.getContractObjectFromUUID(contractuuid);
			
			if ((contract) && (contract.isLocalOnly())) {
				var session = commonmodule.getSessionObject();
				
				var payingaccount = session.getAccountObject(wallet);
				
				// unlock account
				payingaccount.unlock(password, 300) // 300s, but we can relock the account
				.then(function(res) {
					try {
						contract.deploy(payingaccount, gaslimit, gasPrice, function (err, res) {
							
							if (!err) {
								console.log('contract deployed at ' + res);
								
								app.setMessage("contract has been deployed at " + res);
							}
							else  {
								console.log('error deploying contract ' + err);
								
								app.setMessage('error deploying contract ' + err);
							}
								
							// save erc20token
							erc20tokencontrollers.saveERC20TokenObject(contract, function(err, res) {
								self.getAngularControllers().gotoStatePage('home.erc20tokens');
							});
						});
						
						app.setMessage("contract deployment created a pending transaction");
						
					}
					catch(e) {
						app.setMessage("Error: " + e);
					}
					

					app.refreshDisplay();
				});
				
			}
		}


	}
	
	// transfers of tokens
	handleFromAccountSelectChange($scope) {
		var accountuuid = $scope.selectedfrom;
		
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();
		
		var fromaccount = commoncontrollers.getSessionAccountObjectFromUUID(session, accountuuid)

		if (fromaccount) {
			var frominput = document.getElementById("form-from-input");
			
			if (frominput) {
				frominput.value = fromaccount.getAddress();
				
				// refresh divcue
				
				var contractuuid = $scope.erc20token.uuid;

				// token contract
				var erc20tokenmodule = global.getModuleObject('erc20');
				var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
				
				var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);

				var divcue = document.getElementsByClassName('div-form-cue')[0];
				
				var values = erc20tokencontrollers.getAccountTokenTransferDefaultValues(session, erc20tokencontract, fromaccount, divcue);
			}
		}
	}
	
	handleToAccountSelectChange($scope) {
		var accountuuid = $scope.selectedto;
		
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();
		
		var account = commoncontrollers.getAccountObjectFromUUID(session, accountuuid)

		if (account) {
			var toinput = document.getElementById("form-to-input");
			
			if (toinput)
				toinput.value = account.getAddress();
		}
	}
	
	_getAccountArrays($scope, session) {
		var self = this;
		
		// all accounts
		var accountarray = session.getAccountObjects();
		
		var accounts = [];
		
		for (var i = 0; i < (accountarray ? accountarray.length : 0); i++) {
			var accnt = accountarray[i];
			
			var address = accnt.getAddress();
			var shortaddress = (address ? address.substring(0,4) + '...' + address.substring(address.length - 4,address.length) : '...');
			
			var account = [];
			
			account['uuid'] = accnt.getAccountUUID();
			account['address'] = accnt.getAddress();
			account['description'] = shortaddress + ' - ' + accnt.getDescription();
			
			accounts.push(account);
		}
			
			
		// change function
		$scope.handleToChange = function(){
			self.handleToAccountSelectChange($scope);
		}

		$scope.toaccounts = accounts;
		
		// session accounts
		var sessionaccountarray = session.getSessionAccountObjects();
		
		var sessionaccounts = [];
		
		for (var i = 0; i < (sessionaccountarray ? sessionaccountarray.length : 0); i++) {
			var accnt = sessionaccountarray[i];
			
			var address = accnt.getAddress();
			var shortaddress = (address ? address.substring(0,4) + '...' + address.substring(address.length - 4,address.length) : '...');
			
			var sessionaccount = [];
			
			sessionaccount['uuid'] = accnt.getAccountUUID();
			sessionaccount['address'] = accnt.getAddress();
			sessionaccount['description'] = shortaddress + ' - ' + accnt.getDescription();
			
			sessionaccounts.push(sessionaccount);
		}
			
			
		// change function
		$scope.handleFromChange = function(){
			self.handleFromAccountSelectChange($scope);
		}

		$scope.fromaccounts = sessionaccounts;

	}

	prepareERC20TokenAccountTransferForm($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenAccountTransferForm called");
		
		var self = this;

	    var contractuuid = $stateParams.uuid;
	    var accountaddress = $stateParams.address;

		// call module controller
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();
		
		// fill account list
		this._getAccountArrays($scope, session);
		
		
		// account
		var fromaccount = session.getSessionAccountObject(accountaddress);
		
		if (!fromaccount)  {
			if (session.isAnonymous()) {
				fromaccount = session.getAccountObject(accountaddress);
				
				if (!fromaccount) console.log('could not find account object for ' + accountaddress);
			}
			else {
				console.log('could not find account object in pour personal accounts for ' + accountaddress);
			}
			
		}
		
		// token contract
		var erc20tokenmodule = global.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		

		// filling fields
		var erc20token = [];
		
		$scope.erc20token = erc20token;
		
		$scope.from = {
				text: accountaddress
		};
		
		$scope.tokenamount = {
				text: "1"
		};
		
		if (erc20tokencontract) {
			erc20token.index = erc20tokencontract.getContractIndex();
			erc20token.uuid = erc20tokencontract.getUUID();
		}
		
		// prepare wallet part
		this.prepareTokenWalletFormPart(session, erc20tokencontract, fromaccount, $scope, $state, $stateParams);


		// call hooks
		var erc20tokendeployform = document.getElementById("erc20tokenaccounttransferForm");
		
		angular.element(document).ready(function () {
			var result = [];
			
			var params = [];
			
			params.push($scope);
			params.push(erc20tokendeployform);

			var ret = global.invokeHooks('alterERC20TokenAccountTransferForm_hook', result, params);
			
			if (ret && result && result.length) {
				console.log('erc20tokenaccounttransferForm overload handled by a module');			
			}
	    });
		
		
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenAccountTransferSubmit($scope);
		}
	}
	
	handleERC20TokenAccountTransferSubmit($scope) {
		console.log("Controllers.handleERC20TokenAccountTransferSubmit called");
		
		var global = this.global;
		var app = this.getAppObject();
		
		// call hooks
		var result = [];
		
		var params = [];
		
		params.push($scope);

		var ret = global.invokeHooks('handleERC20TokenAccountTransferSubmit_hook', result, params);
		
		if (ret && result && result.length) {
			console.log('handleERC20TokenAccountTransferSubmit overloaded by a module');			
		}
		else {
			var from = $scope.from.text;
			var to = $scope.to.text;

			var tokenamount = $scope.tokenamount.text;

			var wallet = $scope.walletused.text;
			var password = $scope.password.text;
			
			var gaslimit = $scope.gaslimit.text;
			var gasPrice = $scope.gasprice.text;
			
			var contractuuid = $scope.erc20token.uuid;
			
			
			var commonmodule = global.getModuleObject('common');
			var contracts = commonmodule.getContractsObject();
			
			var erc20tokenmodule = global.getModuleObject('erc20');
			var erc20tokencontrollers = erc20tokenmodule.getControllersObject();


			var contract = contracts.getContractObjectFromUUID(contractuuid);
			
			if (contract) {
				var session = commonmodule.getSessionObject();
				
				var fromaccount = session.getAccountObject(from);
				var toaccount = session.getAccountObject(to);
				var payingaccount = session.getAccountObject(wallet);
				
				// unlock account
				payingaccount.unlock(password, 300) // 300s, but we can relock the account
				.then(function(res) {
					console.log('paying account ' + wallet + ' is now unlocked');
					try {
						contract.transfer(fromaccount, toaccount, tokenamount, payingaccount, gaslimit, gasPrice, function (err, res) {
							
							if (!err) {
								console.log('transfer transaction successful: ' + res);
								
								app.setMessage("transfer transaction registered at " + res);
							}
							else  {
								console.log('error in token transfer: ' + err);
								
								app.setMessage("transfer encountered an error: " + err);
							}
								
						});
						
						app.setMessage("token transfer created a pending transaction");
						
					}
					catch(e) {
						app.setMessage("Error: " + e);
					}
					

					app.refreshDisplay();
				});
				
			}
		}


	}
	
	// burn of tokens

	prepareERC20TokenAccountBurnForm($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenAccountBurnForm called");
		
		var self = this;

	    var contractuuid = $stateParams.uuid;
	    var accountaddress = $stateParams.address;

		// call module controller
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();
		
		
		// account
		var fromaccount = session.getSessionAccountObject(accountaddress);
		
		// token contract
		var erc20tokenmodule = global.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		

		// filling fields
		var erc20token = [];
		
		$scope.erc20token = erc20token;
		
		$scope.from = {
				text: accountaddress
		};
		
		$scope.tokenamount = {
				text: "1"
		};
		
		if (erc20tokencontract) {
			erc20token.index = erc20tokencontract.getContractIndex();
			erc20token.uuid = erc20tokencontract.getUUID();
		}
		
		// prepare wallet part
		this.prepareTokenWalletFormPart(session, erc20tokencontract, fromaccount, $scope, $state, $stateParams);


		// call hooks
		var erc20tokendeployform = document.getElementById("erc20tokenaccountburnForm");
		
		angular.element(document).ready(function () {
			var result = [];
			
			var params = [];
			
			params.push($scope);
			params.push(erc20tokendeployform);

			var ret = global.invokeHooks('alterERC20TokenAccountBurnForm_hook', result, params);
			
			if (ret && result && result.length) {
				console.log('erc20tokenaccountburnForm overload handled by a module');			
			}
	    });
		
		
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenAccountBurnSubmit($scope);
		}
	}
	
	handleERC20TokenAccountBurnSubmit($scope) {
		console.log("Controllers.handleERC20TokenAccountBurnSubmit called");
		
		var global = this.global;
		var app = this.getAppObject();
		
		// call hooks
		var result = [];
		
		var params = [];
		
		params.push($scope);

		var ret = global.invokeHooks('handleERC20TokenAccountBurnSubmit_hook', result, params);
		
		if (ret && result && result.length) {
			console.log('handleERC20TokenAccountBurnSubmit overloaded by a module');			
		}
		else {
			var from = $scope.from.text;

			var tokenamount = $scope.tokenamount.text;

			var wallet = $scope.walletused.text;
			var password = $scope.password.text;
			
			var gaslimit = $scope.gaslimit.text;
			var gasPrice = $scope.gasprice.text;
			
			var contractuuid = $scope.erc20token.uuid;
			
			
			var commonmodule = global.getModuleObject('common');
			var contracts = commonmodule.getContractsObject();
			
			var erc20tokenmodule = global.getModuleObject('erc20');
			var erc20tokencontrollers = erc20tokenmodule.getControllersObject();


			var contract = contracts.getContractObjectFromUUID(contractuuid);
			
			if (contract) {
				var session = commonmodule.getSessionObject();
				
				var fromaccount = session.getAccountObject(from);
				var payingaccount = session.getAccountObject(wallet);
				
				// unlock account
				payingaccount.unlock(password, 300) // 300s, but we can relock the account
				.then(function(res) {
					try {
						contract.burn(fromaccount, tokenamount, payingaccount, gaslimit, gasPrice, function (err, res) {
							
							if (!err) {
								console.log('burn transaction successful: ' + res);
								
								app.setMessage("burn transaction registered at " + res);
							}
							else  {
								console.log('error in token burn: ' + err);
								
								app.setMessage("burn encountered an error: " + err);
							}
								
						});
						
						app.setMessage("token burn created a pending transaction");
						
					}
					catch(e) {
						app.setMessage("Error: " + e);
					}
					

					app.refreshDisplay();
				});
				
			}
		}


	}
	
	// approval of tokens

	prepareERC20TokenAccountApproveForm($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenAccountApproveForm called");
		
		var self = this;

	    var contractuuid = $stateParams.uuid;
	    var accountaddress = $stateParams.address;

		// call module controller
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();
		
		
		// account
		var fromaccount = session.getSessionAccountObject(accountaddress);
		
		// token contract
		var erc20tokenmodule = global.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		

		// filling fields
		var erc20token = [];
		
		$scope.erc20token = erc20token;
		
		$scope.from = {
				text: accountaddress
		};
		
		$scope.tokenamount = {
				text: "1"
		};
		
		if (erc20tokencontract) {
			erc20token.index = erc20tokencontract.getContractIndex();
			erc20token.uuid = erc20tokencontract.getUUID();
		}
		
		// prepare wallet part
		this.prepareTokenWalletFormPart(session, erc20tokencontract, fromaccount, $scope, $state, $stateParams);


		// call hooks
		var erc20tokendeployform = document.getElementById("erc20tokenaccountapproveForm");
		
		angular.element(document).ready(function () {
			var result = [];
			
			var params = [];
			
			params.push($scope);
			params.push(erc20tokendeployform);

			var ret = global.invokeHooks('alterERC20TokenAccountApproveForm_hook', result, params);
			
			if (ret && result && result.length) {
				console.log('erc20tokenaccountapproveForm overload handled by a module');			
			}
	    });
		
		
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenAccountApproveSubmit($scope);
		}
	}
	
	handleERC20TokenAccountApproveSubmit($scope) {
		console.log("Controllers.handleERC20TokenAccountApproveSubmit called");
		
		var global = this.global;
		var app = this.getAppObject();
		
		// call hooks
		var result = [];
		
		var params = [];
		
		params.push($scope);

		var ret = global.invokeHooks('handleERC20TokenAccountApproveSubmit_hook', result, params);
		
		if (ret && result && result.length) {
			console.log('handleERC20TokenAccountApproveSubmit overloaded by a module');			
		}
		else {
			var from = $scope.from.text;
			var to = $scope.to.text;

			var tokenamount = $scope.tokenamount.text;

			var wallet = $scope.walletused.text;
			var password = $scope.password.text;
			
			var gaslimit = $scope.gaslimit.text;
			var gasPrice = $scope.gasprice.text;
			
			var contractuuid = $scope.erc20token.uuid;
			
			
			var commonmodule = global.getModuleObject('common');
			var contracts = commonmodule.getContractsObject();
			
			var erc20tokenmodule = global.getModuleObject('erc20');
			var erc20tokencontrollers = erc20tokenmodule.getControllersObject();


			var contract = contracts.getContractObjectFromUUID(contractuuid);
			
			if (contract) {
				var session = commonmodule.getSessionObject();
				
				var toaccount = session.getAccountObject(to);
				var payingaccount = session.getAccountObject(wallet);
				
				// unlock account
				payingaccount.unlock(password, 300) // 300s, but we can relock the account
				.then(function(res) {
					try {
						contract.approve(toaccount, tokenamount, payingaccount, gaslimit, gasPrice, function (err, res) {
							
							if (!err) {
								console.log('approve transaction successful: ' + res);
								
								app.setMessage("approve transaction registered at " + res);
							}
							else  {
								console.log('error in token approve: ' + err);
								
								app.setMessage("approve encountered an error: " + err);
							}
								
						});
						
						app.setMessage("token approve created a pending transaction");
						
					}
					catch(e) {
						app.setMessage("Error: " + e);
					}
					

					app.refreshDisplay();
				});
				
			}
		}


	}

	prepareERC20TokenAccountApproveAndCallForm($scope, $state, $stateParams) {
		console.log("Controllers.prepareERC20TokenAccountApproveAndCallForm called");
		
		var self = this;

	    var contractuuid = $stateParams.uuid;
	    var accountaddress = $stateParams.address;

		// call module controller
		var global = this.global;
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		var session = commonmodule.getSessionObject();
		
		
		// account
		var fromaccount = session.getSessionAccountObject(accountaddress);
		
		// token contract
		var erc20tokenmodule = global.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(contractuuid);
		

		// filling fields
		var erc20token = [];
		
		$scope.erc20token = erc20token;
		
		$scope.from = {
				text: accountaddress
		};
		
		$scope.tokenamount = {
				text: "1"
		};
		
		if (erc20tokencontract) {
			erc20token.index = erc20tokencontract.getContractIndex();
			erc20token.uuid = erc20tokencontract.getUUID();
		}
		
		// prepare wallet part
		this.prepareTokenWalletFormPart(session, erc20tokencontract, fromaccount, $scope, $state, $stateParams);


		// call hooks
		var erc20tokendeployform = document.getElementById("erc20tokenaccountapproveandcallForm");
		
		angular.element(document).ready(function () {
			var result = [];
			
			var params = [];
			
			params.push($scope);
			params.push(erc20tokendeployform);

			var ret = global.invokeHooks('alterERC20TokenAccountApproveAndCallForm_hook', result, params);
			
			if (ret && result && result.length) {
				console.log('erc20tokenaccountapproveandcallForm overload handled by a module');			
			}
	    });
		
		
		// submit function
		$scope.handleSubmit = function(){
			self.handleERC20TokenAccountApproveAndCallSubmit($scope);
		}
	}
	
	handleERC20TokenAccountApproveAndCallSubmit($scope) {
		console.log("Controllers.handleERC20TokenAccountApproveAndCallSubmit called");
		
		var global = this.global;
		var app = this.getAppObject();
		
		// call hooks
		var result = [];
		
		var params = [];
		
		params.push($scope);

		var ret = global.invokeHooks('handleERC20TokenAccountApproveAndCallSubmit_hook', result, params);
		
		if (ret && result && result.length) {
			console.log('handleERC20TokenAccountApproveAndCallSubmit overloaded by a module');			
		}
		else {
			var to = $scope.to.text;

			var tokenamount = $scope.tokenamount.text;

			var wallet = $scope.walletused.text;
			var password = $scope.password.text;
			
			var gaslimit = $scope.gaslimit.text;
			var gasPrice = $scope.gasprice.text;
			
			var contractuuid = $scope.erc20token.uuid;
			
			
			var commonmodule = global.getModuleObject('common');
			var contracts = commonmodule.getContractsObject();
			
			var erc20tokenmodule = global.getModuleObject('erc20');
			var erc20tokencontrollers = erc20tokenmodule.getControllersObject();


			var contract = contracts.getContractObjectFromUUID(contractuuid);
			
			if (contract) {
				var session = commonmodule.getSessionObject();
				
				var toaccount = session.getAccountObject(to);
				var payingaccount = session.getAccountObject(wallet);
				var extraData = null;
				
				// unlock account
				payingaccount.unlock(password, 300) // 300s, but we can relock the account
				.then(function(res) {
					try {
						contract.approveAndCall(toaccount, tokenamount, extraData, payingaccount, gaslimit, gasPrice, function (err, res) {
							
							if (!err) {
								console.log('approve and call transaction successful: ' + res);
								
								app.setMessage("approveand call  transaction registered at " + res);
							}
							else  {
								console.log('error in token approve and call: ' + err);
								
								app.setMessage("approve and call encountered an error: " + err);
							}
								
						});
						
						app.setMessage("token approve and call created a pending transaction");
						
					}
					catch(e) {
						app.setMessage("Error: " + e);
					}
					

					app.refreshDisplay();
				});
				
			}
		}


	}

	//
	// utilities
	//
	prepareTokenWalletFormPart(session, erc20tokencontract, fromaccount, $scope, $state, $stateParams) {
		var global = session.getGlobalObject();
		
		var commonmodule = global.getModuleObject('common');
		var commoncontrollers = commonmodule.getControllersObject();

		// prepare ether wallet
		var mvcmodule = global.getModuleObject('mvc');
		var mvcontrollers = mvcmodule.getControllersObject();
		
		mvcontrollers.prepareWalletFormPart(session, $scope, $state, $stateParams);

		// token part
		var erc20tokenmodule = global.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
		// overload standard ether wallet part
		var divcue = document.getElementsByClassName('div-form-cue')[0];
		
		var values = erc20tokencontrollers.getAccountTokenTransferDefaultValues(session, erc20tokencontract, fromaccount, divcue);
		
		$scope.walletused = {
				text: (values['walletused'] ? values['walletused'] : null)
		};
		
		$scope.password = {
				text: null
		};
		
		$scope.gaslimit = {
				text: (values['gaslimit'] ? values['gaslimit'] : null)
		};
		
		$scope.gasprice = {
				text: (values['gasprice'] ? values['gasprice'] : null)
		};

		
	}
	


}

if ( typeof window !== 'undefined' && window )
GlobalClass.registerModuleClass('erc20-dapp', 'ERC20AngularControllers', DAPPControllers);
else
module.exports = DAPPControllers; // we are in node js