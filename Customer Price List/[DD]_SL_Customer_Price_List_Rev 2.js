/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Aug 2016     aramar			This script to export a "live" customer price list based on a saved search of customer price preference
 * 2.00		  16 Sep 2016 	  aramar			Added comments and reviewed the code based on the check list.
 */
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
/*
 * This suite let script gives the xls file to the  Distributor for  "live" customer price list based on a saved search in USD that includes royalties.
 * so that Distributor can know how much an item costs.
 */
var PricingSavedSearch = '';
function DD_MBL_Customer_Price_list(request, response) {
	nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list', ' ******* Method:******= ' + request.getMethod());
	try{
		var intcustomerID = request.getParameter('customerid');
		var Datetime = GetTime().YYYYMMDD;
		nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list', ' Date YYYYMMDD = ' + Datetime);
		//Execute if the customer internal id passed to this suite let to get pricing list of customer
		if (intcustomerID) {
			var context = nlapiGetContext();
			// Fetch the script parameter for all three saved searches
			var SCAMBLBakedPrice = context.getSetting('SCRIPT', 'custscript_dd_sca_mbl_baked_price_list');
			var SCAMBLBreakoutPrice = context.getSetting('SCRIPT', 'custscript_dd_sca_mbl_breakout_price_lit');
			var SCAMBLBreakoutnrPrice = context.getSetting('SCRIPT', 'custscript_dd_sca_mbl_breakoutnr_price');
			var CustomerPricingfields = ['custentity_pricing_preference', 'pricelevel'];
			var CustomerRecord = [];
			// Fetch required customer fields like PrincingPreference, 	PricingLevel,Customer name.
			CustomerRecord = nlapiLookupField('customer', intcustomerID, CustomerPricingfields);
			var PrincingPreference = CustomerRecord.custentity_pricing_preference;
			var PricingLevel = CustomerRecord.pricelevel;
			// Get the Saved search based on the customer PrincingPreference baked/break out/break out nr	
			if (PrincingPreference == 1) {
				PricingSavedSearch = SCAMBLBakedPrice;
			}
			if (PrincingPreference == 2) {
				PricingSavedSearch = SCAMBLBreakoutPrice;
			}
			if (PrincingPreference == 3) {
				PricingSavedSearch = SCAMBLBreakoutnrPrice;
			}
			//Adding filters to the search
			var Arrfilters = new Array();
			Arrfilters.push(new nlobjSearchFilter('pricelevel', 'pricing', 'is', PricingLevel));
			// Get all the search results in an Array	
			var ArrSearchResults = searchAllRecords('item', PricingSavedSearch, Arrfilters, null);
			// Calling 	CreateXLSFile function to create the XLS content 
			var xmlstring = CreateXLSFile(PricingSavedSearch, ArrSearchResults);
			nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list', ' ******* Xls Content Created:******');
			// Set the content type to the created XML string	
			response.setContentType('EXCEL', ' Microbiologics Customer Price List - ' + Datetime + '.xls');
			// write the output of created XLS file on the response.	
			response.write(nlapiEncrypt(xmlstring, 'base64'));
			nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list', ' ******* SCRIPT END:******');
		}
	} catch (e) {
		nlapiLogExecution('Error', 'DD_MBL_Customer_Price_list ', 'Error  during DD_MBL_Customer_Price_list - ' + e.message);
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
