/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Sep 2016     parnevik
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function workflowAction() {
	var docId = nlapiGetFieldValue('custitem_dd_info_item_document');
	var docRec = nlapiLoadFile(docId);
	var docURL = docRec.getURL();
	
	nlapiSetFieldValue('custitem_dd_document_url', docURL);
}
