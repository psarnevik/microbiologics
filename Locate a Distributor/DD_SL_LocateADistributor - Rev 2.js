/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Aug 2016     parnevik
 * 2.00       09 Sep 2016     parnevik         Added "market served" field to JSON object
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function getDistributors(request, response){
	var returnType = request.getParameter('return_type');
	nlapiLogExecution('Debug','selectDistrubutor2','returnType: '+ returnType);
	
		returnDistributorList(request, response);
}

function returnDistributorList(request, response){
	nlapiLogExecution('DEBUG', 'returnLatLng', 'Function Ran');
	
	var countryId = request.getParameter('country_id');
	nlapiLogExecution('Debug','selectDistrubutor2','countryId: '+ countryId);
	var locationId = request.getParameter('location_id');
	nlapiLogExecution('Debug','selectDistrubutor2','locationId: '+ locationId);
	
	var countryVar = ['custrecord_co_latitude', 'custrecord_co_longitude', 'custrecord_map_zoom_level'];
	var countryVal = nlapiLookupField('customrecordcountry', countryId, countryVar);
	
	var countryLat = countryVal.custrecord_co_latitude;
	var countryLng = countryVal.custrecord_co_longitude;
	var countryZoom = countryVal.custrecord_map_zoom_level;
	
	nlapiLogExecution('DEBUG', 'Country Values', 'Lat: '+countryLat+', Lng: '+countryLng+', Zoom: '+countryZoom);
	
	var results = returnDistributors(countryId, locationId);
	
	if(!results){
		response.write('0');
	}
	
	var distObject = {};
	
	var countryValues = {};
	
	countryValues.lat = countryLat;
	countryValues.lng = countryLng;
	countryValues.zoom = countryZoom;
	
	var distributorList = [];
	
	nlapiLogExecution('DEBUG', 'Results Length', 'Results Length: '+results.length);
	
	for (var i = 0; results != null && i < results.length; i++ ){
		var dist = {};
		var rec = results[i];
		
		var entityid = rec.getValue( 'custentity50',null,'group' );
		var marketServed = rec.getValue( 'custentity_web_list_mkt_served', null, 'group');
		var city = rec.getValue( 'custentity51',null,'group' );
		var state = rec.getValue( 'custentity52',null,'group' );
		var zip = rec.getValue( 'custentity53',null,'group' );
		var country = rec.getText( 'custentity54',null,'group' );
		var phone = rec.getValue( 'custentity55',null,'group' );
		var fax = rec.getValue( 'custentity56',null,'group' );
		var email = rec.getValue( 'custentity57',null,'group' );
		var url = rec.getValue( 'custentity58',null,'group' );
		var lat = rec.getValue('custentity_web_list_latitude',null,'group');
		var lng = rec.getValue('custentity_web_list_longitude',null,'group');

		nlapiLogExecution('DEBUG', 'Retrieving Lat Lng', 'Lat: '+lat+', Lng: '+lng);
		nlapiLogExecution('DEBUG', 'Market', 'Market Served = '+marketServed);

		if (entityid == '' || entityid == null){
			continue;
		}
		
		if(lat == '' || lng == ''){
			continue;
		}
		
		dist.lat = lat;
		dist.lng = lng;
		dist.name = entityid;
		if(marketServed != '' && marketServed != '- None -'){
			dist.marketServed = 'Market(s) Served: '+marketServed;
		}
		dist.city = city;
		dist.state = state;
		dist.zip = zip;
		dist.country = country;
		dist.phone = phone;
		dist.fax = fax;
		dist.email = email;
		dist.url = url;
		
		distributorList[i] = dist;
	}

	distObject.countryValues = countryValues;
	distObject.distributorList = distributorList;

	response.write(JSON.stringify(distObject));
}

function returnDistributors(countryId, locationId){
	var validStatus = new Array(13,15);
	var filters = [];
	filters.push( new nlobjSearchFilter('custentity45', null, 'anyof', countryId) );
	filters.push( new nlobjSearchFilter('parent', null, 'is', '@NONE@') );
	filters.push( new nlobjSearchFilter('isinactive', null, 'is', 'F') );
	filters.push( new nlobjSearchFilter('status', null, 'anyof', validStatus) );
	filters.push( new nlobjSearchFilter('custentityloc_id', null, 'anyof', locationId) );
	
	var columns = [];
	columns.push( new nlobjSearchColumn('custentity50',null,'group'));
	columns.push( new nlobjSearchColumn('custentitywebdistdisplay',null,'group').setSort() );
	columns.push( new nlobjSearchColumn('custentity51',null,'group') );
	columns.push( new nlobjSearchColumn('custentity52',null,'group') );
	columns.push( new nlobjSearchColumn('custentity53',null,'group') );
	columns.push( new nlobjSearchColumn('custentity54',null,'group') );
	columns.push( new nlobjSearchColumn('custentity55',null,'group') );
	columns.push( new nlobjSearchColumn('custentity56',null,'group') );
	columns.push( new nlobjSearchColumn('custentity57',null,'group') );
	columns.push( new nlobjSearchColumn('custentity58',null,'group') );
	columns.push( new nlobjSearchColumn('internalid',null,'group') );
	columns.push( new nlobjSearchColumn('custentity_web_list_mkt_served',null,'group') );
	columns.push( new nlobjSearchColumn('custentity_web_list_latitude',null,'group') );
	columns.push( new nlobjSearchColumn('custentity_web_list_longitude',null,'group') );
	
	var results = nlapiSearchRecord('customer', null, filters, columns);
	
	return results;
}
