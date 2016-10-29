/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Sep 2016     aramar			JIRA -318.Create "convert quote to order" suite let
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function DD_SL_Convert_Quote_Order(request, response){
	nlapiLogExecution('DEBUG', 'DD_SL_Convert_Quote_Order',   ' ******* Method:******= ' + request.getMethod());
//	Get the Quote Record ID	
	var intQuoteRecID		= request.getParameter('quoterecid');
	try {
		if(intQuoteRecID){
//			Transform a quote record with a specific record id to a different sales order record.	
			var SalesOrderRecord 	= nlapiTransformRecord('estimate', intQuoteRecID, 'salesorder');
//			Submit the object of the transformed record.
			var intOrderRecID		= nlapiSubmitRecord(SalesOrderRecord, true); 
			nlapiLogExecution('DEBUG', 'DD_SL_Convert_Quote_Order',   ' intOrderRecID = ' + intOrderRecID);
		}
	} catch (e) {
		nlapiLogExecution('Error', 'DD_SL_Convert_Quote_Order ', 'Error  during DD_SL_Convert_Quote_Order - ' + e.message);
	}
}
