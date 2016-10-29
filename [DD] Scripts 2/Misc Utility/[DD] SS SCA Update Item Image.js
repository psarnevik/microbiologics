/**
 * Copyright (c) 2016 Deloitte Consulting.
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Deloitte ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Deloitte.
 *
 * 
 * Project :: Microbiologics SCA
 * Filename :: [DD] SS SCA Update Item Image.js
 *
 * Notes ::  Updated by Prasanna Kumar Koluguri
 * <date> : <note>
 *
 */


var last_internal_id = null,
starttime = new Date(),
reschedule_flag= false;
/**
 * This is the main function which executes upon run
 * @param type
 */
function scheduled(type) {

	log('<<Execution Started>>');


	/**
	 * get the value of last internal id
	 */
	last_internal_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_last_intern_id');
	log('Last Internal ID::'+last_internal_id);


	copy_item_images(last_internal_id);

	log('<<Execution Ended>>');	
}


/**
 * Copies the item images from one folder to another
 * and updates the image identifier as well
 */
function copy_item_images(last_internal_id)
{
	var while_loop_break=false;

	try{

		while(true)
		{
			var results = search_items(last_internal_id);

			if(results && results.length>0)
			{

				log('Results length::'+results.length);

				for(var i=0;i<results.length;i++)
				{
					//check for reschedule :: time: 60mins :: usage limit: 10000units
					var endtime = new Date();

					if ((starttime.getTime()+3000000)<=endtime.getTime() ||parseInt(nlapiGetContext().getRemainingUsage()) <= 100)
					{
						last_internal_id= results[i-1].getId();
						log('USAGE COUNT GONE:'+ nlapiGetContext().getRemainingUsage()+'Last Internal ID::'+last_internal_id);
						reschedule_flag= true;
						while_loop_break=true;
						var paramObj=new Object();
						paramObj.custscript_dd_last_intern_id=last_internal_id;


						nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), paramObj);
						log('Script Rescheduled>>');
						//nlapiYieldScript();

						break;
					}


					try{

						//Load the Image File
						var image_file=nlapiLoadFile(results[i].getValue('storedisplayimage'));

						//Get the File Name
						var image_name= image_file.getName();
						log('Image Name::'+image_name);

						var name=image_name.substring(0, image_name.length-4);

						//Get the Product Line
						var product_line = results[i].getText('custitem18');
						//log('Product Line::'+product_line);

						//Get the file content
						var image_content=image_file.getValue();

						var new_image = nlapiCreateFile(name+'_image1.jpg', image_file.getType(), image_content);

						new_image.setFolder('1062809');
						var id = nlapiSubmitFile(new_image);
						log('<<New Image Created>>::'+id);

						//Update the Item with Image Identifier
						var field_array=[];
						var value_array=[];

						field_array.push('custitem_dd_image_identifier');
						value_array.push(name);

						try{
							nlapiSubmitField(results[i].getRecordType(), results[i].getId(), field_array, value_array);
							log('Image Identifier Updated::'+results[i].getId());
						}
						catch(e)
						{

						}

					}
					catch(e)
					{
						log('Exception occured while copying images::'+e);
					}


					/**
					 * Temporary condition
					 * to test for 2 records
					 */
					/*if(i==2)
						{

							while_loop_break=true;
							break;
						}*/

					if(i==(results.length-1))
					{
						last_internal_id=results[i].getId();
						//while_loop_break=true;
						//break;
					}

				}

				if(while_loop_break)
				{
					break;
				}
			}
			else
			{
				log('<<No More Results found>>');
				break;
			}
		}

	}
	catch(e)
	{
		log('Exception Occured::'+e);
	}

}

/**
 * To search all the items with store display images
 * @param last_internal_id
 * @returns
 */
function search_items(last_internal_id)
{
	try{
		var filters= new Array();
		var columns = new Array();


		log('lastinternalid::'+last_internal_id);
		if(last_internal_id)
		{
			filters.push( new nlobjSearchFilter('formulanumeric', null, 'greaterthan', parseInt(last_internal_id)).setFormula('{internalid}'));
		}

		var results = nlapiSearchRecord(null, 'customsearch_items_store_display_images', filters, columns);

		return results;
	}
	catch(e)
	{
		log('Exception Occured while searching::'+e+e.getDetails());
	}
}

/**
 * To log the details
 * @param details
 */
function log(details)
{
	nlapiLogExecution('debug', 'Item Image Report', details);	
}