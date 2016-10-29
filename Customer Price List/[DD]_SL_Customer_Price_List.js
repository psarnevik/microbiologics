/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Aug 2016     aramar			This script to export a "live" customer price list based on a saved search of customer price preference
 *
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
var PricingSavedSearch ='';
function DD_MBL_Customer_Price_list(request, response){
nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list',   ' ******* Method:******= ' + request.getMethod());
var intcustomerID			= request.getParameter('customerid');
var Datetime				= GetTime().YYYYMMDD;
nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list',   ' Date YYYYMMDD = ' + Datetime);
//Execute if the customer internal id passed to this suite let to get pricing list of cistomer
if(intcustomerID){
	var context 				= nlapiGetContext();
// Fetch the script parameter for all three saved searches
	var SCAMBLBakedPrice 		= context.getSetting('SCRIPT', 'custscript_dd_sca_mbl_baked_price_list');
	var SCAMBLBreakoutPrice 	= context.getSetting('SCRIPT', 'custscript_dd_sca_mbl_breakout_price_lit');
	var SCAMBLBreakoutnrPrice 	= context.getSetting('SCRIPT', 'custscript_dd_sca_mbl_breakoutnr_price');
	var CustomerPricingfields	= ['custentity_pricing_preference','pricelevel'];
	var CustomerRecord 			= [];
// Fetch required customer fields like PrincingPreference, 	PricingLevel,Customer name.
	CustomerRecord			 	= nlapiLookupField('customer', intcustomerID, CustomerPricingfields);
	var PrincingPreference 		= CustomerRecord.custentity_pricing_preference;
	var PricingLevel			= CustomerRecord.pricelevel;
// Get the Saved search based on the customer PrincingPreference baked/break out/break out nr	
	if(PrincingPreference==1){
		PricingSavedSearch		= SCAMBLBakedPrice;
	}if(PrincingPreference==2){
		PricingSavedSearch		= SCAMBLBreakoutPrice;
	}if(PrincingPreference==3){
		PricingSavedSearch		= SCAMBLBreakoutnrPrice;
	}
//Adding filters to the search
	var Arrfilters 				= new Array();
		Arrfilters.push(new nlobjSearchFilter('custrecord_price_level', 'custrecord_price_plus_royalty_item','is', PricingLevel));
// Get all the search results in an Array	
		var ArrSearchResults 		= searchAllRecords('item', PricingSavedSearch, Arrfilters, null);
	var xmlstring= CreateXLSFile(ArrSearchResults);	
	nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list',   ' ******* Xls Content Created:******');
	response.setContentType('EXCEL',' Microbiologics Customer Price List - '+ Datetime+'.xls');
	response.write(nlapiEncrypt(xmlstring, 'base64'));
	nlapiLogExecution('DEBUG', 'DD_MBL_Customer_Price_list',   ' ******* SCRIPT END:******');
}

}
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
            //checkMetering(200);
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
//function to Create the XLS File
function CreateXLSFile(SavedSearchResults){
	//construct xml equivalent of the file

	var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'; 
	xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
	xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
	xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
	xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
	xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">'; 

	xmlString += '<Worksheet ss:Name="Sheet1">';
	xmlString += '<Table>' + 

	           '<Row>' +
	            '<Cell><Data ss:Type="String"> PRODUCT LINE </Data></Cell>' +
	            '<Cell><Data ss:Type="String"> DESCRIPTION </Data></Cell>' +
	            '<Cell><Data ss:Type="String"> CATALOG# </Data></Cell>' +
	            '<Cell><Data ss:Type="String"> PRICE CODE </Data></Cell>' +
	            '<Cell><Data ss:Type="String"> MARKETING COMMENTS </Data></Cell>' +
	            '<Cell><Data ss:Type="String"> BASE PRICE </Data></Cell>' +
	            '<Cell><Data ss:Type="String"> DISCOUNT </Data></Cell>' +
	            '<Cell><Data ss:Type="String"> YOUR PRICE </Data></Cell>' +
	       '</Row>';

	for (var j = 0; SavedSearchResults && j < SavedSearchResults.length; j++) {
		var searchColumns 		= SavedSearchResults[j].getAllColumns();
		var Productline 		= SavedSearchResults[j].getText(searchColumns[0]);
		var Description 		= SavedSearchResults[j].getValue(searchColumns[1]);
		var Catalog		 		= SavedSearchResults[j].getValue(searchColumns[2]);
		var PriceCode		 	= SavedSearchResults[j].getValue(searchColumns[3]);
		var MktComments		 	= SavedSearchResults[j].getValue(searchColumns[4]);
		var BasePrice		 	= SavedSearchResults[j].getValue(searchColumns[5]);
		var Discount		 	= SavedSearchResults[j].getValue(searchColumns[6]);
		var YourPrice		 	= SavedSearchResults[j].getValue(searchColumns[7]);
		xmlString += '<Row>' + 
        '<Cell><Data ss:Type="String">'+Productline+'</Data></Cell>' + 
        '<Cell><Data ss:Type="String">'+Description+'</Data></Cell>' + 
        '<Cell><Data ss:Type="String">'+Catalog+'</Data></Cell>' + 
        '<Cell><Data ss:Type="String">'+PriceCode+'</Data></Cell>' + 
        '<Cell><Data ss:Type="String">'+MktComments+'</Data></Cell>' + 
        '<Cell><Data ss:Type="String">'+BasePrice+'</Data></Cell>' + 
        '<Cell><Data ss:Type="String">'+Discount+'</Data></Cell>' + 
        '<Cell><Data ss:Type="String">'+YourPrice+'</Data></Cell>' + 
'</Row>';
	}
	xmlString += '</Table></Worksheet></Workbook>';
	return xmlString;
}
//function to Get Date in YYYYMMDD format
function GetTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
	var seconds = now.getSeconds();
    if (month.toString().length == 1) {
        month = '0' + month;
    }
    if (day.toString().length == 1) {
        day = '0' + day;
    }
    if (hour.toString().length == 1) {
        hour = '0' + hour;
    }
    if (minute.toString().length == 1) {
        minute = '0' + minute;
    }
    if(seconds == 0)
    	seconds = '00';
	if(seconds.toString().lenght == 1){
		seconds = '0' + seconds;
	}
    return ({ YYYYMMDD: year + ':' + month + ':' + day});
}