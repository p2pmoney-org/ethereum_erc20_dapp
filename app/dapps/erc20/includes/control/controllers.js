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
	
	saveERC20TokenObject(contract) {
		if (!contract)
			return;
		
		var module = this.module;
		var global = module.global;
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();
		
		var contracts = session.getContractsObject();
		
		var contractindex = contract.getContractIndex();
		
		if (!contracts.getContractObjectFromKey(contractindex)) {
			// insert
			contracts.addContractObject(contract);
			
			session.saveContractObjects(contracts);
		}
		else {
			// update
			contract.saveLocalJson();
		}

	}

	saveERC20Tokens() {
		var module = this.module;
		var global = module.global;
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();
		
		var contracts = session.getContractsObject();

		session.saveContractObjects(contracts);
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
			
			if (sessionaccount) {
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
			}
			
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
		
		var res = wallet.getChainBalance(function(err, res) {
			if (!err) {
				var global = self.module.global;
				
				var commonmodule = global.getModuleObject('common');
				var commoncontrollers = commonmodule.getControllersObject();

				var balancetext = commoncontrollers.getEtherStringFromWei(res);
				
				console.log('writebalance ether balance is ' + balancetext);
				divbalance.innerHTML = global.t('The account') + ' ' + wallet.getAddress() + ' ' + global.t('has') + ' ' + balancetext + ' ' + global.t('Ether');
			}
			else {
				console.log('writebalance ether balance error: ' + err);
			}
		})
		.then(function() {
			if ((contract) && (account)) {
				contract.balanceOf(account, function(err, res) {
					if (!err) {
						var global = self.module.global;
						var balancetext = res;
						
						console.log('writebalance token balance is ' + balancetext);
						divbalance.innerHTML += '<br>' + global.t('The account') + ' ' + account.getAddress() + ' ' + global.t('has') + ' ' + balancetext + ' ' + global.t('Token(s)');
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


}

GlobalClass.registerModuleClass('erc20', 'Controllers', ModuleControllers);