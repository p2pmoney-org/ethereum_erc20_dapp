'use strict';

var ModuleControllers = class {
	
	constructor(module) {
		this.module = module;
	}
	
	// erc20 tokens
	createERC20TokenObject(data) {
		console.log("Controllers.createERC20TokenObject called");
		
		var address = (data && data['address'] ? data['address'] : null);

		var name = (data && data['name'] ? data['name'] : null);
		var symbol = (data && data['symbol'] ? data['symbol'] : null);
		var decimals = (data && data['decimals'] ? data['decimals'] : null);
		var totalsupply = (data && data['totalsupply'] ? data['totalsupply'] : null);
		
		var description = (data && data['description'] ? data['description'] : null);


		var module = this.module;
		var global = module.global;
		var session = global.getModuleObject('common').getSessionObject();
		
		var contracts = session.getContractsObject();
		
		
		var contract = contracts.createBlankContractObject('TokenERC20');
		
		contract.setAddress(address);

		contract.setLocalName(name);
		contract.setLocalSymbol(symbol);
		contract.setLocalDecimals(decimals);
		contract.setLocalTotalSupply(totalsupply);

		contract.setLocalDescription(description);
		
		return contract;
	}
	
	modifyERC20TokenObject(contract, data) {
		console.log("Controllers.modifyERC20TokenObject called");
		
		var address = (data && data['address'] ? data['address'] : null);

		var name = (data && data['name'] ? data['name'] : null);
		var symbol = (data && data['symbol'] ? data['symbol'] : null);
		var decimals = (data && data['decimals'] ? data['decimals'] : null);
		var totalsupply = (data && data['totalsupply'] ? data['totalsupply'] : null);
		
		var description = (data && data['description'] ? data['description'] : null);


		var module = this.module;
		var global = module.global;
		var session = global.getModuleObject('common').getSessionObject();
		
		var contracts = session.getContractsObject();
		
		
		contract.setAddress(address);

		contract.setLocalName(name);
		contract.setLocalSymbol(symbol);
		contract.setLocalDecimals(decimals);
		contract.setLocalTotalSupply(totalsupply);

		contract.setLocalDescription(description);
		
		return contract;
	}
	
	removeERC20TokenObject(contract) {
		if (!contract)
			return;
		
		var module = this.module;
		var global = module.global;
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();
		
		var contracts = session.getContractsObject();

		contracts.removeContractObject(contract);
	}
		

	getERC20TokenFromKey(contractindex) {
		console.log("Controllers.getERC20TokenFromKey called with index: " + contractindex);

		var module = this.module;
		var global = module.global;
		var session = global.getModuleObject('common').getSessionObject();
		
		var contracts = session.getContractsObject();
		
		
		var contract = contracts.getContractObjectFromKey(contractindex);
		
		return contract;
	}
	
	getERC20TokenFromUUID(contractuuid) {
		console.log("Controllers.getERC20TokenFromUUID called with uuid: " + contractuuid);

		var module = this.module;
		var global = module.global;
		var session = global.getModuleObject('common').getSessionObject();
		
		var contracts = session.getContractsObject();
		
		
		var contract = contracts.getContractObjectFromUUID(contractuuid);
		
		return contract;
	}
	
	// tranfers
	getAccountTokenTransferDefaultValues(session, contract, fromaccount, divcue) {
		var values = [];
		
		var module = this.module;
		
		var global = module.global;
		var commonmodule = global.getModuleObject('common');
		
		var commoncontrollers = commonmodule.getControllersObject();


		var gaslimit = commonmodule.getDefaultGasLimit();
		var gasPrice = commonmodule.getDefaultGasPrice();
		
		values['gaslimit'] = gaslimit;
		values['gasprice'] = gasPrice;
		
		var walletaddress = null;
		
		if (session) {
			var sessionaccount = session.getMainSessionAccountObject();
			
			/*if (sessionaccount) {
				walletaddress = sessionaccount.getAddress();
			}
			else {
				if (commonmodule.useWalletAccount()) {
					// do we pay everything from a single wallet
					walletaddress = commonmodule.getWalletAccountAddress();
				}
				else {
					console.log('not using wallet account');
					console.log('wallet address is ' + commonmodule.getWalletAccountAddress());
				}
			}*/
			
			// erc20token.sol does not support "in name of" transactions
			// we necessarily use fromaccount as wallet
			walletaddress = fromaccount.getAddress();
			
			if (walletaddress) {
				
				values['walletused'] = walletaddress;
				
				if (divcue) {
					// we display the balance in the div passed
					var wallet = session.getAccountObject(walletaddress);
					
					this.writebalance(wallet, contract, fromaccount, divcue);
				}
			}
		}
	
		
		return values;
	}
	
	writebalance(wallet, contract, account, divbalance) {
		console.log('spawning write of getBalance');
		var self = this;
		
		var innerhtml = ''; // to avoid mvc-controller writing default wallet in-between our promises
		
		divbalance.currentwalletaddress = wallet.getAddress();

		var res = wallet.getChainBalance(function(err, res) {
			if (!err) {
				var global = self.module.global;
				
				var commonmodule = global.getModuleObject('common');
				var commoncontrollers = commonmodule.getControllersObject();

				var balancetext = commoncontrollers.getEtherStringFromWei(res);
				
				console.log('writebalance ether balance is ' + balancetext);
				innerhtml = global.t('The account') + ' ' + wallet.getAddress() + ' ' + global.t('has') + ' ' + balancetext + ' ' + global.t('Ether');
				divbalance.innerHTML = innerhtml;
			}
			else {
				console.log('writebalance ether balance error: ' + err);
			}
		})
		.then(function() {
			if ((contract) && (account)) {
				contract.balanceOf(account, function(err, res) {
					if (!err) {
						if (divbalance.currentwalletaddress.toLowerCase()  == wallet.getAddress().toLowerCase()) {
							// we write the balance, if indeed we are the current wallet selected for the div
							var global = self.module.global;
							var balancetext = res;
							
							console.log('writebalance token balance is ' + balancetext);
							innerhtml += '<br>' + global.t('The account') + ' ' + account.getAddress() + ' ' + global.t('has') + ' ' + balancetext + ' ' + global.t('Token(s)');
							divbalance.innerHTML = innerhtml;
						}
					}
					else {
						console.log('writebalance token balance error: ' + err);
					}
				});
			}
			else {
				if (!contract) console.log('writebalance error: contract is undefined');
				if (!account) console.log('writebalance error: account is undefined');
			}
		});
	}
	
	// asynchrone functions
	saveERC20TokenObject(contract, callback) {
		if (!contract)
			return;
		
		console.log("Controllers.saveERC20TokenObject called for contract uuid " + contract.getUUID());

		var module = this.module;
		var global = module.global;
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();
		
		var contracts = session.getContractsObject();
		
		var contractindex = contract.getContractIndex();
		var contractuuid = contract.getUUID();
		
		/*if (!contracts.getContractObjectFromUUID(contractuuid)) {
			// insert
			contracts.addContractObject(contract);
			
			session.saveContractObjects(contracts, function(err, res) {
				if (callback)
					callback(err, contracts);
			});
		}
		else {
			// update
			contract.saveLocalJson(function(err, res) {
				if (callback)
					callback(err, contracts);
			});
		}*/

		contract.saveLocalJson(function(err, res) {
			if (callback)
				callback(err, contracts);
		});
		
	}

	saveERC20Tokens(callback) {
		console.log("Controllers.saveERC20Tokens called");
		
		var module = this.module;
		var global = module.global;
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();
		
		var contracts = session.getContractsObject();

		session.saveContractObjects(contracts, function(err, res) {
			console.log('saveERC20Tokens returning from save');
			if (callback)
				callback(err, contracts);
		});
	}



}

GlobalClass.registerModuleClass('erc20', 'Controllers', ModuleControllers);