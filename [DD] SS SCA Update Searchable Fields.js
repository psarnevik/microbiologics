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
 * Filename :: [DD] SS SCA Update Searchable Fields.js
 *
 * Notes ::  Updated by Prasanna Kumar Koluguri
 * <date> : <note>
 *
 */

var last_internal_id = null,
starttime = new Date();


/**
 * Update the Searchable Fields on Item
 * @param type
 */
function scheduled(type) {

	log('<<Execution Started>>');

	/**
	 * get the value of last internal id
	 */
	last_internal_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_last_int_id');
	log('Last Internal ID::'+last_internal_id);

	/**
	 * Get the Saved Search ID
	 */
	saved_search_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_savedsearch_id');
	log('Saved Search ID::'+saved_search_id);


	/**
	 * update the items with sca searchable fields
	 */
	update_searchable_fields(last_internal_id,saved_search_id);


	log('<<Execution Ended>>');	
}

/**
 * Gets all the items and update the searchable fields
 * @param last_internal_id
 */
function update_searchable_fields(last_internal_id)
{
	var while_loop_break=false;

	try{

		while(true)
		{
			var results = search_items(last_internal_id,saved_search_id);


			if(results && results.length>0)
			{
				var columns = results[0].getAllColumns();

				log('Results length::'+results.length);

				for(var i=0;i<results.length;i++)
				{
					//check for reschedule :: time: 60mins :: usage limit: 10000units
					var endtime = new Date();

					if ((starttime.getTime()+3000000)<=endtime.getTime() ||parseInt(nlapiGetContext().getRemainingUsage()) <= 100)
					{
						last_internal_id= results[i-1].getId();
						log('USAGE COUNT DONE:'+ nlapiGetContext().getRemainingUsage()+'Last Internal ID::'+last_internal_id);

						while_loop_break=true;
						var paramObj=new Object();
						paramObj.custscript_dd_sca_last_int_id=last_internal_id;
						paramObj.custscript_dd_sca_savedsearch_id=saved_search_id;

						//Reschedule the script
						nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), paramObj);
						log('Script Rescheduled>>');
						//nlapiYieldScript();

						break;
					}


					try{

						var item_id = results[i].getId();
						log('Item Internal ID::'+item_id);

						var concatenated_text = results[i].getValue(columns[2]);
						log('Concatenated Text::'+concatenated_text);

						var field_to_set =[];
						var value_to_set =[];
						field_to_set.push('custitem_dd_searchable_fields');
						value_to_set.push(concatenated_text);

						//Update the Item with Searchable Fields Field
						nlapiSubmitField(results[i].getRecordType(), item_id, field_to_set, value_to_set);
						log('Item Updated::'+item_id);

					}
					catch(e)
					{
						log('Exception occured while updating Item::'+e);
					}


					/**
					 * Temporary condition
					 * to test for 2 records
					 */
					/*if(i==2)
					{
						last_internal_id=results[i].getId();
						log('Last InternalID INside IF::'+last_internal_id);
						while_loop_break=true;
						break;
					}*/

					if(i==(results.length-1))
					{
						last_internal_id=results[i].getId();
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
 * To search all the items from the saved search
 * @param last_internal_id
 * @returns
 */
function search_items(last_internal_id,saved_search_id)
{
	try{
		var filters= new Array();
		var columns = new Array();


		log('last_internal_id::'+last_internal_id);
		log('saved_search_id::'+saved_search_id);

		if(last_internal_id)
		{
			filters.push( new nlobjSearchFilter('formulanumeric', null, 'greaterthan', parseInt(last_internal_id)).setFormula('{internalid}'));
		}

		var results = nlapiSearchRecord(null, saved_search_id, filters, columns);


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
	nlapiLogExecution('debug', 'Update Searchable Fields', details);	
}