/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Aug 2016     parnevik
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function setLatLong(type){
  if(type != 'create' && type != 'edit'){
	  return;
  }

  var cust = nlapiGetNewRecord();
  
  var custId = cust.getId();
  nlapiLogExecution('DEBUG', 'Load Record', 'Loading record: '+custId);
  var city = cust.getFieldValue('custentity51');
  var state = cust.getFieldValue('custentity52');
  var zip = cust.getFieldValue('custentity53');
  var country = cust.getFieldText('custentity54');
  var currLat = cust.getFieldValue('custentity_web_list_latitude');
  var currLng = cust.getFieldValue('custentity_web_list_longitude');
  
  if(currLat != '' || currLng != ''){
	  nlapiLogExecution('DEBUG', 'Exiting script.', 'Lat and Lng have already been set. Lat = '+currLat+' , Lng = '+currLng+', exiting script.');
  }
  
  var address = '';
  
  if(city && city != ''){
	  address = city + '+';
  }
  
  if(state && state != ''){
	  address = address + state + '+';
  }
  
  if(zip && zip != ''){
	  address = address + zip + '+';
  }
  
  if(country && country != ''){
	  address = address + country;
  }
  
  if(!address || address == ''){
	  nlapiLogExecution('DEBUG', 'Address null check', 'Address does not exist or is empty string, exiting function');
	  return;  
  }
  
  //nlapiLogExecution('DEBUG', 'Continuing', 'Address = '+address);
  
  if(address.substring(address.length - 1) == '+'){
	  address = address.substring(0, address.length);
	  //nlapiLogExecution('DEBUG', 'Trimming + from end of string', 'Address = '+address);
  }
  
  address = address.replace(/ /g, '+');
  address = address.replace(/&/g, 'and');
  
  address = address + '&sensor=false';
  address = address + '&key=AIzaSyD6sUbGyktJhh5OQ8tSms8iHBSGRjs-3_E';
  
  var googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
  
  var geoCodeURL = googleURL + address;
  
  //nlapiLogExecution('DEBUG', 'URL Created', 'URL = '+geoCodeURL);   
  //nlapiLogExecution('DEBUG', 'Clean URL without spaces', 'New URL = '+geoCodeURL);

  var geoCode;
  try{
  geoCode = nlapiRequestURL(geoCodeURL).getBody();
  }
  catch(e){
	  nlapiLogExecution('ERROR', 'Unable to fetch Geocode URL from Google', 'Error Details: '+e);
  }

  //nlapiLogExecution('DEBUG', 'After getting geocode', 'GeoCode Object = '+geoCode);
  
  if(!geoCode){
	  nlapiLogExecution('ERROR', 'Geocode object not returned, exiting script.'); 
	  return;
  }
  
  geoCode = JSON.parse(geoCode);
  nlapiLogExecution('DEBUG', 'After getting geocode', 'Status = '+geoCode.status);
  
  if(geoCode.status != 'OK'){
	  nlapiLogExecution('ERROR', 'Status not OK.', 'Record ID: '+custId+', Status = '+geoCode.status+', status not OK, exiting.');
	  return;
  }
    
  var lat = '';
  var lng = '';

  lat = geoCode.results[0].geometry.location.lat;
  lng = geoCode.results[0].geometry.location.lng;
  
  nlapiLogExecution('DEBUG', 'Captured Lat/Lng', 'Lat = '+lat+', Lng = '+lng);
  
  var custFieldNames = ['custentity_web_list_latitude', 'custentity_web_list_longitude'];
  var custFieldValues = [lat, lng];
  
  try{
  nlapiSubmitField('customer', custId, custFieldNames, custFieldValues);
  }
  catch(e){
	  nlapiLogExecution('ERROR', 'Unable to set lat/lng fields', 'Error Details: '+e);
  }
}