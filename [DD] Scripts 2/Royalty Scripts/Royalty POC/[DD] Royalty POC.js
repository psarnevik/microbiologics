/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Sep 2016     parnevik
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
	//nlapiSetCurrentLineItemValue('item', 'price', '-1');
	nlapiSetCurrentLineItemValue('item', 'rate', 1000.99);
	return true;
}

function userEventBeforeSubmit(type){
    var lineCount = nlapiGetLineItemCount('item');

    for(var i = 1; i <= lineCount; i++){
    	nlapiSelectLineItem('item', i);
    	//nlapiSetCurrentLineItemValue('item', 'price', '-1');
    	nlapiSetCurrentLineItemValue('item', 'rate', 50.75);
    	nlapiCommitLineItem('item');
    }
}

function userEventAfterSubmit(type){
	var recId = nlapiGetRecordId();
	var salesOrder = nlapiLoadRecord('salesorder', recId);
    var lineCount = salesOrder.getLineItemCount('item');
    
    for(var i = 1; i <= lineCount; i++){
    	//salesOrder.setLineItemValue('item', 'price', i, '-1');
    	salesOrder.setLineItemValue('item', 'rate', i, 60.75);
    	}
    nlapiSubmitRecord(salesOrder);
}