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
		var Isdownload = request.getParameter('download');
		var Datetime = GetTime().YYYYMMDD;
		nlapiLogExecution('DEBUG', 'DD_SL_MBL_End_Users_Report', ' Isdownload = ' + Isdownload);
		nlapiLogExecution('DEBUG', 'DD_SL_MBL_End_Users_Report', ' Date YYYYMMDD = ' + Datetime);
		//	Execute if the customer internal id passed to this suite let to get search search result object
		if (Customer_ID) {
			MBL_Registration_Search_ID = nlapiGetContext()
			.getSetting('SCRIPT', 'custscript_dd_mbl_registration_search');
			//var Distributor = nlapiLookupField('customer', Customer_ID, 'parent',true);
			// Call generate_json_content function to create the JSON object by passing saved search id
			responseObject = generate_json_content(MBL_Registration_Search_ID, Customer_ID);
			nlapiLogExecution('DEBUG', 'DD_SL_MBL_End_Users_Report', '  responseObject= '+responseObject);
			//if(responseObject.length>0){
			if(Isdownload=='true'){
				//Adding filters to the search
				var Arrfilters = new Array();
				Arrfilters.push(new nlobjSearchFilter('custrecordatccreg_distributor', null, 'is', Customer_ID));
				// Get all the search results in an Array	
				var ArrSearchResults = searchAllRecords('customrecordatccregistration', MBL_Registration_Search_ID, Arrfilters, null);
				if(ArrSearchResults &&ArrSearchResults.length >0 ){
					// Calling 	CreateXLSFile function to create the XLS content 
					var xmlstring = CreateXLSFile(MBL_Registration_Search_ID, ArrSearchResults);
					nlapiLogExecution('DEBUG', 'MBL_End_Users_Report', ' ******* Xls Content Created:******');
					// Set the content type to the created XML string	
					response.setContentType('EXCEL', ' MBL End Users Report - ' + Datetime + '.xls');
					// write the output of created XLS file on the response.	
					response.write(nlapiEncrypt(xmlstring, 'base64'));
				}else{
					response.write("There is No associated Data with this Customer");
				}
			
			}
			if(Isdownload==null||Isdownload==''||Isdownload==undefined){
			if(responseObject.Results.length==0){
					response.write("There are currently no registered end-users associated with your account.");
				}else{
					response.write(JSON.stringify(responseObject));
				}
			
			}
				
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
		return responseObject;
	} catch (e) {
		nlapiLogExecution('Error', 'generate_json_content ', 'Error  during generate_json_content - ' + e.message);
	}
}

/**
 * This function to get all saved search results by passing search id and filters of the search
 * @param{string} - recordType
 * @param{string} - searchId
 * @param{array}  - filters
 * @return{array} - results 
 */
CTX = nlapiGetContext();
function searchAllRecords(recordType, searchId, filters, columns) {
	try {
		// @todo need to make a better solution for searches utilizing the filter expressions, otherwise these are all adhoc searches that are much slower
		var CTX = CTX || nlapiGetContext();
		var results = [];
		// var search = nlapiLoadSearch(recordType, searchId);
		// we can't stringify this object - may be setting ourselves up for a volume/rescheduling issue, in which case, let's dump the N_NLAPILOADSEARCH_CACHE object
		if ((filters != '') && (filters != null)) {
			search = nlapiLoadSearch(recordType, searchId);

			nlapiLogExecution('AUDIT', 'searchAllRecords', 'before add filters');
			search.addFilters(filters);
			var fexp = search.getFilterExpression();
			nlapiLogExecution('AUDIT', 'FEXP', JSON.stringify(fexp));

			if (columns && columns.length) {
				search.addColumns(columns);
			}
		}

		var searchRS = search.runSearch();
		var tempResults = [];
		var tempResultsLength = 0;

		do {
			var resultsLength = results.length;
			tempResults = searchRS.getResults(resultsLength, resultsLength + 1000) || [];
			tempResultsLength = tempResults.length;
			if (tempResults != null && tempResultsLength > 0) {
				results = results.concat(tempResults);
			}
		} while (tempResultsLength == 1000);

		(results ? nlapiLogExecution('AUDIT', arguments.callee.name, 'recordType = ' + recordType + ', results.length = ' + results.length) : null);
		return results;
	} catch (exx) {
		nlapiLogExecution('DEBUG', 'ERROR while searching:', exx + ':' + exx.getCode() + ':' + exx.getDetails() + ':' + exx.toString());
		throw exx;
	}
}

//Declaring the Global variables
var startRow    = '<Row>';
var cellPrefix  = '<Cell><Data ss:Type="String">';
var cellSuffix 	= '</Data></Cell>';
var endRow 		= '</Row>';
/**
* This function to Create the XLS File
* @param{string}- SavedSearchID
* @param{array} - SavedSearchResults
* @return{xml}  - content of xml 
*/
function CreateXLSFile(SavedSearchID, SavedSearchResults) {
	try{
		var xmlString 	 = '';
		xmlString += '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
		xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
		xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
		xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
		xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
		xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
		xmlString += '<Worksheet ss:Name="Sheet1">';
		xmlString += '<Table>';
		var footer 		 = '</Table></Worksheet></Workbook>';
		var search 		 = nlapiLoadSearch(null, SavedSearchID);
		var columns 	 = search.getColumns();
		var xmlStringRow = getxmlStringRow(columns);
		var dataRows 	 = getDataRows(SavedSearchResults, columns);
		var xml 		 = xmlString + xmlStringRow + dataRows + footer;
		return xml;
	} catch (e) {
		nlapiLogExecution('Error', 'CreateXLSFile ', 'Error  during CreateXLSFile - ' + e.message);
	}
}
/**
* This function to Get current Date in YYYYMMDD format
* @param{} - empty
* @return{date}- Date in YYYYMMDD format 
*/
function GetTime() {
	try{
		var now 	= new Date();
		var year 	= now.getFullYear();
		var month 	= now.getMonth() + 1;
		var day 	= now.getDate();
		var hour 	= now.getHours();
		var minute 	= now.getMinutes();
		var seconds = now.getSeconds();
		if (month.toString()
				.length == 1) {
			month = '0' + month;
		}
		if (day.toString()
				.length == 1) {
			day = '0' + day;
		}
		if (hour.toString()
				.length == 1) {
			hour = '0' + hour;
		}
		if (minute.toString()
				.length == 1) {
			minute = '0' + minute;
		}
		if (seconds == 0)
			seconds = '00';
		if (seconds.toString()
				.lenght == 1) {
			seconds = '0' + seconds;
		}
		return ({
			YYYYMMDD: year + ':' + month + ':' + day
		});
	} catch (e) {
		nlapiLogExecution('Error', 'GetTime ', 'Error  during GetTime - ' + e.message);
	}
}
/**
* This function will add the header on the XLS file
* @param{array} 	- columns
* @return{string}	- xmlStringRow 
*/
function getxmlStringRow(columns) {
	try{
		var xmlStringRow = startRow;
		for (var i = 0; i < columns.length; i++) {
			xmlStringRow += cellPrefix;
			xmlStringRow += columns[i].getLabel();
			xmlStringRow += cellSuffix;
		}
		xmlStringRow += endRow;
		return xmlStringRow;
	} catch (e) {
		nlapiLogExecution('Error', 'getxmlStringRow ', 'Error  during getxmlStringRow - ' + e.message);
	}
}
/**
* This function will fetch all the results of the saved search
* @param{array} - SavedSearchResults
* @param{array} - columns
* @return{array}- dataRows 
*/
function getDataRows(SavedSearchResults, columns) {
	try{
		var dataRows = '';
		if (!SavedSearchResults) {
			return dataRows;
		}
		for (var i = 0; SavedSearchResults && i < SavedSearchResults.length; i++) {
			dataRows 	+= startRow;
			SavedSearchResult = SavedSearchResults[i];

			for (var j = 0; j < columns.length; j++) {
				dataRows += cellPrefix;

				var cellValue = SavedSearchResult.getText(columns[j]);
				if (!cellValue || cellValue == '') {
					cellValue = SavedSearchResult.getValue(columns[j]);
				}


				dataRows += cellValue;
				dataRows += cellSuffix;
			}
			dataRows 	 += endRow;
		}
		return dataRows;
	} catch (e) {
		nlapiLogExecution('Error', 'getDataRows ', 'Error  during getDataRows - ' + e.message);
	}
}
/**
* This function will log all the details wherever needed
* @param{string}- details
* @param{string}- error
*/
function log(details, error) {
	try{
		if (error) {
			nlapiLogExecution('ERROR', 'Error Details', details);
		} else {
			nlapiLogExecution('DEBUG', 'Debug Details', details);
		}
	} catch (e) {
		nlapiLogExecution('Error', 'log ', 'Error  during log - ' + e.message);
	}
}

