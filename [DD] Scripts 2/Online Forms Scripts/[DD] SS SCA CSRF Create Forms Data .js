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
function suitelet(request, response)
{
	log('<Execution Started>>');
	
	if(request.getMethod()=="GET")
		{
			var data= request.getParameter('dataIn');
			log('Data Object::'+data.parent);
			log('Bio Safety Level::'+data.parent['bio-safety-level']);
			log('Packaging Preference::'+data.parent['packaging_preference']);
			log('First Name::'+data.parent['first_name']);
			log('Last Name::'+data.parent['last_name']);

			if(data.parent)
				{	
					var bio_safety_level=list.body['bio-safety-level'];
					log('Bio-Safety Level::'+bio_safety_level);
					
					var packaging_preference = list.body['packaging_preference'];
					log('Packaging Preference::'+packaging_preference);
					
					var product_concentration = list.body['product_concentration'];
					log('Product Concentration::'+product_concentration);
					
					var pellet_matrix = list.body['pellet_matrix'];
					log('Pellet Matrix::'+pellet_matrix);
					
					var other_concentration_text = list.body['other_concentration_text'];
					log('Other Concentration Text::'+other_concentration_text);
					
					var other_concentration_value = list.body['other_concentration_value'];
					log('Other Concentration Value::'+other_concentration_value);
					
					var quality_control_use = list.body['quality_control_use'];
					log('Quality Control Use::'+quality_control_use);
					
					var quality_control_details = list.body['quality_control_details'];
					log('Quality Control Details::'+quality_control_details);
					
					var aniticipated_timeline = list.body['aniticipated_timeline'];
					log('Anticipated Timeline::'+aniticipated_timeline);
					
					var first_name = list.body['first_name'];
					log('First Name::'+first_name);
					
					var last_name = list.body['last_name'];
					log('Last Name::'+last_name);
					
					var job_title = list.body['job_title'];
					log('Job Title::'+job_title);
					
					var email = list.body['email'];
					log('Email::'+email);
					
					var facility = list.body['facility'];
					log('Facility::'+facility);
					
					var address_line1 = list.body['address_line1'];
					log('Address Line 1::'+address_line1);
					
					var address_line2 = list.body['address_line2'];
					log('Address Line 2::'+address_line2);
					
					var city = list.body['city'];
					log('City::'+city);
					
					var state_province = list.body['state_province'];
					log('State/Province::'+state_province);
					
					var zipcode = list.body['zipcode'];
					log('Zip COde::'+zipcode);
					
					var country = list.body['country'];
					log('Country::'+country);
					
					var telephone_number = list.body['telephone_number'];
					log('Telephone Number::'+telephone_number);
					
					var fax_number = list.body['fax_number'];
					log('Fax Number::'+fax_number);
					
					var agree_to_terms = list.body['agree_to_terms'];
					log('Agree to Terms::'+agree_to_terms);
					
					try{
						//Create Forms Data Record
						var record = nlapiCreateRecord('customrecord_formsdata');
						record.setFieldValue('custrecord_formdata_biosafety_lvl',biosafetylevel);
						record.setFieldValue('custrecord_formdata_pkg_preference',packaging_preference);
						record.setFieldValue('custrecord_formdata_productconcentration',product_concentration);
						record.setFieldValue('custrecord_formdata_pelletmatrix',pellet_matrix);
						record.setFieldValue('custrecord_formdata_othcontxt',other_concentration_text);
						if(other_concentration_value!='{Enter Value Here}')
							{
						record.setFieldValue('custrecord_formdata_othconval',other_concentration_value);
							}
						else
							{
							record.setFieldValue('custrecord_formdata_othconval',null);
							}
						record.setFieldValue('custrecord_formdata_qc_use',quality_control_use);
						record.setFieldValue('custrecord_formdata_qc_use_dtls',quality_control_details);
						record.setFieldValue('custrecord_formdata_projtimeline',project_timeline);
						record.setFieldValue('custrecord_formdata_agree_terms',agree_to_terms);
						record.setFieldValue('custrecord_formdata_firstname',first_name);
						record.setFieldValue('custrecord_formdata_lastname',last_name);
						record.setFieldValue('custrecord_formdata_jobtitle',job_title);
						record.setFieldValue('custrecord_formdata_company',facility);
						record.setFieldValue('custrecord_formdata_email',email);
						record.setFieldValue('custrecord_formdata_addressline1',address_line1);
						record.setFieldValue('custrecord_formdata_addressline2',address_line2);
						record.setFieldValue('custrecord_formdata_city',city);
						record.setFieldValue('custrecord_formdata_zipcode',zipcode);
						record.setFieldValue('custrecord_formdata_stateprovince',state);
						record.setFieldValue('custrecord_formdata_country',country);
						record.setFieldValue('custrecord_formdata_phone',phone);
						record.setFieldValue('custrecord_formdata_fax',fax);
						record.setFieldValue('custrecord_formdata_formid',form_id);
						record.setFieldValue('custrecord_formdata_es_locationid',location_id);
						

						record_id= nlapiSubmitRecord(record);
						log('Forms Data Submitted::'+record_id);
					}
					catch(e)
					{
						log('Exception Occured while Creating Forms Data::'+e);
					}
					
				}
			if(list.child)
				{
		
					for(var j=0;j<list.child.length;j++)
						{
							var item_name = list.child[j]['item_name'];
							log('Item Name::'+item_name);
							
							var passage_of_culture = list.child[j]['passage_of_culture'];
							log('Passage Of Culture::'+passage_of_culture);
							
							var medium_to_use = list.child[j]['medium_to_use'];
							log('Medium to Use::'+medium_to_use);
							
							var incubation_temperature = list.child[j]['incubation_temperature'];
							log('Incubation Temperature::'+incubation_temperature);
							
							var incubation_time = list.child[j]['incubation_time'];
							log('Incubation Time::'+incubation_time);
							
							var incubation_atmosphere = list.child[j]['incubation_atmosphere'];
							log('Incubation Atmosphere::'+incubation_atmosphere);
							
							var frequency_of_order = list.child[j]['frequency_of_order'];
							log('Frequency of Order::'+frequency_of_order);
							
							try{	
								//Create the Microorganism record
								var sub_record = nlapiCreateRecord('customrecord_formsdata_microorganismlist');
								sub_record.setFieldValue('custrecord_formdatasl_micoorg_name',item_name);
								//sub_record.setFieldValue('custrecord_formdatasl_micoorg_refno',microorganism_ref);
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
	else
		{
		log('Request method::'+request.getMethod());
		var data= request.getParameter('dataIn');
		log('Data Object::'+data.parent);
		log('Bio Safety Level::'+data.parent['bio-safety-level']);
		log('Packaging Preference::'+data.parent['packaging_preference']);
		log('First Name::'+data.parent['first_name']);
		log('Last Name::'+data.parent['last_name']);
		
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
