/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Oct 2016     aramar
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var record_id=null;
function DD_SL_Create_Form_Data(request, response){
	log('<Execution Started>>');
	
	if(request.getMethod()=="POST")
		{
			var data= request.getBody();
			log('Data::'+data);
			data=JSON.parse(data);
			
			if(data)
				{	

					
					var first_name = data['first_name'];
					log('First Name::'+first_name);
					
					var last_name = data['last_name'];
					log('Last Name::'+last_name);
					
					var company_name = data['company'];
					log('Company Name::'+company_name);
					
					var job_title = data['job_title'];
					log('Job Title::'+job_title);
					
					//Address Line 1
					var address_line_1 = data['address_line_1'];
					log('Address Line 1::'+address_line_1);
					
					//Address Line 2
					var address_line_2 = data['address_line_2'];
					log('Address Line 2::'+address_line_2);
					
					var city = data['city'];
					log('City::'+city);
					
					var state = data['state'];
					log('State::'+state);
					
					var country = data['country'];
					log('Country::'+country);
					
					var zip_code = data['zip_code'];
					log('Zip Code::'+zip_code);
					
					var email = data['email'];
					log('Email::'+email);
					
					var telephone_number = data['phone'];
					log('Telephone Number::'+telephone_number);
					
					var microorganismname = data['microorganismname'];
					log('microorganismname::'+microorganismname);
					
					var reference = data['reference'];
					log(' reference::'+reference);
					
					var packagingpreference = data['packagingpreference'];
					log('packagingpreference::'+packagingpreference);
					var packagingotherpreference = data['packagingotherpreference'];
					log('packagingotherpreference::'+packagingotherpreference);
					var productconcentration = data['productconcentration'];
					log('productconcentration::'+productconcentration);
					var qcuse = data['qcuse'];
					log('News qcuse::'+qcuse);

					var mediarequirements = data['mediarequirements'];
					log('mediarequirements::'+mediarequirements);
					
					var regulatoryagency = data['regulatoryagency'];
					log('regulatoryagency::'+regulatoryagency);
					
					var regulatorydocument = data['regulatorydocument'];
					log('News regulatorydocument::'+regulatorydocument);
					
					var frequencyuse = data['frequencyuse'];
					log('frequencyuse::'+frequencyuse);
					
					var comments = data['comments'];
					log('comments::'+comments);
					
		try{
						//Create Forms Data Record
						var record = nlapiCreateRecord('customrecord_formsdata');
						record.setFieldValue('custrecord_formdata_firstname',first_name);
						record.setFieldValue('custrecord_formdata_lastname',last_name);
						record.setFieldValue('custrecord_formdata_jobtitle',job_title);
						record.setFieldValue('custrecord_formdata_company',company_name);
						record.setFieldValue('custrecord_formdata_addressline1',address_line_1);
						record.setFieldValue('custrecord_formdata_addressline2',EmptyCheck(address_line_2));
						record.setFieldValue('custrecord_formdata_city',city);
						record.setFieldValue('custrecord_formdata_stateprovince',state);
						record.setFieldValue('custrecord_formdata_zipcode',zip_code);
						record.setFieldValue('custrecord_formdata_country',country);
						record.setFieldValue('custrecord_formdata_phone',telephone_number);
						record.setFieldValue('custrecord_formdata_email',email);
						record.setFieldValue('custrecord_formdata_microorg_name',microorganismname);
						record.setFieldValue('custrecord_formdata_microorg_refno',EmptyCheck(reference));
						record.setFieldValue('custrecord_formdata_pkg_preference',EmptyCheck(packagingpreference));
						record.setFieldValue('custrecord_formdata_pkg_preferother',EmptyCheck(packagingotherpreference));
						record.setFieldValue('custrecord_formdata_media_reqts',EmptyCheck(mediarequirements));
						record.setFieldValue('custrecord_formdata_productconcentration',EmptyCheck(productconcentration));
						record.setFieldValue('custrecord_formdata_qc_use',EmptyCheck(qcuse));
						record.setFieldValue('custrecord_formdata_mandated',EmptyCheck(regulatoryagency));
						record.setFieldValue('custrecord_formdata_regulatoryagency',EmptyCheck(regulatorydocument));
						record.setFieldValue('custrecord_formdata_freqofuse',EmptyCheck(frequencyuse));
						record.setFieldValue('custrecord_formdata_comment',EmptyCheck(comments));
						record.setFieldValue('custrecord_formdata_es_locationid',1);
						log('Test Log');


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
			response.write('Forms Data Created::'+record_id);
				}
			else
				{
				response.write('Failed to Create Forms Data Record');
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
	nlapiLogExecution('debug', 'Forms Data Record', details);
}
//Check Null or empty or undefined Values 
function EmptyCheck (value) 
{

	if((value == '') || (value == null) || (value == undefined)) 
	{
		return '';
	}
	return value;
}