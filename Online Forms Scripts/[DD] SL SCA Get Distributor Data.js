/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Sep 2016     pkoluguri			This will search the distributor details and send it as a JSON
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	
	log('<<Execution Start>>');
	
	
	var search_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_locate_distributor_search');
	log('Search ID::'+search_id);
	
	var form_type = request.getParameter('regtype');
	log('Form Type::'+form_type);
	
	
	var country_id = request.getParameter('country');
	log('Country ID::'+country_id);
	
	var location_id = request.getParameter('locationid');
	log('Location ID::'+location_id);
	
	var distributor_object={};
	
	var distrubutor_list=[];
	
	var results = search_customer(country_id,search_id);
	
	if(results && results.length>0)
	{
		
		var columns = results[0].getAllColumns();
		
		for(var k=0;k<results.length;k++)
			{
				var result = results[k];
			
				var each_distributor={};
				
				each_distributor.entityid = getColValue(result,columns[0]);
				each_distributor.city = getColValue(result,columns[4]);
				each_distributor.state = getColValue(result,columns[5]);
				each_distributor.zip = getColValue(result,columns[6]);
				each_distributor.country = getColValue(result,columns[7]);
				each_distributor.phone = getColValue(result,columns[8]);
				each_distributor.fax = getColValue(result,columns[9]);
				each_distributor.email = getColValue(result,columns[10]);
				each_distributor.url = getColValue(result,columns[11]);
				each_distributor.id = result.getId();
				
				distrubutor_list[k]=each_distributor;
			
			}
		
		
	
	}
	distributor_object.data=distrubutor_list;
	
	response.write(JSON.stringify(distributor_object));

	
	log('<<Execution End>>');
}

function search_customer(country_id,search_id)
{
	/*
	 * Fetch the distributors based on the country ID sent to the suitelet
	 */
	
	//Add the country ID to the search as a filter on the sales territory field from the customer-distributor record
	var filters = [];
	filters.push(new nlobjSearchFilter('custentity45', null, 'anyof', country_id));
	
	var results = nlapiSearchRecord('customer', search_id, filters);
	
	if(results && results.length>0)
		{
			log('Results Length::'+results.length);
		
		}
	return results;

}


function sortByWebListName(result1 , result2)
{
	var entityid1 = result1.getValue( 'custentity50' );
	var entityid2 = result2.getValue( 'custentity50' );

	if((entityid1==null || entityid1=='')||(entityid2==null || entityid2==''))
	{
		return 0;
	}
	
	if(entityid1 == entityid2) {return 0;}
	return (entityid1 < entityid2) ? -1 : 1;
}


function getColValue(result, column)
{
	var value = result.getText(column);
	
	if(value == '' || !value){
		value = result.getValue(column);
	}
	return value;
}

/**
 * This function is used to log the script execution at certain levels
 * 
 * @param details--Holds the description of the log
 */
function log(details)
{
	nlapiLogExecution('debug', 'SL SCA Select Dirtributor', details);
}
