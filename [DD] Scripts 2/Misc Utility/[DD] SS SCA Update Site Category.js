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
 * Filename :: [DD] SS SCA Update Site Category.js
 *
 * Notes ::  Updated by Prasanna Kumar Koluguri
 * <date> : <note>
 *
 */

var last_internal_id = null,
starttime = new Date(),
reschedule_flag= false;

/**
 * This will update all the items with the Site category
 * @param type
 */
function scheduled(type) {

	log('<<Execution Started>>');


	/**
	 * get the value of last internal id
	 */
	last_internal_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_last_internal_id');


	log('Last Internal ID::'+last_internal_id);

	/**
	 * update the items with site category
	 */
	update_site_category(last_internal_id);

	log('<<Execution Ended>>');	
}

function update_site_category(last_internal_id)
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
						paramObj.custscript_dd_last_internal_id=last_internal_id;

						//Reschedule the Script
						nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), paramObj);

						break;
					}


					try{

						//Load the item record
						var item = nlapiLoadRecord(results[i].getRecordType(), results[i].getId());

						item.selectNewLineItem('sitecategory');
						item.setCurrentLineItemValue('sitecategory', 'website','3');
						item.setCurrentLineItemValue('sitecategory', 'category','-141');
						item.setCurrentLineItemValue('sitecategory', 'isdefault','T');
						item.commitLineItem('sitecategory');

						var id = nlapiSubmitRecord(item);
						log('Item Updated::'+id);
					}
					catch(e)
					{
						log('Exception occured while updating Site Category::'+e);
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
						break;
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
 * This will search the items with no site category
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

		var results = nlapiSearchRecord(null, 'customsearch_items_with_no_site_category', filters, columns);

		return results;
	}
	catch(e)
	{
		log('Exception Occured while searching::'+e+e.getDetails());
	}
}

/**
 * This logs all the details of the execution wherever mentioned
 * @param details
 */
function log(details)
{
	nlapiLogExecution('debug', 'UPDATE SITE CATEGORY', details);	
}