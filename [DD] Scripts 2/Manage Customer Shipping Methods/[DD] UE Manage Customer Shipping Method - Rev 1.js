/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Oct 2016     parnevik
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	log('type: '+type+', name: '+name);
}




function userEventBeforeSubmit(type){
	log('before submit ran.');
	
	
}

function userEventAfterSubmit(type){
	var newShipItem = nlapiGetFieldValue('shippingitem');
	var oldRec = nlapiGetOldRecord();
	var oldShipItem = oldRec.getFieldValue('shippingitem');
	
	log('new shipping item: '+newShipItem+', old ship item: '+oldShipItem);
	
	if(newShipItem != oldShipItem && oldShipItem != '' && oldShipItem != null && newShipItem != '' && newShipItem != null){
		log('shipping item changed, reverting back to old item.');
		var recId = nlapiGetRecordId();
		var newRec = nlapiLoadRecord('customer', recId);
		
		newRec.setFieldValue('shippingitem', oldShipItem);
		
		nlapiSubmitRecord(newRec);		
	}
	
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}