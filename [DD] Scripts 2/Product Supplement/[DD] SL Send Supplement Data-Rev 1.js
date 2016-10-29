/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Sep 2016     pkoluguri			This will send all the supplement data related to the respective customer upon a request to this suitelet
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var customer_price_level=null,
breakout_price_search_Id=null,
baked_price_search_Id=null,
breakout_price_nr_search_Id=null,
customer_pricing_preference=null;
var responseObject = {};

/**
 * Main fucntion which gets the request and processes the response
 * 
 * @param request
 * @param response 
 */
function suitelet(request, response)
{
	log('<<Execution Started>>');


	try{
		var customer_id=request.getParameter('customerid');
		//customer_id=76400;
		log('Customer ID::'+customer_id);

		breakout_price_search_Id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_breakout_price_ss');
		log('Break Out Price Saved Search ID::'+breakout_price_search_Id);

		baked_price_search_Id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_baked_price_ss');
		log('Baked Price Saved Search ID::'+baked_price_search_Id);

		breakout_price_nr_search_Id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_breakout_price_nr_ss');
		log('Break Out Price NO Royalty Saved Search ID::'+breakout_price_nr_search_Id);
		
		var Isdownload = request.getParameter('download');
		var Datetime = GetTime().YYYYMMDD;
		nlapiLogExecution('DEBUG', 'DD_SL_MBL_Supplement_Data', ' Isdownload = ' + Isdownload);
		nlapiLogExecution('DEBUG', 'DD_SL_MBL_Supplement_Data', ' Date YYYYMMDD = ' + Datetime);

		if(customer_id){

			var customerFields= ['custentity_pricing_preference','pricelevel'];

			var customer_record = nlapiLookupField('customer', customer_id, customerFields);

			//Get the Customer Price Level
			customer_price_level= customer_record.pricelevel;
			log('Price Level::'+customer_price_level);

			//Get the Customer Pricing Preference
			customer_pricing_preference= customer_record.custentity_pricing_preference;
			log('Pricing Preference::'+customer_pricing_preference);
			//Break out Price Search ID
			if(customer_pricing_preference == 2){

				saved_search_id = breakout_price_search_Id;

			}
			//Baked Price Seacrh ID
			if(customer_pricing_preference == 1){

				saved_search_id = baked_price_search_Id;
			}
			//Break Out Price/No Royalty Search ID
			if(customer_pricing_preference == 3){

				saved_search_id = breakout_price_nr_search_Id;
			}
			/**
			 * Check if both the Customer Price Level and Customer Pricing Preference is Present
			 */
			if(customer_price_level && customer_pricing_preference){
				generate_json_content(customer_price_level,customer_pricing_preference,saved_search_id);

				if(Isdownload=='true'){
					//Adding filters to the search
		
					var Arrfilters = new Array();
					Arrfilters.push(new nlobjSearchFilter('custrecord_price_level', 'custrecord_price_plus_royalty_item','is', customer_price_level));
// Get all the search results in an Array	
					var ArrSearchResults = searchAllRecords('item', saved_search_id, Arrfilters, null);
					if(ArrSearchResults &&ArrSearchResults.length >0 ){
						// Calling 	CreateXLSFile function to create the XLS content 
						var xmlstring = CreateXLSFile(saved_search_id, ArrSearchResults);
						nlapiLogExecution('DEBUG', 'MBL Supplement Data', ' ******* Xls Content Created:******');
						// Set the content type to the created XML string	
						response.setContentType('EXCEL', ' MBL Supplement Data - ' + Datetime + '.xls');
						// write the output of created XLS file on the response.	
						response.write(nlapiEncrypt(xmlstring, 'base64'));
					}else{
						response.write("There is No Price Level associated with this Customer");
					}
				
				}else{
					response.write(JSON.stringify(responseObject));
				}
				
			}
			else{
				response.write("There is No Price Level associated with this Customer");
			}



		}
	}
	catch(e)
	{
		log('Exception Occured::'+e);
	}

	log('<<Execution Ended>>');

}


/**
 * This function will form the json for the supplement data
 * 
 * @param customer_price_level-- hodls the price level 
 * @param customer_price_level-- holds the pricing preference
 */
function generate_json_content(customer_price_level,customer_pricing_preference,saved_search_id) 
{

	var columns=new Array();

	var filters= new Array();

	filters.push(new nlobjSearchFilter('custrecord_price_level', 'custrecord_price_plus_royalty_item','is', customer_price_level));

	var resultsObj = null;

	var start=0,end=1000;

	//Load the saved search
	resultsObj = nlapiLoadSearch('item', saved_search_id);

	//add the new filters
	resultsObj.addFilters(filters);

	//Run the search Object
	var runObject=resultsObj.runSearch();

	var supplementArray = [];
	//Get the results from the saved search

	while(true){
		var results = runObject.getResults(start, end);
		if(results && results.length>0){
			log('Results Length::'+results.length);

			//Get Columns from the savedsearch
			var columns = runObject.getColumns();

			for(var i=0;i<results.length;i++)
			{

				var eachRow={};

				for(var j=0;j<columns.length;j++)
				{               		  

					if((!results[i].getText(columns[j])) || (results[i].getText(columns[j])==''))
					{
						eachRow[columns[j].getLabel()] = encodeURIComponent(results[i].getValue(columns[j]));
					}
					else
					{
						eachRow[columns[j].getLabel()] = encodeURIComponent(results[i].getText(columns[j]));
					}

				}

				supplementArray[i+start]=eachRow;

			}


			start=end;
			end=end+1000;
		}
		else
		{
			//Send the Response when all the supplement data is processed
			responseObject.Results = supplementArray;
			break;

		}
	}	



}



function add_to_json(results,columns)
{
	var supplementArray=[];
	for(var j=0;j<columns.length;j++)
	{	
		supplementArray.push(results.getValue(columns[j]));
	}

}



/**
 * This function will log all the details wherever needed
 * 
 * @param details -- holds the description of the log
 */
function log(details)
{
	nlapiLogExecution('debug', 'Generate COA from SO', details);
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

