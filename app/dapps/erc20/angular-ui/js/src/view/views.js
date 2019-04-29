'use strict';

var DAPPViews = class {
	
	constructor(global) {
		this.global = global;
		
		this.name = 'erc20';
		
	}
	getERC20TokenStatusString(obj) {
		var global = this.global;
		var status = obj.getStatus();
		
		return this._getStatusString(obj, status)
	}

	
	getERC20TokenLiveStatusString(obj) {
		var global = this.global;
		var status = obj.getLiveStatus();
		
		return this._getStatusString(obj, status)
	}

	
	_getStatusString(obj, status) {
		var global = this.global;
		
		if (!this.Contracts) {
			// Contracts class
			var commonmodule = this.global.getModuleObject('common');
			var ethnodemodule = global.getModuleObject('ethnode');
			
			this.Contracts = ethnodemodule.Contracts;
		}
		
		switch(status) {
			case this.Contracts.STATUS_LOST:
				return global.t('lost');
			case this.Contracts.STATUS_NOT_FOUND:
				return global.t('not found');
			case this.Contracts.STATUS_UNKOWN:
				return global.t('unknown');
			case this.Contracts.STATUS_LOCAL:
				return global.t('local');
			case this.Contracts.STATUS_SENT:
				return global.t('sent');
			case this.Contracts.STATUS_PENDING:
				return global.t('pending');
			case this.Contracts.STATUS_DEPLOYED:
				return global.t('deployed');
			case this.Contracts.STATUS_CANCELLED:
				return global.t('cancelled');
			case this.Contracts.STATUS_REJECTED:
				return global.t('rejected');
			case this.Contracts.STATUS_ON_CHAIN:
				return global.t('on chain');
			default:
				return global.t('undefined');
		}
		
	}
	
}

if ( typeof window !== 'undefined' && window )
GlobalClass.registerModuleClass('dapps', 'ERC20TokenAngularViews', DAPPViews);
else
module.exports = DAPPViews; // we are in node js