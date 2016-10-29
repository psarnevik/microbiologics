/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Sep 2016     pkoluguri			This gets the listid from the request and 
 * 												send the List/Record values in the Response as a JSON
 *
 */

/**
 * Main function which gets the request and processes the response
 * 
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	log('<<Execution Started>>');

	try{
		var id= request.getParameter('listid');
		log('List Id::'+id);
		if(id && id.length>1)
		{
			search_list(id);
		}
	}
	catch(e)
	{
		log('Exception Occured while getting the List values::'+e);
		//response.write("Error Occured while getting the list::"+e);
		
	}

	log('<<Execution Ended>>');
}


/**
 * This function searches the List/Record based
 * on the id received in the request object
 * 
 * @param id-- id of the custom list or custom record
 */
function search_list(id)
{
	log('Triggered>>');

	//id='customlist5';

	var filters=[];
	var columns=[];
	
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	
	
	if(id == 'country'){
		columns.push(new nlobjSearchColumn('custrecord_dd_country_display_order').setSort());
	}
	columns.push(new nlobjSearchColumn('name').setSort());
	columns.push(new nlobjSearchColumn('internalid'));
	
	
	if(id=='bio_safety_level'){
		id='customlist5';
		
	}
	if(id=='packaging_preference'){
		id='customrecord_packaginglist';
		filters.push(new nlobjSearchFilter('custrecord_pkglist_location', null, 'anyof', '1'));
	}
	if(id=='product_concentration'){
		id='customlist_formdata_prodconcentration';
	}
	if(id=='pellet_matrix'){
		id='customlistpelletmatrix';
	}
	if(id=='other_concentration_text'){
		id='customlist_othcontxt';
	}
	if(id=='country'){
		id='customrecordcountry';
	}
	if(id=='passage_of_culture'){
		id='customlist_qc_passages_fr_ref';
	}
	if(id=='frequency'){
		id='customlist_mbl_csrf_time_period';
	}
	if(id=='primary_industry'){
		id='customlist_primemkt';
	}
	if(id=='language'){
		id='customrecord_language';
		filters.push(new nlobjSearchFilter('custrecord_dd_show_on_web_forms', null, 'is', 'T'));
		filters.push(new nlobjSearchFilter('custrecord_language_location_id', null, 'anyof', '1'));
	}
	if(id=='state_billing' || id=='state_shipping' || id=='state'){
		id='customliststates';
	}
	if(id=='custrecordcontactroute'){
		id='customlist_contactdepartments';
	}


	//Search the Custom List or Custom Record

	var results= nlapiSearchRecord(id, null, filters, columns);

	var list_array=[];
	var list_object={};

	if(results && results.length>0)
	{
		for(var i=0;i<results.length;i++)
		{
			//Create a new object with each and every List value
			var eachListItem={};
			//log('Name::'+results[i].getValue('name'));
			var list_id=results[i].getValue('internalid');
			var list_name=results[i].getValue('name');

			eachListItem.value=list_id;
			eachListItem.name=list_name;
			list_array[i]=eachListItem;
		}

	}
	list_object.list=list_array;
	
	//Send the response with the List Object
	response.write(JSON.stringify(list_object));
}



/**
 * This function is used to log the script execution at certain levels
 * 
 * @param details--Holds the description of the log
 */
function log(details)
{
	nlapiLogExecution('debug', 'Get List Values', details);
}
