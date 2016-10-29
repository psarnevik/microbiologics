/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Sep 2016     pkoluguri			Gets the user entered values from the 
 * 												Contact Us form and create a Contact Us 
 * 												record
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var record_id=null;
function suitelet(request, response)
{
	log('<Execution Started>>');
	
	if(request.getMethod()=="POST")
		{
			var data= request.getBody();
			log('Data::'+data);
			data=JSON.parse(data);
			
			if(data)
				{	
					
					var route = data['route'];
					log('Route::'+route);
					
					var first_name = data['first_name'];
					log('First Name::'+first_name);
					
					var last_name = data['last_name'];
					log('Last Name::'+last_name);
					
					var company_name = data['company'];
					log('Company Name::'+company_name);
					
					var job_title = data['job_title'];
					log('Job Title::'+job_title);
					
					//Address Line 1
					/*var address_line_1 = data['address_line_1'];
					log('Address Line 1::'+address_line_1);
					
					//Address Line 2
					var address_line_2 = data['address_line_2'];
					log('Address Line 2::'+address_line_2);
					
					var city = data['city'];
					log('City::'+city);*/
					
					var state = data['state'];
					log('State::'+state);
					
					var country = data['country'];
					log('Country::'+country);
					
					/*var zip_code = data['zip_code'];
					log('Zip Code::'+zip_code);*/
					
					var email = data['email'];
					log('Email::'+email);
					
					var telephone_number = data['phone'];
					log('Telephone Number::'+telephone_number);
					
					/*var extension = data['extension'];
					log('Extension::'+extension);
					
					var newsletter = data['newsletter'];
					log('News Letter::'+newsletter);*/
					
					var message = data['message'];
					log('Message::'+message);
					
					try{
						//Create Forms Data Record
						var record = nlapiCreateRecord('customrecord_contactus');
						
						log('Test Log');
						if(route!=undefined){
						record.setFieldValue('custrecordcontactroute',route);
						}
						if(company_name!=undefined){
						record.setFieldValue('custrecordcontactcompany',company_name);
						}
						/*if(newsletter!=undefined){
							if(newsletter==true)
								{
								newsletter='T';
								}
							else
								{
								newsletter='F';
								}
						record.setFieldValue('custrecordcontactnewsletter',newsletter);
						}*/
						if(first_name!=undefined){
						record.setFieldValue('custrecordcontactfirst',first_name);
						}
						if(last_name!=undefined){
						record.setFieldValue('custrecordcontactlast',last_name);
						}
						if(job_title!=undefined){
						record.setFieldValue('custrecordcontact_title',job_title);
						}
						if(email!=undefined){
						record.setFieldValue('custrecordcontactemail',email);
						}
						/*if(address_line_1!=undefined){
						record.setFieldValue('custrecordcontactaddress1',address_line_1);
						}
						if(address_line_2!=undefined){
						record.setFieldValue('custrecordcontactaddress2',address_line_2);
						}
						if(city!=undefined){
						record.setFieldValue('custrecordcontactcity',city);
						}
						if(extension!=undefined){
						record.setFieldValue('custrecordcontactextension',extension);
						}
						if(zip_code!=undefined){
						record.setFieldValue('custrecordcontactzip',zip_code);
						}*/
						if(state!=undefined){
						record.setFieldValue('custrecordcontactstate',state);
						}
						if(country!=undefined){
						record.setFieldValue('custrecordcontactcountry',country);
						}
						if(telephone_number!=undefined){
						record.setFieldValue('custrecordcontactphone',telephone_number);
						}
						if(message!=undefined){
						record.setFieldValue('custrecordcontactmessage',message);
						}
						
						record.setFieldValue('custrecord_es_locationid',1);
						

						record_id= nlapiSubmitRecord(record);
						log('Contact Us Submitted::'+record_id);
					}
					catch(e)
					{
						log('Exception Occured while Creating Contact Us::'+e);
					}
					
				}
			
			if(record_id)
				{
			response.write('Contact Us Created::'+record_id);
				}
			else
				{
				response.write('Failed to Create Contact Us Record');
				}
		}
	
	

	
	log('<Execution Ended>>');
}

/**
 * This function will log all the details wherever needed
 * @param details
 */
function log(details)
{
	nlapiLogExecution('debug', 'Contact Us Record', details);
}
