'use strict';

var ERC20Token = class {
	
	constructor(session, contractaddress) {
		this.session = session;
		this.address = contractaddress;
		
		this.uuid = null;
		

		// local data
		this.contractindex = null; // index in list of contracts

		this.local_name = null;
		this.local_symbol = null;
		this.local_decimals = null;
		this.local_totalSupply = null;
		
		this.local_description = null;
		
		this.local_creation_date = new Date().getTime();
		this.local_submission_date = null;
		
		// chain data
		
		
		// Contracts class
		var global = session.getGlobalObject();
		var commonmodule = global.getModuleObject('common');
		
		this.Contracts = commonmodule.Contracts;
		
		this.savedstatus = this.Contracts.STATUS_LOCAL;
		
		this.livestatus = this.Contracts.STATUS_LOCAL;
	}

	getAddress() {
		return this.address;
	}
	
	setAddress(address) {
		this.address = address;
	}
	
	getContractType() {
		return 'TokenERC20';
	}
	
	getUUID() {
		if (this.uuid)
			return this.uuid;
		
		this.uuid = this.session.getUUID();
		
		return this.uuid;
	}
	
	getContractLocalPersistor() {
		if (this.contractlocalpersistor)
			return this.contractlocalpersistor;
		
		var session = this.session;
		var contractuuid = this.getUUID();
		
		var global = GlobalClass.getGlobalObject();
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		this.contractlocalpersistor = new erc20tokenmodule.ERC20TokenLocalPersistor(session, contractuuid)
		
		return this.contractlocalpersistor;
	}
	
	// initialization of object
	initContract(json) {
		console.log('ERC20Token.initContract called for ' + this.address);
		
		//console.log('json is ' + JSON.stringify(json));
		
		var global = GlobalClass.getGlobalObject();
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		// load local ledger elements (if any)
		
		if (json["uuid"])
			this.uuid = json["uuid"];
		
		if (json["status"])
			this.setStatus(json["status"]);
		
		if (json["name"])
			this.local_name = json["name"];
		
		if (json["symbol"])
			this.local_symbol = json["symbol"];
		
		if (json["decimals"])
			this.local_decimals = json["decimals"];
		
		if (json["totalsupply"])
			this.local_totalSupply = json["totalsupply"];
		
		if (json["description"])
			this.local_description = json["description"];
		
		if (json["creationdate"])
			this.setLocalCreationDate(json["creationdate"]);
			
		if (json["submissiondate"])
			this.setLocalSubmissionDate(json["submissiondate"]);
			
		
	}
	
	getLocalJson() {
		// ledger part
		var uuid = this.getUUID();
		var address = this.getAddress();
		var contracttype = this.getContractType();
		
		var status = this.getStatus();
		
		var name = this.getLocalName();
		var symbol = this.getLocalSymbol();
		var decimals = this.getLocalDecimals();
		var totalsupply = this.getLocalTotalSupply();
		
		var description = this.getLocalDescription();
		
		var creationdate = this.getLocalCreationDate();
		var submissiondate = this.getLocalSubmissionDate();

		
		var json = {uuid: uuid, address: address, contracttype: contracttype, status: status, 
				name: name, symbol: symbol, decimals: decimals, totalsupply: totalsupply,
				creationdate: creationdate, submissiondate: submissiondate,
				description: description};
		
		// notice list
		if (this.localnoticearray) {
			var jsonarray = []

			for (var i = 0; i < this.localnoticearray.length; i++) {
				var notice = this.localnoticearray[i];
				
				if (notice.isLocalOnly()) {
					var jsonelement = notice.getLocalJson();
					jsonarray.push(jsonelement);
				}
			}
			
			//console.log('returning ' + jsonarray.length + ' local notices');
			json['notices'] = jsonarray;
		}

		return json;
	}
	
	saveLocalJson() {
		console.log('ERC20Token.saveLocalJson called for ' + this.address);

		var persistor = this.getContractLocalPersistor();
		
		persistor.saveERC20TokenJson(this);
	}
	
	
	// local part
	isLocalOnly() {
		if (this.address == null)
			return true;
		else
			return false;
	}
	
	isLocal() {
		return true; // necessarily true for contracts
	}
	
	isOnChain() {
		if (this.address == null)
			return false;
		else
			return true;
		//return (this.livestatus == this.Contracts.STATUS_ON_CHAIN);
	}
	
	getStatus() {
		// 4 local saved status STATUS_LOCAL, STATUS_LOST, STATUS_CANCELLED, STATUS_REJECTED
		// 2 local saved transient status STATUS_SENT, STATUS_PENDING
		// 1 chain saved status STATUS_DEPLOYED
		return this.savedstatus;
	}
	
	getLiveStatus() {
		// 3 local live status STATUS_LOCAL, STATUS_SENT, STATUS_PENDING
		// 2 chain live status STATUS_NOT_FOUND, STATUS_ON_CHAIN
		return this.livestatus;
	}
	
	checkStatus(callback) {
		var self = this;
		
		// 2 chain live status STATUS_NOT_FOUND, STATUS_ON_CHAIN

		if (this.address == null) {
			var status = this.getStatus();
			var callbacknow = true;
			
			switch(status) {
				case this.Contracts.STATUS_LOCAL:
				case this.Contracts.STATUS_LOST:
				case this.Contracts.STATUS_CANCELLED:
				case this.Contracts.STATUS_REJECTED:
					this.livestatus = this.Contracts.STATUS_LOCAL;
					break; // pure local
				
				case this.Contracts.STATUS_SENT:
				case this.Contracts.STATUS_PENDING: {
					// check if we can find address from our uuid
					var transactionuuid = this.getUUID();
					callbacknow = false;
					
					var contractinterface = this.getContractInterface();
					
					contractinterface.getAddressFromTransactionUUID(transactionuuid, function(err, res) {
						if (res) {
							var address = res;
							console.log('found address ' + address + ' for transaction ' + transactionuuid);
							
							self.setAddress(address);
							self.setStatus(self.Contracts.STATUS_DEPLOYED);
							self.livestatus = self.Contracts.STATUS_ON_CHAIN;

							status = self.getStatus();
							
							if (callback)
								callback(null, status);
						}
						else {
							self.livestatus = status;
						}
					});
				}
					break; // in the process
				
				case this.Contracts.STATUS_DEPLOYED: {
					// abnormal since we don't have an address
					console.log('Abnormal status for ' + self.local_name);

					// check if we can find address from our uuid
					var transactionuuid = this.getUUID();
					callbacknow = false;
					
					var contractinterface = this.getContractInterface();
					
					contractinterface.getAddressFromTransactionUUID(transactionuuid, function(err, res) {
						if (res) {
							var address = res;
							console.log('found address ' + address + ' for transaction ' + transactionuuid);
							
							self.setAddress(address);
							self.livestatus = self.Contracts.STATUS_ON_CHAIN;
							
							if (callback)
								callback(null, status);
						}
						else {
							self.livestatus = self.Contracts.STATUS_NOT_FOUND;
						}
					});
				}
					break; // reached a chain
					
				case this.Contracts.STATUS_NOT_FOUND:
				case this.Contracts.STATUS_ON_CHAIN:
					// abnormal since this is not a saved status
					console.log('Abnormal status for ' + self.local_name);
					this.setStatus(self.Contracts.STATUS_LOST);
					this.livestatus = status;
					break; // live status only flags
				
				default:
					break;
			}
			
			if ((callback) && (callbacknow))
				callback(null, status);
			
			return status;
		}
		else {
			// check to see if this address is a token contract
			// on the current block chain
			this.getChainSymbol(function(err, res) {
				var currentstatus = self.getStatus();
				
				// has been deployed
				// but not on this blockchain
				switch(currentstatus) {
					case self.Contracts.STATUS_LOCAL:
					case self.Contracts.STATUS_LOST:
					case self.Contracts.STATUS_CANCELLED:
					case self.Contracts.STATUS_REJECTED: {
						// abnormal since we have an address
						console.log('Abnormal status for ' + self.local_name);
						if ((err) || (!res)) {
							self.setStatus(self.Contracts.STATUS_DEPLOYED);
							self.livestatus = self.Contracts.STATUS_NOT_FOUND;
						}
						else {
							self.setStatus(self.Contracts.STATUS_DEPLOYED);
							self.livestatus = self.Contracts.STATUS_ON_CHAIN;
						}
					}
						break; // pure local

					case self.Contracts.STATUS_SENT:
					case self.Contracts.STATUS_PENDING: {
						// abnormal
						console.log('Abnormal status for ' + self.local_name);
						if (res) {
							self.setStatus(self.Contracts.STATUS_DEPLOYED);
							self.livestatus = self.Contracts.STATUS_ON_CHAIN;
						}
						else{
							self.livestatus = currentstatus;
						}
					}
						break; // in the process

					case self.Contracts.STATUS_DEPLOYED:
						if (res) {
							// found on this blockchain
							self.livestatus = self.Contracts.STATUS_ON_CHAIN;
						}
						else {
							self.livestatus = self.Contracts.STATUS_NOT_FOUND;
						}
						break; // reached a chain
					
					case self.Contracts.STATUS_NOT_FOUND:
					case self.Contracts.STATUS_ON_CHAIN: {
						// abnormal since this is a live status flag
						console.log('Abnormal status for ' + self.local_name);
						
						self.setStatus(self.Contracts.STATUS_DEPLOYED);
						self.livestatus = currentstatus;
					}
						break;
					
					default:
						self.setStatus(self.Contracts.STATUS_UNKOWN);
						break;
				}


				var status = self.getStatus();
				
				if (callback)
					callback(null, status);
				
				return status;
			});
		}
		
	}
	
	setStatus(status) {
		switch(status) {
			case this.Contracts.STATUS_LOST:
			case this.Contracts.STATUS_LOCAL:
			case this.Contracts.STATUS_SENT:
			case this.Contracts.STATUS_PENDING:
			case this.Contracts.STATUS_DEPLOYED:
			case this.Contracts.STATUS_CANCELLED:
			case this.Contracts.STATUS_REJECTED:
				this.savedstatus = status;
				break;
			default:
				// do not change for a unknown status
				break;
		}
	}
	
	getContractIndex() {
		return this.contractindex;
	}
	
	setContractIndex(index) {
		return this.contractindex = index;
	}
	
	getLocalName() {
		return this.local_name;
	}
	
	setLocalName(name) {
		this.local_name = name;
	}
	
	getLocalSymbol() {
		return this.local_symbol;
	}
	
	setLocalSymbol(symbol) {
		this.local_symbol = symbol;
	}
	
	getLocalDecimals() {
		return this.local_decimals;
	}
	
	setLocalDecimals(decimals) {
		this.local_decimals = decimals;
	}
	
	getLocalTotalSupply() {
		return this.local_totalSupply;
	}
	
	setLocalTotalSupply(totalSupply) {
		this.local_totalSupply = totalSupply;
	}
	
	getLocalDescription() {
		return this.local_description;
	}
	
	setLocalDescription(description) {
		this.local_description = description;
	}

	getLocalCreationDate() {
		return this.local_creation_date;
	}
	
	setLocalCreationDate(creation_date) {
		this.local_creation_date = creation_date;
	}
	
	getLocalSubmissionDate() {
		return this.local_submission_date;
	}
	
	setLocalSubmissionDate(submission_date) {
		this.local_submission_date = submission_date;
	}
	
	// chain part
	getContractInterface() {
		if (this.contractinterface)
			return this.contractinterface;
		
		var session = this.session;
		var contractaddress = this.address;
		
		var global = GlobalClass.getGlobalObject();
		var erc20tokenmodule = global.getModuleObject('erc20');
		
		this.contractinterface = new erc20tokenmodule.ERC20TokenContractInterface(session, contractaddress)
		
		return this.contractinterface;
	}
	
	
	
	// deployment
	deploy(payingaccount, gas, gasPrice, callback) {
		var self = this;
		var session = this.session;
		//var EthereumNodeAccess = session.getEthereumNodeAccessInstance();

		var fromaddress = payingaccount.getAddress();
		
		console.log('ERC20Token.deploy called for ' + this.local_description + " from " + fromaddress + " with gas limit " + gas + " and gasPrice " + gasPrice);
		
		var contractinterface = this.getContractInterface();
		
		var name = this.getLocalName();
		var symbol = this.getLocalSymbol();
		var decimals = this.getLocalDecimals();
		var totalSupply = this.getLocalTotalSupply();
		
		var transactionuuid = this.getUUID();
		
		this.setStatus(self.Contracts.STATUS_SENT);
		
		var promise = contractinterface.deploy(name, symbol, decimals, totalSupply, payingaccount, gas, gasPrice, transactionuuid, function (err, res) {
			console.log('ERC20Token.deploy transaction committed, transaction hash is: ' + res);
			
			self.setStatus(self.Contracts.STATUS_PENDING);
		})
		.then(function(res) {
			console.log('ERC20Token.deploy promise of deployment resolved, address is: ' + res);
			
			if (res) {
				self.setAddress(contractinterface.getAddress());
				self.setStatus(self.Contracts.STATUS_DEPLOYED);
				
				if (callback)
					callback(null, res);
			}
			else {
				if (callback)
					callback('error deploying token ' + name, null);
			}
			
			return res;
		});
		
		return promise;
	}
	


	//
	// asynchronous methods
	//
	
	getChainName(callback) {
		console.log('ERC20Token.getChainName called for ' + this.address);
		
		var contractinterface = this.getContractInterface();
		
		var promise = contractinterface.getName()
		.then(function (res) {
			console.log('ERC20Token.getChainName returns ' + res);
			
			if (callback) {
				if (res)
					callback(null, res);
				else
					callback('ERC20Token.getChainName returned null result', null);
			}
			
			return res;
		});
		
		return promise;
		
	}
	
	getChainSymbol(callback) {
		console.log('ERC20Token.getChainSymbol called for ' + this.address);
		
		var contractinterface = this.getContractInterface();
		
		var promise = contractinterface.getSymbol()
		.then(function (res) {
			console.log('ERC20Token.getChainSymbol returns ' + res);
			
			if (callback) {
				if (res)
					callback(null, res);
				else
					callback('ERC20Token.getChainSymbol returned null result', null);
			}
			
			return res;
		});
		
		return promise;
		
	}
	
	getChainTotalSupply(callback) {
		console.log('ERC20Token.getChainTotalSupply called for ' + this.address);
		
		var contractinterface = this.getContractInterface();
		
		var promise = contractinterface.getTotalSupply()
		.then(function (res) {
			console.log('ERC20Token.getChainTotalSupply returns ' + res);
			
			if (callback) {
				if (res)
					callback(null, res);
				else
					callback('ERC20Token.getChainTotalSupply returned null result', null);
			}
			
			return res;
		});
		
		return promise;
		
	}
	
	getChainDecimals(callback) {
		console.log('ERC20Token.getChainDecimals called for ' + this.address);
		
		var contractinterface = this.getContractInterface();
		
		var promise = contractinterface.getDecimals()
		.then(function (res) {
			console.log('ERC20Token.getChainDecimals returns ' + res);
			
			if (callback) {
				if (res)
					callback(null, res);
				else
					callback('ERC20Token.getChainDecimals returned null result', null);
			}
			
			return res;
		});
		
		return promise;
		
	}
	
	// positions
	balanceOf(account, callback) {
		var self = this;
		var session = this.session;
		
		var address = account.getAddress();
		
		var contractinterface = this.getContractInterface();
		
		var promise = contractinterface.balanceOf(address)
		.then(function(res) {
			console.log('ERC20Token.balanceOf received result: ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		});
		
		return promise;
		
	}
	
	allowance(alloweraccount, alloweeaccount, callback) {
		var self = this;
		var session = this.session;
		
		var alloweraddress = alloweraccount.getAddress();
		var alloweeaddress = alloweeaccount.getAddress();
		
		var contractinterface = this.getContractInterface();
		
		var promise = contractinterface.allowance(alloweraddress, alloweeaddress)
		.then(function(res) {
			console.log('ERC20Token.allowance received result: ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		});
		
		return promise;
	}
	
	// transactions
	transfer(senderaccount, recipientaccount, amount, payingaccount, gas, gasPrice, callback) {
		var self = this;
		var session = this.session;
		
		var payingaddress = payingaccount.getAddress();
		var fromaddress = senderaccount.getAddress();
		var toaddress = recipientaccount.getAddress();
		
		console.log('ERC20Token.transfer called from ' + fromaddress + ' to ' + toaddress + ' of ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice);
		
		
		var contractinterface = this.getContractInterface();
		
		var transactionuuid = session.guid();
		
		if (session.areAddressesEqual(payingaddress, fromaddress)) {
			var transferpromise = contractinterface.transfer(toaddress, amount, payingaccount, gas, gasPrice, transactionuuid);
		}
		else {
			var transferpromise = contractinterface.transferFrom(senderaccount, toaddress, amount, payingaccount, gas, gasPrice, transactionuuid);
		}
		
		var promise = transferpromise
		.then(function(res) {
			console.log('ERC20Token.transfer received result: ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		});
		
		return promise;
	}
	
	approve(alloweeaccount, amount, payingaccount, gas, gasPrice, callback) {
		var self = this;
		var session = this.session;
		
		var payingaddress = payingaccount.getAddress();
		var alloweraddress = payingaccount.getAddress();
		var alloweeaddress = alloweeaccount.getAddress();
		
		var toaddress = alloweeaccount.getAddress();
		
		console.log('ERC20Token.approve called for ' + alloweeaddress + ' by ' + alloweraddress + ' of ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice);
		
		
		var contractinterface = this.getContractInterface();
		
		var transactionuuid = session.guid();
		
		var promise = contractinterface.approve(alloweeaddress, amount, payingaccount, gas, gasPrice, transactionuuid)
		.then(function(res) {
			console.log('ERC20Token.approve received result: ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		});
		
		return promise;
	}
	
	
	approveAndCall(alloweeaccount, amount, extraData, payingaccount, gas, gasPrice, callback) {
		var self = this;
		var session = this.session;
		
		var payingaddress = payingaccount.getAddress();
		var alloweraddress = payingaccount.getAddress();
		var alloweeaddress = alloweeaccount.getAddress();
		
		var toaddress = alloweeaccount.getAddress();
		
		console.log('ERC20Token.approveAndCall called for ' + alloweeaddress + ' by ' + alloweraddress + ' of ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice);
		
		
		var contractinterface = this.getContractInterface();
		
		var transactionuuid = session.guid();
		
		var promise = contractinterface.approveAndCall(alloweeaddress, amount, extraData, alloweraccount, gas, gasPrice, transactionuuid)
		.then(function(res) {
			console.log('ERC20Token.approveAndCall received result: ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		});
		
		return promise;
	}
	
	burn(burnedaccount, amount, payingaccount, gas, gasPrice, callback) {
		var self = this;
		var session = this.session;
		
		var payingaddress = payingaccount.getAddress();
		var fromaddress = payingaccount.getAddress();
		var burnedaddress = burnedaccount.getAddress();
		
		console.log('ERC20Token.burn called from ' + fromaddress + ' on ' + burnedaddress + ' of ' + amount + ' with gas limit ' + gas + ' and gasPrice ' + gasPrice);
		
		
		var contractinterface = this.getContractInterface();
		
		var transactionuuid = session.guid();
		
		if (session.areAddressesEqual(payingaddress, burnedaddress)) {
			var burnpromise = contractinterface.burn(amount, payingaccount, gas, gasPrice, transactionuuid);
		}
		else {
			var burnpromise = contractinterface.burnFrom(burnedaddress, amount, payingaccount, gas, gasPrice, transactionuuid);
		}
		
		var promise = burnpromise
		.then(function(res) {
			console.log('ERC20Token.burn received result: ' + res);
			
			if (callback)
				callback(null, res);
			
			return res;
		});
		
		return promise;
	}
	

}


if ( typeof GlobalClass !== 'undefined' && GlobalClass )
	GlobalClass.registerModuleClass('erc20', 'ERC20Token', ERC20Token);
else
	module.exports = ERC20Token; // we are in node js

	