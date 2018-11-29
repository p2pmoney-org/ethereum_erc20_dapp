'use strict';

var ERC20TokenLocalPersistor = class {
	
	constructor(session, contractuuid) {
		this.session = session;
		this.contractuuid = contractuuid;
		
		this.commonmodule = this.session.getGlobalObject().getModuleObject('common');
	}
	
	saveERC20TokenJson(erc20token) {
		var session = this.session;
		var keys = ['contracts'];
		
		var uuid = erc20token.getUUID();
		var json = erc20token.getLocalJson();
		
		var commonmodule = this.commonmodule;
		
		var jsonleaf = commonmodule.getLocalJsonLeaf(session, keys, uuid);
		
		if (jsonleaf) {
			commonmodule.updateLocalJsonLeaf(session, keys, uuid, json);
		}
		else {
			commonmodule.insertLocalJsonLeaf(session, keys, null, null, json);
		}
	}
	
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
	GlobalClass.registerModuleClass('erc20', 'ERC20TokenLocalPersistor', ERC20TokenLocalPersistor);
else
	module.exports = StockLedgerLocalPersistor; // we are in node js
