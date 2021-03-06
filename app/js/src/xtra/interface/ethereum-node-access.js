'use strict';

var Module = class {
	
	constructor() {
		this.name = 'ethereum-node-access';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.web3_version = "1.0.x";
		//this.web3_version = "0.20.x";
		
		//this.ethereum_node_access_instance = null;
	}
	
	init() {
		console.log('module init called for ' + this.name);

		var global = this.global;
		
		this.isready = true;
	}
	
	// compulsory  module functions
	loadModule(parentscriptloader, callback) {
		console.log('loadModule called for module ' + this.name);

		if (this.isloading)
			return;
			
		this.isloading = true;

		//var _globalscope = (typeof window !== 'undefined' && window  ? window : (typeof global !== 'undefined' && global ? global : console.log('WARNING: could not find global scope!')));
		var self = this;
		
		var _global = this.global;
		
		//var ScriptLoader = _globalscope.simplestore.ScriptLoader;
		
		var modulescriptloader = _global.getScriptLoader('ethereumnodeaccessmoduleloader', parentscriptloader);

		//var moduleroot = ScriptLoader.getDappdir() + './js/src/xtra/lib';
		var moduleroot = './js/src/xtra/lib';

		if (_global.isInBrowser()) {
			if (this.web3_version  == "1.0.x") {
				// browserified node module
				modulescriptloader.push_script( moduleroot + '/core-0.30.1-web3.min.js');

				//modulescriptloader.push_script( moduleroot + '/web3.min-1.0.0-beta36.js');
			}
			else {
				modulescriptloader.push_script( moduleroot + '/web3-0.20.3.js');
				modulescriptloader.push_script( moduleroot + '/truffle-contract-1.1.11.js');
			}
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

	// optional  module functions
	
	
	
	// objects
	createBlankEthereumNodeAccessInstance(session) {
		console.log('instantiating a EthereumNodeAccess instance');
		
		var global = this.global;
		var EthereumNodeAccessClass = global.getModuleClass('ethereum-node-access', 'EthereumNodeAccess');
		//var _globalscope = global.getExecutionGlobalScope();

		//var EthereumNodeAccessClass = (typeof EthereumNodeAccess !== 'undefined' ? EthereumNodeAccess : _globalscope.simplestore.EthereumNodeAccess);


		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		inputparams.push(session);
		
		result[0]= new EthereumNodeAccessClass(session);
		
		// call hook to let modify or replace instance
		var ethereum_node_access_instance;
		
		var ret = global.invokeHooks('getEthereumNodeAccessInstance_hook', result, inputparams);
		
		if (ret && result[0]) {
			ethereum_node_access_instance = result[0];
		}
		else {
			ethereum_node_access_instance = new EthereumNodeAccessClass(session);
		}
		
		return ethereum_node_access_instance;
		
	}
	
	getEthereumNodeAccessInstance(session) {
		if (session.ethereum_node_access_instance)
			return session.ethereum_node_access_instance;
		
		session.ethereum_node_access_instance = this.createBlankEthereumNodeAccessInstance(session);
		
		return session.ethereum_node_access_instance;
	}
	
	clearEthereumNodeAccessInstance(session) {
		session.ethereum_node_access_instance = null;
	}

	
	getArtifactProxyObject(artifactuuid, contractname, artifactpath, abi, bytecode) {
		var global = this.global;
		var ArtifactProxyClass = global.getModuleClass('ethereum-node-access', 'ArtifactProxy');

		return new ArtifactProxyClass(artifactuuid, contractname, artifactpath, abi, bytecode);
	}
	
	getContractProxyObject(contractuuid, artifact) {
		var global = this.global;
		var ContractProxyClass = global.getModuleClass('ethereum-node-access', 'ContractProxy');

		return new ContractProxyClass(contractuuid, artifact);
	}
	
	getContractInstanceProxyObject(contractinstanceuuid, address, contract) {
		var global = this.global;
		var ContractInstanceProxyClass = global.getModuleClass('ethereum-node-access', 'ContractInstanceProxy');

		return new ContractInstanceProxyClass(contractinstanceuuid, address, contract);
	}
	
	//
	// Web3
	//
	getWeb3Class(session) {
		if ( typeof window !== 'undefined' && window ) {
			if ( typeof window.Web3 !== 'undefined' && window.Web3 ) 
			return window.Web3;
			else {
				if (window.simplestore.Web3)
				return window.simplestore.Web3;
				else
				throw 'Web3 should be available in window.simplestore.Web3';
			}
		}
		else if (typeof global !== 'undefined') {
			return global.simplestore.Web3;
			//return require('web3');
		}
		else {
			throw 'not implemented';
		}
	}
	
	getWeb3ProviderUrl(session) {
		// return session's default
		var global = this.global;
		var ethnodemodule = global.getModuleObject('ethnode');

		var web3providerurl = ethnodemodule.getWeb3ProviderUrl(session);

		return web3providerurl;
	}
	
	getWeb3Provider(session, web3providerurl) {
		var Web3 = this.getWeb3Class(session);

		var global = this.global;
		var ethnodemodule = global.getModuleObject('ethnode');

		var _web3providerurl = (web3providerurl ? web3providerurl : ethnodemodule.getWeb3ProviderUrl(session));
		
		var options = {};
		
		options.headers = [];
		
		var _web3providerobject = ethnodemodule.getWeb3ProviderObject(session, _web3providerurl);
		
		var auth_basic = (_web3providerobject ? _web3providerobject.getVariable('auth_basic') : null);
		if (auth_basic) {
			var username = auth_basic.username;
			var password = auth_basic.password;
			
			options.headers.push({name: "Authorization", value: "Basic " + btoa(username + ":" + password)});
			
		}
		
		var _web3Provider = new Web3.providers.HttpProvider(_web3providerurl, options);

		return _web3Provider;
	}
	
	getWeb3Instance(session, web3providerurl) {
		
		if (!web3providerurl) {
			// return default
			if (session && session.ethereum_node_access_instance && session.ethereum_node_access_instance.web3instance)
				return session.ethereum_node_access_instance.web3instance; 
			
			var Web3 = this.getWeb3Class();
			var web3Provider = this.getWeb3Provider(session);
			  
			var web3instance = new Web3(web3Provider);		
			
			console.log("web3 instance created");
			
			if (session && session.ethereum_node_access_instance)
				session.ethereum_node_access_instance.web3instance = web3instance;
			
			return web3instance;
		}
		else {
			// look in session map
			if (!session.web3instancemap)
				session.web3instancemap = Object.create(null);
			
			var key = web3providerurl.toLowerCase();
			
			if (session.web3instancemap[key])
				return session.web3instancemap[key];
			
			var Web3 = this.getWeb3Class();
			var web3Provider = this.getWeb3Provider(session, web3providerurl);
			  
			var web3instance = new Web3(web3Provider);	
			
			console.log("alternate web3 instance created for provider " + web3providerurl);
			
			session.web3instancemap[key] = web3instance;
			
			return web3instance;
		}
		
		
	}
	
	getEthereumJsClass(session) {
		if ( typeof window !== 'undefined' && window ) {
			if (typeof window.ethereumjs !== 'undefined')
			return window.ethereumjs;
			else if (typeof window.simplestore.ethereumjs !== 'undefined')
				return window.simplestore.ethereumjs;
		}
		else if (typeof global !== 'undefined') {
			return global.simplestore.ethereumjs;
		}
		else {
			throw 'not implemented';
		}
	}

	
	getSolidityContractObject(session, abi) {
		var global = this.global;
		var SolidityContractClass = global.getModuleClass('ethereum-node-access', 'SolidityContract');

		return new SolidityContractClass(session, abi);
	}
	
	
	getEthereumTransactionObject(session, sendingaccount) {
		var global = this.global;
		var EthereumTransactionClass = global.getModuleClass('ethereum-node-access', 'EthereumTransaction');

		return new EthereumTransactionClass(session, sendingaccount);
	}
	
	unstackEthereumTransactionObject(session, params) {
		var global = this.global;
		var EthereumTransactionClass = global.getModuleClass('ethereum-node-access', 'EthereumTransaction');
		//var _globalscope = global.getExecutionGlobalScope();

		//var EthereumTransactionClass = (typeof EthereumTransaction !== 'undefined' ? EthereumTransaction : _globalscope.simplestore.EthereumTransaction);
		
		let txjson = params[params.length - 1];
		let args = params.slice(0,-1);

		if (txjson instanceof EthereumTransactionClass) {
			var ethereumtransaction = params[params.length - 1];
		}
		else {

			let fromaddress = txjson.from;
			let fromaccount = session.getAccountObject(fromaddress);
			
			let toaddress = (txjson.to ? txjson.to : null);
			let toaccount = (toaddress ? session.getAccountObject(toaddress) : null);
			
			let amount = (txjson.value ? txjson.value : 0);
			
			let gas = (txjson.gas ? txjson.gas : 0);
			let gasPrice = (txjson.gasPrice ? txjson.gasPrice : 0);
			
			let txdata = (txjson.data ? txjson.data : null);
			
			let nonce = (txjson.nonce ? txjson.nonce : null);
			
			let web3providerurl = this.web3_getProviderUrl();
			
			var ethereumtransaction = this.getEthereumTransactionObject(session, fromaccount);
		    
			ethereumtransaction.setToAddress(toaddress);
			ethereumtransaction.setValue(amount);
			ethereumtransaction.setGas(gas);
			ethereumtransaction.setGasPrice(gasPrice);
			ethereumtransaction.setData(txdata);
			ethereumtransaction.setNonce(nonce);
			ethereumtransaction.setWeb3ProviderUrl(web3providerurl);
		}
		
		return ethereumtransaction;
	}
	
	readEthereumTransactionObject(session, txhash, callback) {
		var self = this;
		var EthereumNodeAcessInstance = this.getEthereumNodeAccessInstance(session);
		
		return EthereumNodeAcessInstance.web3_getTransaction(txhash, function(err, data) {
			if (err) {
				if (callback)
					callback(err, null);
			}
			
			return data;
		})
		.then(function(data) {
			if (data) {
				let fromaddress = data['from'];
				let fromaccount = session.getAccountObject(fromaddress);
				
				let toaddress = data['to'];
				let toaccount = (toaddress ? session.getAccountObject(toaddress) : null);
				
				let amount = data['value'];
				
				let gas = data['gas'];
				let gasPrice = data['gasPrice'];
				
				let txdata = data['input'];
				
				let nonce = data['nonce'];
				
				let web3providerurl = self.getWeb3ProviderUrl(session);

				var ethereumtransaction = self.getEthereumTransactionObject(session, fromaccount);
			    
				ethereumtransaction.setToAddress(toaddress);
				ethereumtransaction.setValue(amount);
				ethereumtransaction.setGas(gas);
				ethereumtransaction.setGasPrice(gasPrice);
				ethereumtransaction.setData(txdata);
				ethereumtransaction.setNonce(nonce);
				ethereumtransaction.setWeb3ProviderUrl(web3providerurl);
				

				if (callback)
					callback(null, ethereumtransaction);
				
				return ethereumtransaction;
			}
		});
	}
	
	// web3 utils
	web3ToAscii(session, input) {
		var web3 = this.getWeb3Instance(session);
		
		if (this.web3_version  == "1.0.x") {
			return web3.utils.hexToAscii(input);
		}
		else {
			return web3.toAscii(input);
		}
		
	}

	web3ToUTF8(session, input) {
		var web3 = this.getWeb3Instance(session);
		
		if (this.web3_version  == "1.0.x") {
			return web3.utils.hexToUtf8(input);
		}
		else {
			throw 'not implemented';
		}
		
	}

}

var ArtifactProxy = class {
	constructor(artifactuuid, contractName, artifactpath, abi, bytecode) {
		this.artifactuuid = artifactuuid;
		this.artifactpath = artifactpath;
		this.contractName = contractName;
		this.abi = abi;
		this.bytecode = bytecode;
	}
	
	getArtifactPath() {
		return this.artifactpath;
	}
	
	getContractName() {
		return this.contractName;
	}
	
	getAbi() {
		return this.abi;
	}
	
	getByteCode() {
		return this.bytecode;
	}
	
	getUUID() {
		return this.artifactuuid;
	}
}

var ContractProxy = class {
	constructor(contractuuid, artifact) {
		this.contractuuid = contractuuid;
		this.artifact = artifact;
	}
	
	getUUID() {
		return this.contractuuid;
	}
	
	getArtifact() {
		return this.artifact;
	}
	
	getAbi() {
		return (this.artifact['abi'] ? this.artifact['abi'] : null);
	}

	getByteCode() {
		return (this.artifact['bytecode'] ? this.artifact['bytecode'] : null);
	}

	getContractName() {
		return (this.artifact['contractName'] ? this.artifact['contractName'] : null);
	}
}

var ContractInstanceProxy = class {
	constructor(contractinstanceuuid, address, contract) {
		this.contractinstanceuuid = contractinstanceuuid;
		this.address = address;
		this.contract = contract;
		
		this.instance = null;
	}
	
	getUUID() {
		return this.contractinstanceuuid;
	}
	
	getAddress() {
		return this.address;
	}
	
	getAbi() {
		return this.contract.getAbi();
	}
	
	getContract() {
		return this.contract;
	}
	
	getInstance() {
		return this.instance;
	}
}



class SolidityContract {
	constructor(session, abi) {
		
		this.session = session;
		this.abi = abi;
		
		var global = session.getGlobalObject();
		var ethereumnodeaccessmodule = global.getModuleObject('ethereum-node-access');
		
		this.ethereumnodeaccessmodule = ethereumnodeaccessmodule;
		this.web3_version = ethereumnodeaccessmodule.web3_version;
		
		this.web3 = ethereumnodeaccessmodule.getWeb3Instance(session);
	}
	
	getMethodAbiDefinition(methodname) {
		var abi = this.abi;
		var abidef = null;
		
		if (!abi)
			return abidef;
		
		for (var i = 0; i < abi.length; i++) {
			var item = abi[i];
			var name = item.name;
			
			if (name == methodname) {
				abidef = item;
				
				break;
			}
		}
		
		return abidef;
	}
	

	
	getDeployData(bytecode, args) {
		var web3 = this.web3;
		var session = this.session;
		
		var abi = this.abi;

		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			
			if (!bytecode)
				throw 'no byte code, can not deploy contract';
			
			
			// creating contract object
			var contract = new web3.eth.Contract(abi);

			// then create a deploy transaction data
			var deploy = contract.deploy({
	              data: bytecode,
	              arguments: args
			}).encodeABI();
			
			return deploy
			
		}
		else {
			throw 'not implemented';
		}
	}
	
	getCallData(address, abidef, args) {
		var session = this.session;
		var web3 = this.web3;
		
		var abi = this.abi;
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var instance = new web3.eth.Contract(abi, address);
				// should be done before reading signature
				// because fills signature hex value
		}
		else {
			var instance = web3.eth.contract(abi).at(address);
		}

		var methodname = abidef.name;
		var signature = abidef.signature;
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = instance.methods[signature];

			// create a call transaction data
			//let calldata = funcname(...args).encodeABI();
			let calldata = instance.methods[signature](...args).encodeABI();
			
			return calldata;
		}
		else {
			// Web3 == 0.20.x
			

			var funcname = instance[methodname];

			// create a call transaction data
			// NOT TESTED
			//let calldata = funcname.call(...params).encodeABI();
			let calldata = funcname.getData(args);
			
			return calldata;
		}
	}
}

class EthereumTransaction {
	constructor(session, sendingaccount) {
		this.session = session;
		
		this.transactionuuid = null;
		this.transactionHash = null;
		
		this.sendingaccount = sendingaccount;
		this.payingaccount = null;
		
		this.recipientaccount = null;
		
		var global = session.getGlobalObject();
		var commonmodule = global.getModuleObject('common');
		var ethnodemodule = global.getModuleObject('ethnode');
		
		this.value = 0;
		
		this.gas = ethnodemodule.getDefaultGasLimit(session);
		this.gasPrice = ethnodemodule.getDefaultGasPrice(session);
		
		this.data = null;
		
		this.nonce = null;
		
		this.status = null;
		
		this.web3providerurl = null;

		this.chainid = null;
		this.networkid = null;
		
		var ethereumnodeaccessmodule = global.getModuleObject('ethereum-node-access');
		
		this.ethereumnodeaccessmodule = ethereumnodeaccessmodule;
		this.web3_version = ethereumnodeaccessmodule.web3_version;

		this.ethereumnodeaccessinstance = null;
		
		this.web3 = null;
	}
	
	getTransactionUUID() {
		return this.transactionuuid;
	}
	
	setTransactionUUID(txuuid) {
		this.transactionuuid = txuuid;
	}
	
	getTransactionHash() {
		return this.transactionHash;
	}
	
	setTransactionHash(txhash) {
		this.transactionHash = txhash;
	}
	
	getPayerAddress() {
		if (this.payingaccount)
			return this.payingaccount.getAddress();
		else
			return this.getFromAddress(); // sender is the payer by default
	}

	getPayingAccount() {
		return this.payingaccount;
	}

	setPayingAccount(payingaccount) {
		this.payingaccount = payingaccount; // needs an open account on a relay node
	}
	
	getFromAddress() {
		return this.sendingaccount.getAddress();
	}
	
	getFromAccount() {
		return this.sendingaccount;
	}
	
	getToAddress() {
		return (this.recipientaccount ? this.recipientaccount.getAddress() : null);
	}
	
	getToAccount() {
		return this.recipientaccount;
	}
	
	setToAddress(address) {
		var toaccount = this.session.getAccountObject(address);
		
		this.recipientaccount = toaccount;
	}

	getValue() {
		return this.value;
	}
	
	setValue(value) {
		this.value = value;
	}
	
	getGas() {
		return this.gas;
	}
	
	setGas(gas) {
		this.gas = gas;
	}
	
	getGasPrice() {
		return this.gasPrice;
	}
	
	setGasPrice(gasprice) {
		this.gasPrice = gasprice;
	}
	
	getNonce() {
		return this.nonce;
	}
	
	setNonce(nonce) {
		this.nonce = nonce;
	}
	
	getData() {
		this.data;
	}
	
	setData(data) {
		this.data = data;
	}
	
	getStatus() {
		return this.status;
	}
	
	setStatus(status) {
		this.status = status;
	}
	
	getWeb3ProviderUrl() {
		if (this.web3providerurl)
		return this.web3providerurl;
		
		// return default
		var global = this.session.getGlobalObject();
		var ethnodemodule = global.getModuleObject('ethnode');
		
		return ethnodemodule.getWeb3ProviderUrl();
	}
	
	setWeb3ProviderUrl(url) {
		this.web3providerurl = url;
	}
	
	getChainId() {
		if (this.chainid)
		return this.chainid;

		// return default
		var global = this.session.getGlobalObject();
		var session = this.session;
		var ethnodemodule = global.getModuleObject('ethnode');

		var _web3providerurl = this.getWeb3ProviderUrl()

		var _web3providerobject = ethnodemodule.getWeb3ProviderObject(session, _web3providerurl);

		this.chainid = (_web3providerobject ? _web3providerobject.getVariable('chainid') : null);

		return this.chainid;
	}

	setChainId(chainid) {
		this.chainid = chainid;
	}

	getNetworkId() {
		if (this.networkid)
		return this.networkid;

		// return default
		var global = this.session.getGlobalObject();
		var session = this.session;
		var ethnodemodule = global.getModuleObject('ethnode');

		var _web3providerurl = this.getWeb3ProviderUrl()

		var _web3providerobject = ethnodemodule.getWeb3ProviderObject(session, _web3providerurl);

		this.networkid = (_web3providerobject ? _web3providerobject.getVariable('networkid') : null);

		return this.networkid;
	}

	setNetworkId(networkid) {
		this.networkid = networkid;
	}
	
	_getWeb3Instance() {
		if (this.web3)
			return this.web3;
		
		var session = this.session;
		var web3providerurl = this.web3providerurl;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;

		this.web3 = ethereumnodeaccessmodule.getWeb3Instance(session, web3providerurl);
		
		return this.web3;
	}
	
	_getEthereumNodeAccessInstance() {
		if (this.ethereumnodeaccessinstance)
			return this.ethereumnodeaccessinstance;

		var session = this.session;
		var global = session.getGlobalObject();
		var ethnodemodule = global.getModuleObject('ethnode');
		var web3providerurl = this.web3providerurl;

		// pick the instance in the session
		this.ethereumnodeaccessinstance = ethnodemodule.getEthereumNodeAccessInstance(session, web3providerurl);
		
		return this.ethereumnodeaccessinstance;
	}

	_setEthereumNodeAccessInstance(ethereumnodeaccessinstance) {
		this.ethereumnodeaccessinstance = ethereumnodeaccessinstance;
	}
	
	getTxJson() {
		var web3 = this._getWeb3Instance();
		
		var fromaccount = this.sendingaccount;
		var toaccount = this.recipientaccount;
		
		var amount = this.value;
		var gas = this.gas;
		var gasPrice = this.gasPrice;

		var chainid = this.getChainId(); // EIP-155 replay protection
		var networkid = this.getNetworkId();
		
		var txdata = this.data;
		var nonce = this.nonce;
		
		var fromaddress = fromaccount.getAddress();
		var toaddress = (toaccount ? toaccount.getAddress() : null);
		
		var txjson = {from: fromaddress,
				to: toaddress,
				gas: gas, 
				gasPrice: gasPrice,
				chainid: chainid,
				networkid: networkid
			};
		
		if (nonce)
			txjson.nonce = nonce;
		
		if (txdata)
			txjson.data = txdata;

		// amount conversion to Wei
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			if (amount)
				txjson.value = web3.utils.toWei(amount, 'ether');
		}
		else {
			// Web3 == 0.20.x
			if (amount)
				txjson.value = web3.toWei(amount, 'ether');
		}
		

		return txjson;
	}

	_getTransactionNonce(session, address, callback) {
		var EthereumNodeAccess = this._getEthereumNodeAccessInstance();
		var self = this;

		return new Promise(function (resolve, reject) {
			// return nonce if it has been pre-filled
			if (self.nonce !== null) {
				var fromaddress = self.getFromAddress();
				if (fromaddress && address && (fromaddress == address))
				resolve(self.nonce);
			}

			// else look in session to handle multiple transactions within a block
			var _tx_nonce = session.getSessionVariable('tx-nonce-' + address);

			if (_tx_nonce !== undefined) {
				self.nonce = _tx_nonce;
				resolve(_tx_nonce);
			}
			else {
				// if none, look at transaction count to initialize value
				if (EthereumNodeAccess) {
					return EthereumNodeAccess.web3_getTransactionCount(address, 'pending', function (err, count) {
						if (err) reject(err); else resolve(count);
					});
				}
				else {
					// note: will necessarily use local access
					var web3 = self._getWeb3Instance();
				
					return web3.eth.getTransactionCount(address, 'pending', function (err, count) {
						if (err) reject(err); else resolve(count);
					});
				}
			}
			
		})
		.then(count => {
			session.setSessionVariable('tx-nonce-' + address, count + 1);

			if (callback)
			callback(null, count);

			return count;
		})
		.catch(err => {
			if (callback)
			callback(err, null);
		});
	}
	
	getRawData(callback) {
		var self = this;
		var session = this.session;
		var global = session.getGlobalObject();
		
		var web3 = this._getWeb3Instance();
		var fromaccount = this.sendingaccount;  // tx is signed by sending account even if not final payer
		var toaccount = this.recipientaccount;
		
		var amount = this.value;
		var gas = this.gas;
		var gasPrice = this.gasPrice;
		
		var txdata = this.data;
		var nonce = this.nonce;
		
		var fromaddress = fromaccount.getAddress();
		var toaddress = (toaccount ? toaccount.getAddress() : null);
		
		var txjson = this.getTxJson();
		
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		var EthereumNodeAccess = this._getEthereumNodeAccessInstance();

		var _txjson = Object.assign({}, txjson);

		if (fromaccount.canSignTransactions()) {
		    // signing
			if (this.web3_version == "1.0.x") {
				// Web3 > 1.0

			    // turn gas, gasprice and value to hex
			    // not to receive "insufficient funds for gas * price + value"
			    _txjson.gas = web3.utils.toHex(gas.toString());
				_txjson.gasLimit = web3.utils.toHex(gas.toString());
			    _txjson.gasPrice = web3.utils.toHex(gasPrice.toString());

			    _txjson.value = web3.utils.toHex((txjson.value ? txjson.value.toString() : 0));

				if (txjson.data && (typeof txjson.data === 'string' || txjson.data instanceof String)) {
					// transform into hexadecimal string
					_txjson.data = web3.utils.toHex(txjson.data);
				}
			}
			else {
				// Web3 == 0.20.x

			    // turn gas, gasprice and value to hex
			    // not to receive "insufficient funds for gas * price + value"
			    _txjson.gas = web3.toHex(gas.toString());
				_txjson.gasLimit = web3.utils.toHex(gas.toString());
			    _txjson.gasPrice = web3.toHex(gasPrice.toString());

				_txjson.value = web3.toHex(txjson.value.toString());
			}
			
		    // chaining promises to get chainid and networkid from web3 provider
			// if they were not specified
			return this._getTransactionNonce(session, fromaddress)
			.then(function(count) {
				txjson.nonce = (nonce ? nonce : count);
				_txjson.nonce = (nonce ? nonce : count);
				
				if (txjson.chainid)
					return txjson.chainid;
				else
					return EthereumNodeAccess.web3_getChainId();
			})
			.then(function(chainid) {
				_txjson.chainid = chainid;
				
				if (txjson.networkid)
					return txjson.networkid;
				else
					return EthereumNodeAccess.web3_getNetworkId();
			})
			.then(function(networkid) {
				_txjson.networkid = networkid;
				
				// creating and signing a transaction from fromaccount
				var ethereumjs = ethereumnodeaccessmodule.getEthereumJsClass(session);
				
				const customChain = ethereumjs.Common.forCustomChain(
					'mainnet',{ name: 'customchain', networkId: _txjson.networkid, chainId: _txjson.chainid},
					'petersburg'
				);

				var hexprivkey = fromaccount.getPrivateKey();
				var privkey = hexprivkey.substring(2);
				var bufprivkey = ethereumjs.Buffer.Buffer.from(privkey, 'hex');
		
/* 				// using constructor
				var tx = new ethereumjs.Tx(_txjson, { common: customChain });
				
				tx.sign(bufprivkey);

				console.log("The transaction's json is", tx.toJSON());

				// construct raw data
				var raw = '0x' + tx.serialize().toString('hex'); */

				// using fromTxData
				var _tx = ethereumjs.Tx.fromTxData(_txjson, { common: customChain });

				const _signedTx = _tx.sign(bufprivkey);

				console.log("The transaction's json is", _tx.toJSON());

				var _raw = '0x' + _signedTx.serialize().toString('hex');

				if (callback)
					callback(null, _raw);

				return _raw;
			})
			.catch(function(err) {
				if (callback)
					callback(err, null);
			});
		}
		else {
			throw 'not implemented';
		}
	}
	
	canSignTransaction() {
		return this.sendingaccount.canSignTransactions();
	}
}

class EthereumNodeAccess {
	constructor(session) {
		this.session = session;
		
		//this.web3providerurl = null;
		this.web3instance = null;
		
		var global = session.getGlobalObject();
		var ethereumnodeaccessmodule = global.getModuleObject('ethereum-node-access');
		
		if (!ethereumnodeaccessmodule)
			throw 'ethereum-node-access module is no loaded';
		
		this.ethereumnodeaccessmodule = ethereumnodeaccessmodule;
		this.web3_version = ethereumnodeaccessmodule.web3_version;
		
		this.web3providerurl = null;
		this.web3artifactrooturi = null;
	}
	
	isReady(callback) {
		var promise = new Promise(function (resolve, reject) {
			
			if (callback)
				callback(null, true);
			
			resolve(true);
		});
		
		return promise
	}
	
	//
	// Web3
	//
	_getWeb3Class() {
		return this.ethereumnodeaccessmodule.getWeb3Class(this.session);
	}
	
	_getWeb3Provider() {
		return  this.ethereumnodeaccessmodule.getWeb3Provider(this.session, this.web3providerurl);
	}
	
	_getWeb3Instance() {
		if (this.web3instance)
			return this.web3instance;
		
		this.web3instance = this.ethereumnodeaccessmodule.getWeb3Instance(this.session, this.web3providerurl);		
		
		console.log("web3 instance created in EthereumNodeAccess" + (this.web3providerurl ? " for " + this.web3providerurl : " (with default provider)"));
		
		return this.web3instance;
	}
	
	
	
	// node
	web3_getProviderUrl() {
		if (this.web3providerurl)
			return this.web3providerurl;
		
		this.web3providerurl = this.ethereumnodeaccessmodule.getWeb3ProviderUrl(this.session);
		
		return this.web3providerurl;
	}
	
	web3_setProviderUrl(url, callback) {
		this.web3instance = null;
		
		/*var Web3 = this.ethereumnodeaccessmodule.getWeb3Class();
		var web3Provider = new Web3.providers.HttpProvider(url);
		
		this.web3instance = new Web3(web3Provider);*/
		
		this.web3providerurl = url;
		
		this.web3instance = this._getWeb3Instance();
		
		if (callback)
			callback(null, this.web3instance);
		
		return Promise.resolve(this.web3instance);
	}
	
	web3_isSyncing(callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				if (self.web3_version == "1.0.x") {
					// Web3 > 1.0
					var funcname = web3.eth.isSyncing;
				}
				else {
					// Web3 == 0.20.x
					var funcname = web3.eth.getSyncing;
				}

				return funcname( function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		})
		.catch(function(err) {
			if (callback)
				callback('error: '+ err, null);
		});
		
		return promise
	}
	
	web3_isListening(callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				if (self.web3_version == "1.0.x") {
					// Web3 > 1.0
					var funcname = web3.eth.net.isListening;
				}
				else {
					// Web3 == 0.20.x
					var funcname = web3.net.getListening;
				}

				return funcname( function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		})
		.catch(function(err) {
			if (callback)
				callback('error: '+ err, null);
		});
		
		return promise
	}
	
	web3_getChainId(callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				if (self.web3_version == "1.0.x") {
					// Web3 > 1.0
					var funcname = web3.eth.getChainId;
				}
				else {
					// Web3 == 0.20.x
					var funcname = web3.version.getNetwork; // hope chainid and networkid are the same
				}

				
				return funcname( function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		})
		.catch(function(err) {
			if (callback)
				callback('error: '+ err, null);
		});
		
		return promise
	}

	web3_getNetworkId(callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				if (self.web3_version == "1.0.x") {
					// Web3 > 1.0
					var funcname = web3.eth.net.getId;
				}
				else {
					// Web3 == 0.20.x
					var funcname = web3.version.getNetwork;
				}

				
				return funcname( function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		})
		.catch(function(err) {
			if (callback)
				callback('error: '+ err, null);
		});
		
		return promise
	}
	
	web3_getPeerCount(callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				if (self.web3_version == "1.0.x") {
					// Web3 > 1.0
					var funcname = web3.eth.net.getPeerCount;
				}
				else {
					// Web3 == 0.20.x
					var funcname = web3.net.getPeerCount;
				}

				
				return funcname( function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		})
		.catch(function(err) {
			if (callback)
				callback('error: '+ err, null);
		});
		
		return promise
	}

	// node
	web3_getNodeInfo(callback) {
		var self = this
		var session = this.session;

		var promises = [];
		var promise;
		
		var issyncing;
		var currentblock = -1;
		var highestblock = -1;
		
		// islistening
		promise = this.web3_isListening();
		promises.push(promise);
		
		// chainid
		promise = this.web3_getChainId();
		promises.push(promise);

		
		// networkid
		promise = this.web3_getNetworkId();
		promises.push(promise);

		// peercount
		promise = this.web3_getPeerCount();
		promises.push(promise);

		
		// issyncing
		promise = this.web3_isSyncing(function(error, result) {
			var syncingobj;
			
			if (!error) {
				if(result !== false) {
					issyncing = true;
					
					var arr = [];

					for(var key in result){
					  arr[key] = result[key];
					}
					
					syncingobj = arr;
				}
				else {
					issyncing = false;
					
					syncingobj = false;
				}
			}
			else {
				issyncing = error;
			}
			return result;
		});
		promises.push(promise);
		
		// blocknumber
		promise = this.web3_getBlockNumber();
		promises.push(promise);
		
		// all promises
		return Promise.all(promises).then(function(res) {
			var islistening = res[0];
			var chainid = res[1];
			var networkid = res[2];
			var peercount = res[3];
			var syncingobj = res[4];
			var blocknumber = res[5];
			
			currentblock = ((syncingobj !== false) && (syncingobj) && (syncingobj['currentBlock']) ? syncingobj['currentBlock'] : blocknumber);
			highestblock = ((syncingobj !== false) && (syncingobj) && (syncingobj['highestBlock']) ? syncingobj['highestBlock'] : blocknumber);

			var json = {islistening: islistening, 
					chainid: chainid, 
					networkid: networkid, 
					peercount: peercount, 
					issyncing: issyncing,
					currentblock: currentblock,
					highestblock: highestblock};
			
			if (callback)
				callback(null, json);
			
			return json
		});
	}

	
	// accounts
	web3_getBalanceSync(address) {
		var web3 = this._getWeb3Instance();
		var balance = web3.eth.getBalance(address);
		
		return balance;
	}
	
	web3_getBalance(address, callback) {
		if (!callback)
			return this.web3_getBalanceSync(address);
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				return web3.eth.getBalance(address, function(err, balance) {
					if (!err) {
						if (callback)
							callback(null, balance);
						
						return resolve(balance);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getCode(address, callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				return web3.eth.getCode(address, function(err, code) {
					if (!err) {
						if (callback)
							callback(null, code);
						return resolve(code);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_unlockAccount(account, password, duration, callback) {
		var self = this;
		var web3 = this._getWeb3Instance();
		
		if (account.canSignTransactions()) {
			var privatekey = account.getPrivateKey();
			
			var promise = new Promise(function (resolve, reject) {
				if (self.web3_version == "1.0.x") {
					// create an account from private key
					// (used in lock account to remove account from wallet)
					var web3account = web3.eth.accounts.privateKeyToAccount(privatekey);
					account.web3account = web3account;
				}

				if (callback)
					callback(null, true);

				return resolve(true);
			});
			
		}
		else {
			var address = account.getAddress();
			
			if (self.web3_version == "1.0.x") {
				// Web3 > 1.0
				var funcname = web3.eth.personal.unlockAccount;
			}
			else {
				// Web3 == 0.20.x
				var funcname = web3.personal.unlockAccount;
			}
			
			var promise = new Promise(function (resolve, reject) {
				try {
					
					return funcname(address, password, duration, function(err, res) {
						if (!err) {
							if (callback)
								callback(null, res);
							return resolve(res);
						}
						else {
							if (callback)
								callback('web3 error: ' + err, null);
							
							reject('web3 error: ' + err);
						}
					
					});
				}
				catch(e) {
					if (callback)
						callback('exception: ' + e, null);
					
					reject('web3 exception: ' + e);
				}
				
			});
		}
		
		return promise;
	}
	
	web3_lockAccount(account, callback) {
		var self = this;
		var web3 = this._getWeb3Instance();
		
		if (account.canSignTransactions()) {
			var web3account = account.web3account;
			
			var promise = new Promise(function (resolve, reject) {
				if (self.web3_version == "1.0.x") {
					// Web3 > 1.0
					if (web3account)
					web3.eth.accounts.wallet.remove(web3account);
				}
				
				account.web3account = null;

				if (callback)
					callback(null, true);

				return resolve(true);
			});
			
		}
		else {
			var address = account.getAddress();
			
			if (self.web3_version == "1.0.x") {
				// Web3 > 1.0
				var funcname = web3.eth.personal.lockAccount;
			}
			else {
				// Web3 == 0.20.x
				var funcname = web3.personal.lockAccount;
			}
			
			
			var promise = new Promise(function (resolve, reject) {
				try {
					
					return funcname(address, function(err, res) {
						if (!err) {
							if (callback)
								callback(null, res);
							return resolve(res);
						}
						else {
							if (callback)
								callback('web3 error: ' + err, null);
							
							reject('web3 error: ' + err);
						}
					
					});
				}
				catch(e) {
					if (callback)
						callback('exception: ' + e, null);
					
					reject('web3 exception: ' + e);
				}
				
			});
		}
		
		
		return promise;
	}
	
	// blocks
	web3_getBlockNumber(callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				return web3.eth.getBlockNumber( function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getBlock(blockid, bWithTransactions, callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				return web3.eth.getBlock(blockid, bWithTransactions, function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	// transactions
	_findTransactionFromUUID(transactionuuid) {
		// we look in local history
		var self = this;

		// get local list
		var jsonarray = self._readTransactionLogs();

		for (var i = 0; i < (jsonarray ? jsonarray.length : 0); i++) {
			var tx_log = jsonarray[i];
			if (tx_log.transactionuuid == transactionuuid)
			return tx_log.transactionHash;
		}
	}
	
	_readTransactionLogs() {
		var session = this.session;
		
		var storageaccess = session.getStorageAccessInstance();
		
		var keys = ['ethnode', 'transactions'];
		
		var jsonarray = storageaccess.readClientSideJson(keys);
		
		return jsonarray;
	}
	
	_saveTransactionLog(ethtransaction) {
		var session = this.session;
		
		var transactionuuid = ethtransaction.getTransactionUUID();
		var transactionHash = ethtransaction.getTransactionHash();
		var from = ethtransaction.getFromAddress();
		var to = ethtransaction.getToAddress();
		var value = ethtransaction.getValue();
		var creationdate = Date.now();
		
		var status = ethtransaction.getStatus();
		
		var web3providerurl = ethtransaction.getWeb3ProviderUrl()
		
		var json = {transactionuuid: transactionuuid, transactionHash: transactionHash, from: from, to: to, value: value, creationdate: creationdate, status: status, web3providerurl: web3providerurl};
		
		// add to transaction list (on the client/browser side)
		var storageaccess = session.getStorageAccessInstance();
		
		var keys = ['ethnode', 'transactions'];
		
		var jsonarray = storageaccess.readClientSideJson(keys);
		
		if ((!jsonarray) || (jsonarray.length == 0)) {
			jsonarray = [];
		}
		
		jsonarray.push(json);
		
		storageaccess.saveClientSideJson(keys, jsonarray);
	}
	
	web3_findTransaction(transactionuuid, callback) {
		var self = this
		var session = this.session;
		
		var hash = this._findTransactionFromUUID(transactionuuid);
		
		return this.web3_getTransaction(hash, callback);
	}
	
	web3_getTransactionList(callback) {
		var self = this;
		var session = this.session;
		var global = session.getGlobalObject();
		
		var user = session.getSessionUserObject();
		var useruuid = (user ? user.getUserUUID() : null);

		var ethnodemodule = global.getModuleObject('ethnode');

		var promise = new Promise(function (resolve, reject) {
			try {
				var txarray = self._readTransactionLogs();
				
				if (txarray) {
					var transactionarray = [];
					
					for (var i = 0; i < txarray.length; i++) {
						var tx = txarray[i];
						var transaction = ethnodemodule.getTransactionObject(session, tx['transactionuuid']);
						
						transaction.setTransactionHash(tx['transactionHash']);
						transaction.setFrom(tx['from']);
						transaction.setTo(tx['to']);
						transaction.setValue(tx['value']);
						transaction.setCreationDate(tx['creationdate']);
						transaction.setStatus(tx['status']);
						transaction.setWeb3ProviderUrl(tx['web3providerurl']);
					
						transactionarray.push(transaction);
					}
					
					if (callback)
						callback(null, transactionarray);
					
					return resolve(transactionarray);
				}
				else {
					if (callback)
						callback('error retrieving user transaction list', null);

					reject('error retrieving user transaction list');
				}
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('exception: ' + e);
			}
			
		});
		
		return promise;
	}

	web3_getTransactionCount(fromaddress, defaultBlock, callback) {
		var self = this
		var session = this.session;

		if (typeof defaultBlock == 'function') {
			callback = defaultBlock;
			defaultBlock = null;
		}

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				if (defaultBlock) {
					return web3.eth.getTransactionCount(fromaddress, defaultBlock, function(err, res) {
						if (!err) {
							if (callback)
								callback(null, res);
							return resolve(res);
						}
						else {
							if (callback)
								callback('web3 error: ' + err, null);
							
							reject('web3 error: ' + err);
						}
					});
				}
				else {
					return web3.eth.getTransactionCount(fromaddress, function(err, res) {
						if (!err) {
							if (callback)
								callback(null, res);
							return resolve(res);
						}
						else {
							if (callback)
								callback('web3 error: ' + err, null);
							
							reject('web3 error: ' + err);
						}
					});
				}
				
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getTransaction(hash, callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				return web3.eth.getTransaction(hash, function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getTransactionReceipt(hash, callback) {
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self._getWeb3Instance();
				
				return web3.eth.getTransactionReceipt(hash, function(err, res) {
					if (!err) {
						if (callback)
							callback(null, res);
						return resolve(res);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise
	}
	
	web3_sendEthTransaction(ethtransaction, callback) {
		console.log('EthereumNodeAccess.web3_sendEthTransaction called');
		
		if (!ethtransaction)
			throw 'no transaction defined';
		
		var self = this
		var session = this.session;
		
		if (ethtransaction.getTransactionUUID() === null)
			ethtransaction.setTransactionUUID(session.guid());
		
		if (ethtransaction.web3providerurl === null) {
			// fill with default provider url if caller didn't
			console.log('WARNING: EthereumNodeAccess.web3_sendEthTransaction caller did not set provider url for transaction ' + ethtransaction.getTransactionUUID());
			let web3providerurl = this.web3_getProviderUrl();
			ethtransaction.setWeb3ProviderUrl(web3providerurl);
		}
		
		var transactionuuid = ethtransaction.getTransactionUUID();
		
		console.log('EthereumNodeAccess.web3_sendEthTransaction txjson is ' + JSON.stringify(ethtransaction.getTxJson()));
		
		var promise = new Promise( function(resolve, reject) {
			
			try {
				var web3 = self._getWeb3Instance();
				
				// common callback function
				var __transactioncallback = function(err, res) {
					var transactionHash = res;
					console.log('EthereumNodeAccess.web3_sendEthTransaction transactionHash is ' + transactionHash);
					
					if (transactionHash) {
						ethtransaction.setTransactionHash(transactionHash);
						ethtransaction.setStatus('completed');				
					}
					else {
						ethtransaction.setStatus('failed');
					}
					
					self._saveTransactionLog(ethtransaction);
			         
					if (!err) {
						if (callback)
							callback(null, transactionHash);
						
						return resolve(transactionHash);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				};
				
				// sending unsigned or signed
				if (ethtransaction.canSignTransaction()) {
					// signing the transaction
				    return ethtransaction.getRawData(function(err, raw) {
				    	if (!err) {
				    		
						    
				    		// send signed
							if (self.web3_version == "1.0.x") {
								// Web3 > 1.0
								return web3.eth.sendSignedTransaction(raw, __transactioncallback)
								.catch(err => {
									if (callback)
										callback('web3 error: ' + err, null);
								
									reject('web3 error: ' + err);
								});
							}
							else {
								// Web3 == 0.20.x
								return web3.eth.sendRawTransaction(raw, __transactioncallback);
							}
				    	}
				    	else {
				    		__transactioncallback(err, null);
				    	}
				    });

				}
				else {
					// unsigned send (node will sign thanks to the unlocking of account)
					var txjson = ethtransaction.getTxJson();
					return web3.eth.sendTransaction(txjson, __transactioncallback);
				}
				
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
		
		});
		
		return promise
	}
	
	web3_sendTransaction(fromaccount, toaccount, amount, gas, gasPrice, txdata, nonce, callback) {
		console.log('EthereumNodeAccess.web3_sendTransaction called');
		
		var self = this
		var session = this.session;
		
		if (!fromaccount)
			throw 'no sender specified for transaction';
		
		if ( (amount > 0) && !toaccount)
			throw 'no recipient specified for transaction. Use burn if you want to destroy ethers.';
		
		var fromaddress = fromaccount.getAddress();
		var toaddress = (toaccount ? toaccount.getAddress() : null);

		console.log('EthereumNodeAccess.web3_sendTransaction called from ' + fromaddress + ' to ' + toaddress + ' amount ' + amount);

		let web3providerurl = this.web3_getProviderUrl();

		var ethtransaction = self.ethereumnodeaccessmodule.getEthereumTransactionObject(session, fromaccount);
	    
	    ethtransaction.setToAddress(toaddress);
	    ethtransaction.setValue(amount);
	    ethtransaction.setGas(gas);
	    ethtransaction.setGasPrice(gasPrice);
	    ethtransaction.setData(txdata);
	    ethtransaction.setNonce(nonce);
		ethereumtransaction.setWeb3ProviderUrl(web3providerurl);
	    
		var transactionuuid = session.guid(); // maybe we could read it from txdata
		
		ethtransaction.setTransactionUUID(transactionuuid);

		return this.web3_sendEthTransaction(ethtransaction, callback);
	}
	
	
	// contracts
	_getJQueryClass() {
		//typeof window !== 'undefined' && window
		if (typeof $ !== 'undefined')
			return $;
		else if (typeof window !== 'undefined' && window && (typeof window.simplestore !== 'undefined'))
		  return window.simplestore.jQuery;
		else if ((typeof global !== 'undefined') && (typeof global.simplestore !== 'undefined'))
			return global.simplestore.jQuery;
		else
		throw 'can not find JQuery class!!!';
	}

	_loadArtifact(jsonfile, callback) {
		var session = this.session;
		var _global = session.getGlobalObject();
		
		if (_global.isInBrowser()) {
			// load from the server
			var _$ = this._getJQueryClass(); // in case we are packaged (e.g. with webpack)

			var loadpromise = _$.getJSON(jsonfile, function(data) {
				console.log('contract json file read ');

				if (callback)
					callback(data);

				return data;
			});
			
			return loadpromise;
			
		}
		else {
			// ask storage module to load from local space
			var storageaccessmodule = _global.getModuleObject('storage-access');
			var loadpromise = new Promise(function (resolve, reject) {
				storageaccessmodule.loadClientSideJsonArtifact(session, jsonfile, function(err, res) {
					console.log('contract json file read ');

					if (callback)
						callback(res);
					
					resolve(res);
					
					return res;
				});
			});
			
			return loadpromise;
		}
	}
	
	_getContractInstance(abi, address) {
		var self = this;
		
		var web3 = this._getWeb3Instance();

		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var web3_contract_instance = new web3.eth.Contract(abi, address);
		}
		else {
			// Web3 == 0.20.x
			var web3_contract_instance = web3.eth.contract(abi).at(address);
		}
		
		return web3_contract_instance;
	}
	
	_getArtifactFullUri(artifactpath) {
		var _artifactfullpath;

		if (!artifactpath)
			return;

		if (this.web3artifactrooturi) {
			if ((this.web3artifactrooturi.endsWith('/') === false) &&
				(artifactpath.startsWith('/') === false))
				_artifactfullpath = this.web3artifactrooturi + '/' + artifactpath;
			else
				_artifactfullpath = this.web3artifactrooturi + artifactpath;
		}
		else {
			_artifactfullpath = artifactpath;
		}

		return _artifactfullpath;
	}
	
	web3_getArtifactRootUri() {
		return this.web3artifactrooturi;
	}
	
	web3_setArtifactRootUri(rooturi, callback) {
		console.log('EthereumNodeAccess.web3_setArtifactRootUri called with: ' + rooturi);

		this.web3artifactrooturi = rooturi;
		
		if (callback)
			callback(null, this.web3artifactrooturi);

		return Promise.resolve(this.web3artifactrooturi);
	}
	
	web3_loadArtifact(artifactpath, callback) {
		console.log('EthereumNodeAccess.web3_loadArtifact called');

		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;

		var web3_contract_artifact = [];
		
		var _artifactfullpath = artifactpath;

		if ((artifactpath.startsWith('http://') === false) 
			&& (artifactpath.startsWith('https://') === false)
			&& (this.web3artifactrooturi)) {
			_artifactfullpath = this._getArtifactFullUri(artifactpath)
		}
		
		var promise = this._loadArtifact(_artifactfullpath, function(data) {
			
			web3_contract_artifact['artifactuuid'] = session.guid();
			web3_contract_artifact['data'] = data;
			web3_contract_artifact['artifactpath'] = artifactpath;
			web3_contract_artifact['contractName'] = data.contractName;
			web3_contract_artifact['abi'] = data.abi;
			web3_contract_artifact['bytecode'] = data.bytecode;
			
			//self._encapsulateArtifact(web3_contract_artifact);
			
			var artifactproxy = ethereumnodeaccessmodule.getArtifactProxyObject(web3_contract_artifact['artifactuuid'], web3_contract_artifact['contractName'], web3_contract_artifact['artifactpath'], web3_contract_artifact['abi'], web3_contract_artifact['bytecode']);
			artifactproxy.data = data;
			
			if (callback)
				callback(null, artifactproxy);
			
			return artifactproxy;
		});

		return promise;
	}
	
	/*_encapsulateContract(contractobject) {
		contractobject.getAbi = function() {
			return (contractobject.artifact['abi'] ? contractobject.artifact['abi'] : null);
		};

		contractobject.getByteCode = function() {
			return (contractobject.artifact['bytecode'] ? contractobject.artifact['bytecode'] : null);
		};

		contractobject.getContractName = function() {
			return (contractobject.artifact['contractName'] ? contractobject.artifact['contractName'] : null);
		};
		
	}*/
	
	web3_loadContract(artifact) {
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;

		var contractobject = {};
		
		contractobject.artifact = artifact;
		contractobject.contractuuid = session.guid();
		
		//this._encapsulateContract(contractobject);
		
		var contractproxy = ethereumnodeaccessmodule.getContractProxyObject(contractobject.contractuuid, contractobject.artifact);
		
		return contractproxy;
	}
	
	_waitTransactionReceipt(transactionHash, delay, callback) {
		var self = this;

		self.web3_getTransactionReceipt(transactionHash, function(err, result) {
		    if(err) {
		        if (callback)
		        	callback('error executing getTransactionReceipt:  ' + err, null)
		    }
		    else {
		        if(result === null) {
		            setTimeout(function() {
		            	self._waitTransactionReceipt(transactionHash, delay, callback);
		            }, delay);
		        }
		        else {
					//console.log('EthereumNodeAccess._getPendingTransactionReceipt receipt is ' + JSON.stringify(result));

					if (callback)
			        	callback(null, result);
			        
			        return result;
		        }
		    }
		});
	}
	
	_getPendingTransactionReceipt(transactionHash, callback) {
		var self = this;

		return new Promise(function (resolve, reject) {
			try {
				self._waitTransactionReceipt(transactionHash, 500, function(err, res) {
					console.log('EthereumNodeAccess._getPendingTransactionReceipt callback called for ' + transactionHash);
					
					if (!err) {
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
					}
					else {
						console.log('EthereumNodeAccess._getPendingTransactionReceipt error ' + JSON.stringify(err));

						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});		
	}
	
	/*_encapsulateContractInstance(web3_contract_instance) {
		var contract = web3_contract_instance['contract'];
		web3_contract_instance.getContract = function() {
			return contract;
		};
		
		var abi = contract.getAbi();
		web3_contract_instance.getAbi = function() {
			return abi;
		};
		
		var address = web3_contract_instance['address'];
		web3_contract_instance.getAddress = function() {
			return address;
		};
		
		var instance = 
		web3_contract_instance.getInstance = function() {
			return this['instance'];
		};
		
		
	}*/
	
	web3_contract_new(web3contract, params, callback) {
		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		
		var web3 = this._getWeb3Instance();
		
		var web3_contract_instance = {};
		
		var abi = web3contract.getAbi();
		var bytecode = web3contract.getByteCode();
		
		web3_contract_instance['contract'] = web3contract;
		
		var ethereumtransaction = ethereumnodeaccessmodule.unstackEthereumTransactionObject(session, params);
		let args = params.slice(0,-1);

		if (!bytecode)
			throw 'no byte code, can not deploy contract';
		
		// then create a deploy transaction data
		let soliditycontract = ethereumnodeaccessmodule.getSolidityContractObject(session, abi);
		let deploy = soliditycontract.getDeployData(bytecode, args);
		
		ethereumtransaction.setData(deploy);
		
		// sending deploy transaction
		try {
			return this.web3_sendEthTransaction(ethereumtransaction, function(err, res) {
				if (!err) {
					var transactionHash = res;
					console.log('contract deployment transaction hash is ' + transactionHash);
					
					if (callback)
						callback(null, transactionHash);
					
					return transactionHash;
				}
				else {
					var error = 'error deploying contract: ' + err;
					console.log('EthereumNodeAcces.web3_contract_new error:' + error);
					
					if (callback)
						callback(error, null);
				}
				
			})
			.then(function(transactionHash) {
				return self._getPendingTransactionReceipt(transactionHash, function(err, res) {
					if (err) {
						console.log('contract deployment transaction is invalid: ' + transactionHash);
						
						if (callback)
							callback('contract deployment transaction is invalid: ' + transactionHash, null);
					}
					else {
						//console.log('contract deployment transaction receipt is: ' + JSON.stringify(res));
						return res;
					}
					
				});
			})
			.then(function(receipt) {
				if (receipt) {
					var address = receipt['contractAddress'];
					console.log('contract deployment address is ' + address);
					
					web3_contract_instance['contractinstanceuuid'] = session.guid();
					web3_contract_instance['contract'] = web3contract;
					web3_contract_instance['address'] = address;
					web3_contract_instance['instance'] = self._getContractInstance(abi, address);
					
					//self._encapsulateContractInstance(web3_contract_instance);
					var constractinstanceproxy = ethereumnodeaccessmodule.getContractInstanceProxyObject(web3_contract_instance['contractinstanceuuid'], web3_contract_instance['address'], web3_contract_instance['contract']);
					constractinstanceproxy.instance = web3_contract_instance['instance'];
					
					return constractinstanceproxy;
				}
			});
		}
		catch(e) {
			console.log('exception: ' + e);
		}
		
	}
	
	web3_abi_load_at(abi, address, callback) {
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;

		// create contract object
		var contractobject = {};
		
		contractobject.artifact = {};
		
		contractobject.artifact['data'] = abi;
		contractobject.artifact['artifactpath'] = null;
		contractobject.artifact['contractName'] = null;
		contractobject.artifact['abi'] = abi;
		contractobject.artifact['bytecode'] = null;
		
		//this._encapsulateContract(contractobject);

		var artifactproxy = ethereumnodeaccessmodule.getArtifactProxyObject(session.guid(), contractobject.artifact['contractName'], contractobject.artifact['artifactpath'], contractobject.artifact['abi'], contractobject.artifact['bytecode']);
		var contractproxy = ethereumnodeaccessmodule.getContractProxyObject(session.guid(), artifactproxy);

		
		// create contract instance
		var web3_contract_instance = [];
		
		web3_contract_instance['contractinstanceuuid'] = session.guid();
		web3_contract_instance['contract'] = contractproxy;
		web3_contract_instance['address'] = address;
		web3_contract_instance['instance'] = this._getContractInstance(abi, address);
		
		//this._encapsulateContractInstance(web3_contract_instance);
		var constractinstanceproxy = ethereumnodeaccessmodule.getContractInstanceProxyObject(web3_contract_instance['contractinstanceuuid'], web3_contract_instance['address'], web3_contract_instance['contract']);
		constractinstanceproxy.instance = web3_contract_instance['instance'];

		if (callback)
			callback(null, constractinstanceproxy);
			 		
		return Promise.resolve(constractinstanceproxy);	
	}
	
	web3_contract_at(web3contract, address, callback) {
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;

		var web3_contract_instance = [];
		
		var abi = web3contract.getAbi();
		
		web3_contract_instance['contractinstanceuuid'] = session.guid();
		web3_contract_instance['contract'] = web3contract;
		web3_contract_instance['address'] = address;
		web3_contract_instance['instance'] = this._getContractInstance(abi, address);
		
		//this._encapsulateContractInstance(web3_contract_instance);
		var constractinstanceproxy = ethereumnodeaccessmodule.getContractInstanceProxyObject(web3_contract_instance['contractinstanceuuid'], web3_contract_instance['address'], web3_contract_instance['contract']);
		constractinstanceproxy.instance = web3_contract_instance['instance'];
		
		if (callback)
			callback(null, constractinstanceproxy);
		
		return Promise.resolve(constractinstanceproxy);
	}
	
	_web3_contract_dynamicMethodCall(web3_contract_instance, abidef, params, callback) {
		var self = this;
		
		var instance = web3_contract_instance['instance'];
		
		var methodname = abidef.name;
		var signature = abidef.signature;
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = instance.methods[signature];
		}
		else {
			// Web3 == 0.20.x
			var funcname = instance[methodname];
		}
		
		var promise = new Promise( function(resolve, reject) {
			
			var __funcback = function (err, res) {
				
				if (res) {
					if (callback)
						callback(null, res);
					
					return resolve(res);
				}
				else {
					var error = 'web3_contract_dynamicMethodCall did not retrieve any result';
					console.log('error: ' + error);

					if (callback)
						callback(error, null);

					return reject(null);
				}
				
				
			};
	
			if (self.web3_version == "1.0.x") {
				// Web3 > 1.0
				var ret = funcname(...params).call(__funcback)
				.catch(err => {
				    console.log('catched error in EthereumNodeAccess.web3_contract_dynamicMethodCall ' + err);
				});
				
			}
			else {
				// Web3 == 0.20.x
				// using spread operator
				var ret = funcname.call(...params, __funcback)
				/*.catch(err => {
				    console.log('catched error in EthereumNodeAccess.web3_contract_dynamicMethodCall ' + err);
				})*/;
				
			}
		
		});
		
		return promise
	}
	
	_web3_contract_dynamicSendTransaction(web3_contract_instance, abidef, params, callback) {
		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		
		var web3 = this._getWeb3Instance();
		
		var abi = web3_contract_instance.getAbi()
		var instance = web3_contract_instance.getInstance();
		var contractaddress = web3_contract_instance.getAddress();
		
		var methodname = abidef.name;
		var signature = abidef.signature;

		var ethereumtransaction = ethereumnodeaccessmodule.unstackEthereumTransactionObject(session, params);
		let args = params.slice(0,-1);

		// create a call transaction data
		let soliditycontract = ethereumnodeaccessmodule.getSolidityContractObject(session, abi);
		let calldata = soliditycontract.getCallData(contractaddress, abidef, args);
		
		ethereumtransaction.setData(calldata);
		ethereumtransaction.setToAddress(contractaddress);
		
		// sending method transaction
		try {
			return this.web3_sendEthTransaction(ethereumtransaction, function(err, res) {
				if (!err) {
					var transactionHash = res;
					console.log('EthereumNodeAccess._web3_contract_dynamicSendTransaction transaction hash is ' + transactionHash);
					
					if (callback)
						callback(null, transactionHash);
					
					return transactionHash;
				}
				else {
					console.log('EthereumNodeAccess._web3_contract_dynamicSendTransaction error: ' + err);
					
					if (callback)
						callback('EthereumNodeAccess._web3_contract_dynamicSendTransaction error: ' + err, null);
				}
				
			});
		}
		catch(e) {
			console.log('exception: ' + e);
		}

	}
	
	_getMethodAbiDefinition(abi, methodname, args) {
		var abidef = null;
		
		if (!abi)
			return abidef;
		
		for (var i = 0; i < abi.length; i++) {
			var item = abi[i];
			var name = item.name;
			
			if (name == methodname) {
				abidef = item;

				if (args) {
					// check we have correct number of arguments
					if (item.inputs && (item.inputs.length != args.length)) {
						// wrong number of arguments
						continue;
					}
					else {
						// ok to be used
						break;
					}
				}
				else {
					// first one found then
					break;
				}				
			}
		}
		
		return abidef;
	}
	
	web3_method_call(web3_contract_instance, methodname, params, callback) {
		var abi = web3_contract_instance.getAbi();
		let args = (params ? params.slice(0,-1) : null);
		var abidef = this._getMethodAbiDefinition(abi, methodname, args);
		
		return this._web3_contract_dynamicMethodCall(web3_contract_instance, abidef, params, callback);
	}
	
	web3_method_sendTransaction(web3_contract_instance, methodname, params, callback) {
		var abi = web3_contract_instance.getAbi();
		let args = (params ? params.slice(0,-1) : null);
		var abidef = this._getMethodAbiDefinition(abi, methodname, args);
		
		return this._web3_contract_dynamicSendTransaction(web3_contract_instance, abidef, params, callback);
	}
	

	//
	// Truffle (obsolete, should use directly web3_ methods)
	//
	_getTruffleContractClass() {
		if (this.web3_version == "1.0.x")
			throw 'must not longer instantiate truffle';
		
		if ( typeof window !== 'undefined' && window ) {
			return TruffleContract;
		}
		else {
			throw 'nodejs not implemented';
			//return require('truffle-contract');
		}
	}
	
	_getTruffleContractObject(contractartifact) {
		
		var TruffleContract = this._getTruffleContractClass();
		
		var trufflecontract = TruffleContract(contractartifact);
	  
		trufflecontract.setProvider(this._getWeb3Provider());
		
		return trufflecontract;
	}
	
	truffle_loadArtifact(artifactpath, callback) {
		if (this.web3_version == "1.0.x") {
			// need to return the artifact to the caller via the callback and not the proxy
			return this.web3_loadArtifact(artifactpath, function(err, artifactproxy) {
				if (callback) {
					if (err) callback(null); else callback(artifactproxy.data);
				}
			})
			.then(function(data) {
				return data;
			});
		}
		else {
			return this._loadArtifact(artifactpath, callback);

		}
	}
	
	truffle_loadContract(artifact) {
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			return this.web3_loadContract(artifact);
		}
		else {
			// Web3 == 0.20.x
			return this._getTruffleContractObject(artifact);
		}
	}
	
	truffle_contract_at(trufflecontract, address) {
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			return this.web3_contract_at(trufflecontract, address);
		}
		else {
			// Web3 == 0.20.x
			return trufflecontract.at(address);
		}
	}

	truffle_contract_new(trufflecontract, params) {
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			return this.web3_contract_new(trufflecontract, params);
		}
		else {
			// Web3 == 0.20.x
			return trufflecontract.new(...params);
		}
	}

	truffle_method_call(constractinstance, methodname, params) {
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			return this.web3_method_call(constractinstance, methodname, params);
		}
		else {
			// Web3 == 0.20.x
			var funcname = constractinstance[methodname];
			//console.log('contractinstance ' + Object.keys(constractinstance));
			//console.log('funcname is ' + funcname);
			
			return funcname.call(...params);
		}
	}
	
	truffle_method_sendTransaction(constractinstance, methodname, params) {
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			return this.web3_method_sendTransaction(constractinstance, methodname, params);
		}
		else {
			// Web3 == 0.20.x
			var funcname = constractinstance[methodname];
			
			return funcname.sendTransaction(...params);
		}
	}
	
	// uuid
	guid() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
	}

	
}

if ( typeof window !== 'undefined' && window ) {
	// if we are in browser or react-native and not node js)
	window.simplestore.EthereumNodeAccess = EthereumNodeAccess;
	window.simplestore.EthereumTransaction = EthereumTransaction;
} else if (typeof global !== 'undefined') {
	// we are in node js
	global.simplestore.EthereumNodeAccess = EthereumNodeAccess; 
	global.simplestore.EthereumTransaction = EthereumTransaction;
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass ){
	GlobalClass.getGlobalObject().registerModuleObject(new Module());

	GlobalClass.registerModuleClass('ethereum-node-access', 'EthereumNodeAccess', EthereumNodeAccess);
	GlobalClass.registerModuleClass('ethereum-node-access', 'EthereumTransaction', EthereumTransaction);

	GlobalClass.registerModuleClass('ethereum-node-access', 'ArtifactProxy', ArtifactProxy);
	GlobalClass.registerModuleClass('ethereum-node-access', 'ContractProxy', ContractProxy);
	GlobalClass.registerModuleClass('ethereum-node-access', 'ContractInstanceProxy', ContractInstanceProxy);

	GlobalClass.registerModuleClass('ethereum-node-access', 'SolidityContract', SolidityContract);
}
else if (typeof window !== 'undefined') {
	let _GlobalClass = ( window && window.simplestore && window.simplestore.Global ? window.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	_GlobalClass.registerModuleClass('ethereum-node-access', 'EthereumNodeAccess', EthereumNodeAccess);
	_GlobalClass.registerModuleClass('ethereum-node-access', 'EthereumTransaction', EthereumTransaction);

	_GlobalClass.registerModuleClass('ethereum-node-access', 'ArtifactProxy', ArtifactProxy);
	_GlobalClass.registerModuleClass('ethereum-node-access', 'ContractProxy', ContractProxy);
	_GlobalClass.registerModuleClass('ethereum-node-access', 'ContractInstanceProxy', ContractInstanceProxy);

	_GlobalClass.registerModuleClass('ethereum-node-access', 'SolidityContract', SolidityContract);
}
else if (typeof global !== 'undefined') {
	// we are in node js
	let _GlobalClass = ( global && global.simplestore && global.simplestore.Global ? global.simplestore.Global : null);
	
	_GlobalClass.getGlobalObject().registerModuleObject(new Module());

	_GlobalClass.registerModuleClass('ethereum-node-access', 'EthereumNodeAccess', EthereumNodeAccess);
	_GlobalClass.registerModuleClass('ethereum-node-access', 'EthereumTransaction', EthereumTransaction);

	_GlobalClass.registerModuleClass('ethereum-node-access', 'ArtifactProxy', ArtifactProxy);
	_GlobalClass.registerModuleClass('ethereum-node-access', 'ContractProxy', ContractProxy);
	_GlobalClass.registerModuleClass('ethereum-node-access', 'ContractInstanceProxy', ContractInstanceProxy);

	_GlobalClass.registerModuleClass('ethereum-node-access', 'SolidityContract', SolidityContract);
}
	


