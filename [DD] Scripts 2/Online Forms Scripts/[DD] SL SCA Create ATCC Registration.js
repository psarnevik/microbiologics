/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Sep 2016     pkoluguri			Gets the user entered values from the 
 * 												ATCC registration form and create a ATCC 
 * 												Registration record
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
			
			
			/*log('Country::'+data.parent['bio-safety-level']);
			log('Distributor::'+data.parent['packaging_preference']);
			log('Company Name::'+data.parent['first_name']);
			log('First Name::'+data.parent['first_name']);
			log('Last Name::'+data.parent['last_name']);*/

			if(data)
				{	
					
					var distributor = data['distributor'];
					log('Distributor::'+distributor);
					
					var company_name = data['company_name'];
					log('Company Name::'+company_name);
					
					var first_name = data['first_name'];
					log('First Name::'+first_name);
					
					var last_name = data['last_name'];
					log('Last Name::'+last_name);
					
					var job_title = data['job_title'];
					log('Job Title::'+job_title);
					
					var email = data['email'];
					log('Email::'+email);
					
					//Shipping Address Fields
					var shipping_address_1 = data['shipping_address_1'];
					log('Shipping Address 1::'+shipping_address_1);
					
					var shipping_address_2 = data['shipping_address_2'];
					log('Shipping Address 2::'+shipping_address_2);
					
					var shipping_city = data['shipping_city'];
					log('Shipping City::'+shipping_city);
					
					var shipping_state = data['shipping_state'];
					log('Shipping State::'+shipping_state);
					
					var shipping_zipcode = data['shipping_zipcode'];
					log('Shipping Zip Code::'+shipping_zipcode);
					
					
					
					//Billing Address Fields
					var billing_address_1 = data['billing_address_1'];
					log('Billing Address 1::'+billing_address_1);
					
					var billing_address_2 = data['billing_address_2'];
					log('Billing Address 2::'+billing_address_2);
					
					var billing_city = data['billing_city'];
					log('Billing City::'+billing_city);
					
					var billing_state = data['billing_state'];
					log('Billing State::'+billing_state);
					
					var billing_zipcode = data['billing_zipcode'];
					log('Billing Zip Code::'+billing_zipcode);
					
					var country = data['country'];
					log('Country::'+country);
					
					var telephone_number = data['phone_number'];
					log('Telephone Number::'+telephone_number);
					
					var fax_number = data['fax_number'];
					log('Fax Number::'+fax_number);
					
					var primary_market = data['primary_market'];
					log('Primary Market::'+primary_market);
					
					var language = data['language'];
					log('Language::'+language);
					
					var tax_exempt = data['tax_exempt'];
					log('Tax Exempt::'+tax_exempt);
					
					var same_as_shipping = data['same_as_shipping_address'];
					log('Same as Shipping Address::'+same_as_shipping);
					
					var news_letter = data['newsletter'];
					log('News Letter::'+news_letter);
					
					var agree_to_terms = data['agree_to_terms'];
					log('Agree to Terms::'+agree_to_terms);
					
					try{
						//Create Forms Data Record
						var record = nlapiCreateRecord('customrecordatccregistration');
						
						log('Test Log');
						if(distributor!=undefined){
						record.setFieldValue('custrecordatccreg_distributor',distributor);
						}
						if(company_name!=undefined){
						record.setFieldValue('custrecordatccreg_companyname',company_name);
						}
						if(agree_to_terms!=undefined){
							if(agree_to_terms==true)
								{
								agree_to_terms='T';
								}
							else
								{
								agree_to_terms='F';
								}
						record.setFieldValue('custrecordattcreg_accept_agreement',agree_to_terms);
						}
						if(first_name!=undefined){
						record.setFieldValue('custrecordatccreg_firstname',first_name);
						}
						if(last_name!=undefined){
						record.setFieldValue('custrecordatccreg_lastname',last_name);
						}
						if(job_title!=undefined){
						record.setFieldValue('custrecordatccreg_title',job_title);
						}
						if(email!=undefined){
						record.setFieldValue('custrecordatccreg_email',email);
						}
						if(shipping_address_1!=undefined){
						record.setFieldValue('custrecordatccreg_address1',shipping_address_1);
						}
						if(shipping_address_2!=undefined){
						record.setFieldValue('custrecordatccreg_address2',shipping_address_2);
						}
						if(shipping_city!=undefined){
						record.setFieldValue('custrecordatccreg_city',shipping_city);
						}
						if(shipping_zipcode!=undefined){
						record.setFieldValue('custrecordatccreg_zippostal',shipping_zipcode);
						}
						if(shipping_state!=undefined){
						record.setFieldValue('custrecordatccreg_stateprovince',shipping_state);
						}
						if(billing_address_1!=undefined){
						record.setFieldValue('custrecordatccreg_billing_address_1',billing_address_1);
						}
						if(billing_address_2!=undefined){
						record.setFieldValue('custrecordatccreg__billing_address_2',billing_address_2);
						}
						if(billing_city!=undefined){
						record.setFieldValue('custrecordatccreg_billing_city',billing_city);
						}
						if(billing_zipcode!=undefined){
						record.setFieldValue('custrecordatccreg_billing_zipcode',billing_zipcode);
						}
						if(billing_state!=undefined){
						record.setFieldValue('custrecordatccreg_billing_state',billing_state);
						}
						
						if(country!=undefined){
						record.setFieldValue('custrecordatccreg_country',country);
						}
						if(telephone_number!=undefined){
						record.setFieldValue('custrecordatccreg_phone',telephone_number);
						}
						if(fax_number!=undefined){
						record.setFieldValue('custrecordatccreg_fax',fax_number);
						}
						if(primary_market!=undefined){
							record.setFieldValue('custrecordatccreg_primrkt',primary_market);
						}
						if(language!=undefined){
							record.setFieldValue('custrecordatccreg_language',language);
						}
						if(tax_exempt!=undefined)
						{	
							record.setFieldText('custrecordatccreg_taxexempt',tax_exempt);
						}
						if(same_as_shipping!=undefined)
						{	
							if(same_as_shipping==true)
								{
							record.setFieldValue('custrecordatccreg_sameaddr',1);
								}
							else
								{
								record.setFieldValue('custrecordatccreg_sameaddr',2);
								}
						}
						if(news_letter!=undefined)
						{	
							if(news_letter=="Yes")
								{
							record.setFieldValue('custrecordatccreg_newsletter','T');
								}
							
						}
						
						
						record.setFieldValue('custrecord_atccreg_es_locationid',1);
						

						record_id= nlapiSubmitRecord(record);
						log('ATCC Registration Submitted::'+record_id);
					}
					catch(e)
					{
						log('Exception Occured while Creating Forms Data::'+e);
					}
					
				}
			
			if(record_id)
				{
			response.write('ATCC Registration Created::'+record_id);
				}
			else
				{
				response.write('Failed to Create ATCC Registration Record');
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
	nlapiLogExecution('debug', 'ATCC Registration Record', details);
}
