/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Aug 2016     parnevik
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

//HTML header information returned at top of response
var USAHTML_MBL = '<H4><span style="color:red">Microbiologics US Area Sales Managers:</span></h4>';
USAHTML_MBL +='<p><b>National Sales Manager - Contact: Alan Kaplan <a href="callto:19712198119">(971) 219-8119</a></b><br>';
USAHTML_MBL += '<br><b>Central Territory – Contact: Diana Kroeker <a href="callto:18165093942">(816) 509-3942</a></b><br>' ;
USAHTML_MBL += 'AR, CO, IA, KS, LA, MO, NE, NM, OK, SD, TX<br>';
USAHTML_MBL += '<br><b>Midwest Territory – Contact: Doug Beissel <a href="callto:16129860406">(612) 986-0406</a></b><br>' ;
USAHTML_MBL += 'IL, IN, MI, MN, ND, OH, WI<br>';
USAHTML_MBL += '<br><b>Northeast Territory – Contact: Barbara Allgaier <a href="callto:14102687648">(410) 268-7648</a></b><br>';
USAHTML_MBL += 'CT, DC, DE, MA, MD, ME, NH, NJ, NY, PA, RI, VA, VT, WV<br>';
USAHTML_MBL += '<br><b>South Territory – Contact: Joe Iacono <a href="callto:17703757685">(770) 375-7685</a></b><br>';
USAHTML_MBL += 'AL, FL, GA, KY, MS, NC, SC, TN<br>';
USAHTML_MBL += '<br><b>West Territory – Contact: Kelly Hedlund<a href="callto:13202494761">(320) 249-4761</a></b><br>';
USAHTML_MBL += 'AK, AZ, CA, HI, ID, MT, NV, OR, UT, WA, WY<br>';

var USACONTACT_MBL = '<span style="color:red">Please contact Microbiologics directly:</span></H4>';
USACONTACT_MBL += '<div><div>MICROBIOLOGICS, INC</div>';
USACONTACT_MBL += 'ST. CLOUD<br>';
USACONTACT_MBL += 'Minnesota<br>';
USACONTACT_MBL += '56303<br>';
USACONTACT_MBL += 'United States<br><br>';
USACONTACT_MBL += '<b>Phone:</b> (320) 253-1640<br>';
USACONTACT_MBL += '<b>Fax:</b> (320) 253-6250<br>';
USACONTACT_MBL += '<b>Email:</b> <a href="mailto:myaccount@microbiologics.com">myaccount@microbiologics.com</a><br>';
USACONTACT_MBL += '<b>Website:</b> <a href="http://www.microbiologics.com">http://www.microbiologics.com</a><br></div>';

var USACONTACT_GIBSON = '<span style="color:red">Please contact Gibson BioScience directly:</span></H4>';
USACONTACT_GIBSON += '<div><div>GIBSON BIOSCIENCE</div>';
USACONTACT_GIBSON += 'LEXINGTON<br>';
USACONTACT_GIBSON += 'Kentucky<br>';
USACONTACT_GIBSON += '40508<br>';
USACONTACT_GIBSON += 'United States<br><br>';
USACONTACT_GIBSON += '<b>Phone:</b> (859) 254-9557<br>';
USACONTACT_GIBSON += '<b>Fax:</b> (859) 253-1476<br>';
USACONTACT_GIBSON += '<b>Email:</b> <a href="mailto:customerservice@gibsonlabs.com">customerservice@gibsonlabs.com</a><br>';
USACONTACT_GIBSON += '<b>Website:</b> <a href="http://www.gibsonbioscience.com">http://www.gibsonbioscience.com</a><br></div>';

var USACONTACT = '';
var USAHTML = '';

function getDistributors(request, response){
	var returnType = request.getParameter('return_type');
	nlapiLogExecution('Debug','selectDistrubutor2','returnType: '+ returnType);
	
	if(returnType == '2'){
		returnLatLng(request, response);
	}
	else{
		returnDistributorList(request, response);
	}
}


function returnDistributorList(request, response)
{
	var S_countryId = request.getParameter('country_id');
	nlapiLogExecution('Debug','selectDistrubutor2','S_countryId: '+ S_countryId);
	var S_countryName = request.getParameter('country_name');
	nlapiLogExecution('Debug','selectDistrubutor2','S_countryName: '+ S_countryName);
	var S_locationId = request.getParameter('location_id');
	nlapiLogExecution('Debug','selectDistrubutor2','S_locationId: '+ S_locationId);
	
	var html = '';

	if (S_locationId=='2'){
		USACONTACT = USACONTACT_GIBSON;
		USAHTML = USACONTACT_GIBSON;
	}
	else{
		USACONTACT = USACONTACT_MBL;
		USAHTML = USAHTML_MBL;
	}
	
	var results;
	
	try{
		results = returnDistributors(S_countryId, S_locationId);
	}
	catch (e){
		var st_error = (e.getCode != null) ? e.getCode() +'<br />'+e.getDetails()+'<br />'+e.getStackTrace().join('<br />') : e.toString();
		nlapiLogExecution('ERROR','selectDistrubutor2','ES_CAUGHT_ERROR:<br />' + st_error);
		html = '<br><br><H4>There was a problem on the page. ' + USACONTACT;
	}
	if(results == null){
		html = '<br><br><H4>We do not have any distributors in ' +  S_countryName + '. ' + USACONTACT;
	}
	else{
		html += '';
		if ( S_countryId == '1'){
			html += USAHTML;
		}

		html +='<H4>Our distributors in ' +  S_countryName +' are:</H4>';

		nlapiLogExecution('Debug','selectDistrubutor2','RESULTS: ');
		for (var i = 0; results != null && i < results.length; i++ ){
			var result = results[i];
			var entityid = result.getValue( 'custentity50',null,'group' );
			var city = result.getValue( 'custentity51',null,'group' );
			var state = result.getValue( 'custentity52',null,'group' );
			var zip = result.getValue( 'custentity53',null,'group' );
			var country = result.getText( 'custentity54',null,'group' );
			var phone = result.getValue( 'custentity55',null,'group' );
			var fax = result.getValue( 'custentity56',null,'group' );
			var email = result.getValue( 'custentity57',null,'group' );
			var url = result.getValue( 'custentity58',null,'group' );
			var stDisplayOrder = result.getValue( 'custentitywebdistdisplay',null,'group' );
			var id = result.getId();

			nlapiLogExecution('Debug','selectDistrubutor2',entityid+' stDisplayOrder: '+ stDisplayOrder);

			if (entityid!='' && entityid!=null && entityid!='- None -'){
				html+='<div><div>' + entityid + '</div>';

				if(city!='' && city!=null && city!='- None -'){ html+=city + '<br/>'; }
				if(state!='' && state!=null && state!='- None -'){ html+=state+ '<br/>'; }
				if(zip!='' && zip!=null && zip!='- None -'){ html+=zip+ '<br/>'; }
				if(country!='' && country!=null && country!='- None -'){ html+=country+ '<br/><br/>'; }
				if(phone!='' && phone!=null && phone!='- None -'){ html+='<b>Phone:</b> ' + phone+ '<br/>'; }
				if(fax!='' && fax!=null && fax!='- None -'){ html+='<b>Fax:</b> '+fax+ '<br/>'; }
				if(email!='' && email!=null && email!='- None -'){ html+='<b>Email:</b> '+email+ '<br/>'; }
				if(url!='' && url!=null && url!='- None -'){ html+='<b>Website:</b> <a href="'+url+'" target="_blank">'+url+'</a><br/>'; }				
				html+='</div>';
			}
		}	
	}

	//html = encodeURIComponent(html);
	
	response.write(html);
}

function returnLatLng(request, response){
	nlapiLogExecution('DEBUG', 'returnLatLng', 'Function Ran');
	
	var S_countryId = request.getParameter('country_id');
	nlapiLogExecution('Debug','selectDistrubutor2','S_countryId: '+ S_countryId);
	var S_locationId = request.getParameter('location_id');
	nlapiLogExecution('Debug','selectDistrubutor2','S_locationId: '+ S_locationId);
	
	var countryVar = ['custrecord_co_latitude', 'custrecord_co_longitude', 'custrecord_map_zoom_level'];
	var countryVal = nlapiLookupField('customrecordcountry', S_countryId, countryVar);
	
	var countryLat = countryVal.custrecord_co_latitude;
	var countryLng = countryVal.custrecord_co_longitude;
	var countryZoom = countryVal.custrecord_map_zoom_level;
	
	nlapiLogExecution('DEBUG', 'Country Values', 'Lat: '+countryLat+', Lng: '+countryLng+', Zoom: '+countryZoom);
	
	var results = returnDistributors(S_countryId, S_locationId);
	
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

		if (entityid == '' || entityid == null){
			continue;
		}
		
		if(lat == '' || lng == ''){
			continue;
		}
		
		dist.lat = lat;
		dist.lng = lng;
		dist.name = entityid;
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
	var S_countryId = countryId;
	var S_locationId = locationId;
	
	var validStatus = new Array(13,15);
	var A_filters = [];
	A_filters.push( new nlobjSearchFilter('custentity45', null, 'anyof', S_countryId) );
	A_filters.push( new nlobjSearchFilter('parent', null, 'is', '@NONE@') );
	A_filters.push( new nlobjSearchFilter('isinactive', null, 'is', 'F') );
	A_filters.push( new nlobjSearchFilter('status', null, 'anyof', validStatus) );
	if(S_locationId){
		A_filters.push( new nlobjSearchFilter('custentityloc_id', null, 'anyof', S_locationId) );
	}
	
	var A_columns = [];
	A_columns.push( new nlobjSearchColumn('custentity50',null,'group'));
	A_columns.push( new nlobjSearchColumn('custentitywebdistdisplay',null,'group').setSort() );
	A_columns.push( new nlobjSearchColumn('custentity51',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity52',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity53',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity54',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity55',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity56',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity57',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity58',null,'group') );
	A_columns.push( new nlobjSearchColumn('internalid',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity_web_list_latitude',null,'group') );
	A_columns.push( new nlobjSearchColumn('custentity_web_list_longitude',null,'group') );
	
	var results = nlapiSearchRecord('customer', null, A_filters, A_columns);
	
	return results;
}
