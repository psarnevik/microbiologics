/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Aug 2016     parnevik
 * 2.00       09 Sep 2016     parnevik         Added "market served" field to JSON object
 * 3.00       22 Sep 2016     parnevik         Added saved search instead of ad hoc search within script
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function getDistributors(request, response){
	var countryId = request.getParameter('country_id');
	var searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_locate_distributor');
	
	/*
	 * JSON format: { distObject: {countryValues {countryLat, countryLng, countryZoom}}, distributorList[ dist {values}]}
	 */
	var distObject = {};
	var countryValues = {};
	var distributorList = [];
	
	
	/* 
	 * Gets the lat, long, and zoom levels on the country custom record
	 * Sets the countryValues object
	 */
	var countryVar = ['custrecord_co_latitude', 'custrecord_co_longitude', 'custrecord_map_zoom_level'];
	var countryVal = nlapiLookupField('customrecordcountry', countryId, countryVar);
	if(!countryVal){
		return 0;
	}
	
	
	var countryLat = countryVal.custrecord_co_latitude;
	var countryLng = countryVal.custrecord_co_longitude;
	var countryZoom = countryVal.custrecord_map_zoom_level;
	
	

	countryValues.lat = countryLat;
	countryValues.lng = countryLng;
	countryValues.zoom = countryZoom;
	
	/*
	 * Fetch the distributors based on the country ID sent to the suitelet
	 */
	
	//Add the country ID to the search as a filter on the sales territory field from the customer-distributor record
	var filters = [];
	filters.push(new nlobjSearchFilter('custentity45', null, 'anyof', countryId));
	
	var searchResults = nlapiSearchRecord('customer', searchId, filters);
	if(!searchResults){
		return 0;
	}
	
	var columns = searchResults[0].getAllColumns();
	
	/*
	 * Loop through the search results to create a distirbutor object for each result that is stored in the distributor list array
	 */
	for(var i in searchResults){
		var dist = {};
		var result = searchResults[i];

		dist.name = getColValue(result,columns[0]);
		dist.lat = getColValue(result,columns[1]);
		dist.lng = getColValue(result,columns[2]);
		dist.marketServed = getColValue(result,columns[3]);
		dist.city = getColValue(result,columns[4]);
		dist.state = getColValue(result,columns[5]);
		dist.zip = getColValue(result,columns[6]);
		dist.country = getColValue(result,columns[7]);			
		dist.phone = getColValue(result,columns[8]);
		dist.fax = getColValue(result,columns[9]);
		dist.email = getColValue(result,columns[10]);
		dist.url = getColValue(result,columns[11]);
		
		distributorList[i] = dist;
	}
	/*
	 * Sets the values for the distObject{}
	 */
	distObject.countryValues = countryValues;
	distObject.distributorList = distributorList;

	response.write(JSON.stringify(distObject));
}

function getColValue(result, column){
	var value = result.getText(column);
	
	if(value == '' || !value){
		value = result.getValue(column);
	}
	
	return value;
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}