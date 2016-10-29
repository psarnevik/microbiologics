/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Sep 2016     pkoluguri			This will send all the supplement data related to the respective customer upon a request to this suitelet
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var customer_price_level=null,
breakout_price_search_Id=null,
baked_price_search_Id=null,
breakout_price_nr_search_Id=null,
customer_pricing_preference=null;
var responseObject = {};

/**
 * Main fucntion which gets the request and processes the response
 * 
 * @param request
 * @param response 
 */
function suitelet(request, response)
{
	log('<<Execution Started>>');


	try{
		var customer_id=request.getParameter('customerid');
		//customer_id=76400;
		log('Customer ID::'+customer_id);

		breakout_price_search_Id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_breakout_price_ss');
		log('Break Out Price Saved Search ID::'+breakout_price_search_Id);

		baked_price_search_Id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_baked_price_ss');
		log('Baked Price Saved Search ID::'+baked_price_search_Id);

		breakout_price_nr_search_Id = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_breakout_price_nr_ss');
		log('Break Out Price NO Royalty Saved Search ID::'+breakout_price_nr_search_Id);

		if(customer_id){

			var customerFields= ['custentity_pricing_preference','pricelevel'];

			var customer_record = nlapiLookupField('customer', customer_id, customerFields);

			//Get the Customer Price Level
			customer_price_level= customer_record.pricelevel;
			log('Price Level::'+customer_price_level);

			//Get the Customer Pricing Preference
			customer_pricing_preference= customer_record.custentity_pricing_preference;
			log('Pricing Preference::'+customer_pricing_preference);

			/**
			 * Check if both the Customer Price Level and Customer Pricing Preference is Present
			 */
			if(customer_price_level && customer_pricing_preference){
				generate_json_content(customer_price_level,customer_pricing_preference);

				response.write(JSON.stringify(responseObject));
			}
			else{
				response.write("There is No Price Level associated with this Customer");
			}



		}
	}
	catch(e)
	{
		log('Exception Occured::'+e);
	}

	log('<<Execution Ended>>');

}


/**
 * This function will form the json for the supplement data
 * 
 * @param customer_price_level-- hodls the price level 
 * @param customer_price_level-- holds the pricing preference
 */
function generate_json_content(customer_price_level,customer_pricing_preference) 
{

	var columns=new Array();

	var filters= new Array();

	filters.push(new nlobjSearchFilter('custrecord_price_level', 'custrecord_price_plus_royalty_item','is', customer_price_level));

	var resultsObj = null;

	var start=0,end=1000;

	var saved_search_id=null;
	

	//Break out Price Search ID
	if(customer_pricing_preference == 2){

		saved_search_id = breakout_price_search_Id;

	}
	//Baked Price Seacrh ID
	if(customer_pricing_preference == 1){

		saved_search_id = baked_price_search_Id;
	}
	//Break Out Price/No Royalty Search ID
	if(customer_pricing_preference == 3){

		saved_search_id = breakout_price_nr_search_Id;
	}

	//Load the saved search
	resultsObj = nlapiLoadSearch('item', breakout_price_search_Id);

	//add the new filters
	resultsObj.addFilters(filters);

	//Run the search Object
	var runObject=resultsObj.runSearch();

	var supplementArray = [];
	//Get the results from the saved search

	while(true){
		var results = runObject.getResults(start, end);
		if(results && results.length>0){
			log('Results Length::'+results.length);

			//Get Columns from the savedsearch
			var columns = runObject.getColumns();

			for(var i=0;i<results.length;i++)
			{

				var eachRow={};

				for(var j=0;j<columns.length;j++)
				{               		  

					if((!results[i].getText(columns[j])) || (results[i].getText(columns[j])==''))
					{
						eachRow[columns[j].getLabel()] = encodeURIComponent(results[i].getValue(columns[j]));
					}
					else
					{
						eachRow[columns[j].getLabel()] = encodeURIComponent(results[i].getText(columns[j]));
					}

				}

				supplementArray[i+start]=eachRow;

			}


			start=end;
			end=end+1000;
		}
		else
		{
			//Send the Response when all the supplement data is processed
			responseObject.Results = supplementArray;
			break;

		}
	}	



}



function add_to_json(results,columns)
{
	var supplementArray=[];
	for(var j=0;j<columns.length;j++)
	{	
		supplementArray.push(results.getValue(columns[j]));
	}

}



/**
 * This function will log all the details wherever needed
 * 
 * @param details -- holds the description of the log
 */
function log(details)
{
	nlapiLogExecution('debug', 'Generate COA from SO', details);
}