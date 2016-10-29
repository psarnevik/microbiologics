/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Sep 2016     aramar			JIRA -318.Create "convert quote to order" suite let
 * 2.00       26 Oct 2016     parnevik         Updated with JSON response
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function DD_SL_Convert_Quote_Order(request, response){
	nlapiLogExecution('DEBUG', 'DD_SL_Convert_Quote_Order',   ' ******* Method:******= ' + request.getMethod());
	
    // Get the Quote Record ID	
	var intQuoteRecID = request.getParameter('quoterecid');
	var resultObj = {};
	resultObj.orderNo = -1;
	var context = nlapiGetContext();
	// Fetch the script parameter for location as St. Cloud 
	var st_cloud_location = context.getSetting('SCRIPT', 'custscript_dd_location');
	var errorHeader = context.getSetting('SCRIPT', 'custscript_dd_quote_error_msg');

	try {
		nlapiLogExecution('DEBUG', 'DD_SL_Convert_Quote_Order',   ' intQuoteRecID = ' + intQuoteRecID);
		
		if(intQuoteRecID){
				
            // Transform a quote record with a specific record id to a different sales order record.	
			var SalesOrderRecord = nlapiTransformRecord('estimate', intQuoteRecID, 'salesorder');
			SalesOrderRecord.setFieldValue('location',st_cloud_location);
            // Submit the object of the transformed record.
			var intOrderRecID = nlapiSubmitRecord(SalesOrderRecord, true,true); 
			nlapiLogExecution('DEBUG', 'DD_SL_Convert_Quote_Order',   ' intOrderRecID = ' + intOrderRecID);
			
			var orderNo = nlapiLookupField('salesorder', intOrderRecID, 'tranid');
			resultObj.orderNo = orderNo;
			resultObj.internalId = intOrderRecID;
			
			response.write(JSON.stringify(resultObj));
		}
	} catch (e) {
		nlapiLogExecution('Error', 'DD_SL_Convert_Quote_Order ', 'Error  during DD_SL_Convert_Quote_Order - ' + e.message);
		var errorMsg = errorHeader + '<br><br>';
		errorMsg += nlapiLookupField('location', 1, 'custrecord_dd_contact_info_cust_service');
		
		errorMsg = encodeURIComponent(errorMsg);
		resultObj.errorMsg = errorMsg;
		
		response.write(JSON.stringify(resultObj));
	}
}
