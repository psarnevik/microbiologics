/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Sep 2016     aramar			JIRA-POX-306.This suite let to display registered end users.
 *
 */
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var MBL_Registration_Search_ID = null,
responseObject = {};
/*
 *This suite let to display registered end users report in JSON format from the MBL MBL Registration saved search results. 
 */
function DD_SL_MBL_End_Users_Report(request, response) {
	try {
		nlapiLogExecution('DEBUG', 'DD_SL_MBL_End_Users_Report', ' ******* SCRIPT START ******');
		nlapiLogExecution('DEBUG', 'DD_SL_MBL_End_Users_Report', ' Method = ' + request.getMethod());
		var Customer_ID = request.getParameter('customerid');
		//	Execute if the customer internal id passed to this suite let to get search search result object
		if (Customer_ID) {
			MBL_Registration_Search_ID = nlapiGetContext()
			.getSetting('SCRIPT', 'custscript_dd_mbl_registration_search');
			//var Distributor = nlapiLookupField('customer', Customer_ID, 'parent',true);
			// Call generate_json_content function to create the JSON object by passing saved search id
			generate_json_content(MBL_Registration_Search_ID, Customer_ID);
			//if(responseObject.length>0){
				response.write(JSON.stringify(responseObject));
		//	}//else{
				//response.write("There is No associated Data with this Customer");
			//}
			
			nlapiLogExecution('DEBUG', 'DD_SL_MBL_End_Users_Report', ' ******* SCRIPT END ******');
		}
	} catch (e) {
		nlapiLogExecution('Error', 'DD_SL_MBL_End_Users_Report ', 'Error  during DD_SL_MBL_End_Users_Report - ' + e.message);
	}
}


/**
 * This function will form the JSON for the Registration users data
 * @param{string} - MBL_Registration_Search_ID
 * @param{int}    - Customer_ID
 * @return{Object}- responseObject
 */
function generate_json_content(MBL_Registration_Search_ID, Customer_ID) {
	try {
		var filters = new Array();
		filters.push(new nlobjSearchFilter('custrecordatccreg_distributor', null, 'is', Customer_ID));

		var resultsObj = null;
		var start = 0,
		end = 1000;
		resultsObj = nlapiLoadSearch('customrecordatccregistration', MBL_Registration_Search_ID);
		resultsObj.addFilters(filters);

		//Run the search Object
		var runObject = resultsObj.runSearch();
		var RegistrationArray = [];
		//Get the results from the saved search
		while (true) {
			var results = runObject.getResults(start, end);
			if (results && results.length > 0) {
				nlapiLogExecution('DEBUG', 'DD_SL_MBL_End_Users_Report', ' Results Length:= ' + results.length);
				//Get Columns from the saved search
				var columns = runObject.getColumns();
				for (var i = 0; i < results.length; i++) {
					var eachRow = {};
					for (var j = 0; j < columns.length; j++) {
						if ((!results[i].getText(columns[j])) || (results[i].getText(columns[j]) == '')) {
							eachRow[columns[j].getLabel()] = encodeURIComponent(results[i].getValue(columns[j]));
						} else {
							eachRow[columns[j].getLabel()] = encodeURIComponent(results[i].getText(columns[j]));
						}

					}

					RegistrationArray[i + start] = eachRow;
				}

				start = end;
				end = end + 1000;
			} else {
				//Send the Response when all the registration data is processed
				responseObject.Results = RegistrationArray;
				break;

			}
		}
	} catch (e) {
		nlapiLogExecution('Error', 'generate_json_content ', 'Error  during generate_json_content - ' + e.message);
	}
}
