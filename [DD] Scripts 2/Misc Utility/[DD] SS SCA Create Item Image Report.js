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
 * Filename :: [DD] SS SCA Create Item Image Report.js
 *
 * Notes ::  Updated by Prasanna Kumar Koluguri
 * <date> : <note>
 *
 */

var last_internal_id = null,
starttime = new Date(),
report='',
report_to_be_created=false,
reschedule_flag= false;

/**
 * Create the item image report
 * @param type
 */
function scheduled(type) {

	log('<<Execution Started>>');



	/**
	 * get the value of last internal id
	 */
	last_internal_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_last_internl_id');
	log('Last Internal ID::'+last_internal_id);

	/**
	 * get the file content
	 */
	report = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_report_content');

	//Row Header in the File
	if(!report){
		report = 'ITEM INTERNAL ID,ITEM NAME ,IMAGE FILE NAME ,FOLDER';
	}
	else{
		log('This is a reschedule, Report has some content');
	}


	/**
	 * update the items with site category
	 */
	create_report(last_internal_id);

	//Report gets created only when all the items gets processed
	if(report_to_be_created){

		//Create the CSV file
		var file = nlapiCreateFile('Item_Image_Report-'+ nlapiDateToString(new Date(), 'datetimetz') + '.csv', 'PLAINTEXT', report);
		file.setFolder('1062921');
		fileId = nlapiSubmitFile(file);
		log('File Created::'+fileId);

		//Send the email
		nlapiSendEmail('76397', '76396', 'Item Image Report-'+nlapiDateToString(new Date(), 'datetimetz'), 'Hi, \n \n PFA the Item Image Report \n \n Regards,\nNetSuite Admin', null, null, null, file);
		log('<,Email Sent>>');
	}
	log('<<Execution Ended>>');	
}

/**
 * Gets all the items, images and their folders
 * @param last_internal_id
 */
function create_report(last_internal_id)
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
						paramObj.custscript_dd_last_internl_id=last_internal_id;
						paramObj.custscript_dd_report_content=report;

						//Reschedule the script
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

						//Get the folder of the file
						var folder= image_file.getFolder();

						//Get the Item Name
						var item_name=results[i].getValue('name');

						//Get the Item Internal ID
						var item_internal_id=results[i].getId();

						report+='\n'+item_internal_id+','+item_name+','+image_name+','+folder;
					}
					catch(e)
					{
						log('Exception occured while generating report::'+e);
					}


					/**
					 * Temporary condition
					 * to test for 2 records
					 */
					/*if(i==2)
						{
						last_internal_id=results[i].getId();
						log('Last InternalID INside IF::'+last_internal_id);
						reschedule_flag= true;
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
				report_to_be_created=true;
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