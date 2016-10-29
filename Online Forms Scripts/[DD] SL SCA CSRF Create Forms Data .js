/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Sep 2016     pkoluguri			Gets the user entered values from the 
 * 												CSRF form and creates the forms data custom record
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
			//log('Data Object::'+data.parent);
			//log('Data Object::'+data.child);
			log('Bio Safety Level::'+data.parent['bio-safety-level']);
			log('Packaging Preference::'+data.parent['packaging_preference']);
			log('First Name::'+data.parent['first_name']);
			log('Last Name::'+data.parent['last_name']);

			if(data.parent)
				{	
					
					
					var packaging_preference = data.parent['packaging_preference'];
					log('Packaging Preference::'+packaging_preference);
					
					var product_concentration = data.parent['product_concentration'];
					log('Product Concentration::'+product_concentration);
					
					var pellet_matrix = data.parent['pellet_matrix'];
					log('Pellet Matrix::'+pellet_matrix);
					
					var other_concentration_text = data.parent['other_concentration_text'];
					log('Other Concentration Text::'+other_concentration_text);
					
					var other_concentration_value = data.parent['other_concentration_value'];
					log('Other Concentration Value::'+other_concentration_value);
					
					var quality_control_use = data.parent['quality_control_use'];
					log('Quality Control Use::'+quality_control_use);
					
					var quality_control_details = data.parent['quality_control_details'];
					log('Quality Control Details::'+quality_control_details);
					
					var aniticipated_timeline = data.parent['anticipated_proj_time_line'];
					log('Anticipated Timeline::'+aniticipated_timeline);
					
					var first_name = data.parent['first_name'];
					log('First Name::'+first_name);
					
					var last_name = data.parent['last_name'];
					log('Last Name::'+last_name);
					
					var job_title = data.parent['job_title'];
					log('Job Title::'+job_title);
					
					var email = data.parent['email'];
					log('Email::'+email);
					
					var facility = data.parent['facility'];
					log('Facility::'+facility);
					
					var address_line1 = data.parent['address_line1'];
					log('Address Line 1::'+address_line1);
					
					var address_line2 = data.parent['address_line2'];
					log('Address Line 2::'+address_line2);
					
					var city = data.parent['city'];
					log('City::'+city);
					
					var state_province = data.parent['state'];
					log('State/Province::'+state_province);
					
					var zipcode = data.parent['zipcode'];
					log('Zip COde::'+zipcode);
					
					var country = data.parent['country'];
					log('Country::'+country);
					
					var telephone_number = data.parent['telephone_number'];
					log('Telephone Number::'+telephone_number);
					
					var agree_to_terms = data.parent['agree_to_terms'];
					log('Agree to Terms::'+agree_to_terms);
					
					try{
						//Create Forms Data Record
						var record = nlapiCreateRecord('customrecord_formsdata');
						
						log('Test Log');
						
						if(packaging_preference!=undefined){
						record.setFieldValue('custrecord_formdata_pkg_preference',packaging_preference);
						}
						if(product_concentration!=undefined){
						record.setFieldValue('custrecord_formdata_productconcentration',product_concentration);
						}
						if(pellet_matrix!=undefined){
						record.setFieldValue('custrecord_formdata_pelletmatrix',pellet_matrix);
						}
						if(other_concentration_text!=undefined){
						record.setFieldValue('custrecord_formdata_othcontxt',other_concentration_text);
						}
						if(other_concentration_value!=undefined){
						record.setFieldValue('custrecord_formdata_othconval',other_concentration_value);
						}
						if(quality_control_use!=undefined){
						record.setFieldValue('custrecord_formdata_qc_use',quality_control_use);
						}
						if(quality_control_details!=undefined){
						record.setFieldValue('custrecord_formdata_qc_use_dtls',quality_control_details);
						}
						if(aniticipated_timeline!=undefined){
						record.setFieldValue('custrecord_formdata_projtimeline',aniticipated_timeline);
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
						record.setFieldValue('custrecord_formdata_agree_terms',agree_to_terms);
						}
						if(first_name!=undefined){
						record.setFieldValue('custrecord_formdata_firstname',first_name);
						}
						if(last_name!=undefined){
						record.setFieldValue('custrecord_formdata_lastname',last_name);
						}
						if(job_title!=undefined){
						record.setFieldValue('custrecord_formdata_jobtitle',job_title);
						}
						if(facility!=undefined){
						record.setFieldValue('custrecord_formdata_company',facility);
						}
						if(email!=undefined){
						record.setFieldValue('custrecord_formdata_email',email);
						}
						if(address_line1!=undefined){
						record.setFieldValue('custrecord_formdata_addressline1',address_line1);
						}
						if(address_line2!=undefined){
						record.setFieldValue('custrecord_formdata_addressline2',address_line2);
						}
						if(city!=undefined){
						record.setFieldValue('custrecord_formdata_city',city);
						}
						if(zipcode!=undefined){
						record.setFieldValue('custrecord_formdata_zipcode',zipcode);
						}
						if(state_province!=undefined){
						record.setFieldValue('custrecord_formdata_stateprovince',state_province);
						}
						if(country!=undefined){
						record.setFieldValue('custrecord_formdata_country',country);
						}
						if(telephone_number!=undefined){
						record.setFieldValue('custrecord_formdata_phone',telephone_number);
						}
						
						record.setFieldValue('custrecord_formdata_formid',2);
						
						record.setFieldValue('custrecord_formdata_es_locationid',1);
						

						record_id= nlapiSubmitRecord(record);
						log('Forms Data Submitted::'+record_id);
					}
					catch(e)
					{
						log('Exception Occured while Creating Forms Data::'+e);
					}
					
				}
			if(data.child)
				{
		
					for(var j=0;j<data.child.length;j++)
						{
						log('Child Data::'+j+':::'+data.child[j]);
						if(data.child[j]!=null)
							{
							var item_name = data.child[j]['item_name'];
							log('Item Name::'+item_name);
							
							var passage_of_culture = data.child[j]['passage_of_culture'];
							log('Passage Of Culture::'+passage_of_culture);
							
							var medium_to_use = data.child[j]['medium_to_use'];
							log('Medium to Use::'+medium_to_use);
							
							var incubation_temperature = data.child[j]['incubation_temperature'];
							log('Incubation Temperature::'+incubation_temperature);
							
							var incubation_time = data.child[j]['incubation_time'];
							log('Incubation Time::'+incubation_time);
							
							var incubation_atmosphere = data.child[j]['incubation_atmosphere'];
							log('Incubation Atmosphere::'+incubation_atmosphere);
							
							var frequency_of_order = data.child[j]['frequency'];
							log('Frequency of Order::'+frequency_of_order);
							
							var bio_safety_level=data.child[j]['bio_safety_level'];
							log('Bio-Safety Level::'+bio_safety_level);
							
							var microorganism_name =data.child[j]['microorganism_name'];
							log('Micro Organism Name::'+microorganism_name);
							
							try{	
								//Create the Microorganism record
								var sub_record = nlapiCreateRecord('customrecord_formsdata_microorganismlist');
								sub_record.setFieldValue('custrecord_formdatasl_micoorg_name',microorganism_name);
								sub_record.setFieldValue('custrecord_formdatasl_micoorg_refno',item_name);
								sub_record.setFieldValue('custrecord_formdatasl_passages',passage_of_culture);
								sub_record.setFieldValue('custrecord_formdatasl_medium',medium_to_use);
								//sub_record.setFieldValue('custrecord_formdatasl_culture',manufacturer);
								//sub_record.setFieldValue('custrecord_cult_coll_agency_name',collection_agency);
								sub_record.setFieldValue('custrecord_formdatasl_incubtemp',incubation_temperature);
								sub_record.setFieldValue('custrecord_formdatasl_incubtime',incubation_time);
								sub_record.setFieldValue('custrecord_formdatasl_incubatmph',incubation_atmosphere);
								//sub_record.setFieldValue('custrecord_formdatasl_freqofuse',frequency_of_use);
								//sub_record.setFieldValue('custrecord_formdatasl_micoorg_freqlist',frequency_list);
								sub_record.setFieldValue('custrecord_formdatasl_freqoforder',frequency_of_order);
								sub_record.setFieldValue('custrecord_parent_reference',record_id);
								if(bio_safety_level!=undefined){
									sub_record.setFieldValue('custrecord_formdatasl_biosafety_lvl',parseInt(bio_safety_level));
									}
								var sub_record_id= nlapiSubmitRecord(sub_record);
								log('Sub Record Submitted::'+sub_record_id);
							}
							catch(e)
							{
								log('Exception Occured while Creating Microorganisms::'+e);
							}
							}
							
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
	nlapiLogExecution('debug', 'CSRF Create Forms Data', details);
}
