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
* Filename :: SS_MBL_Generate_COA_from_SO.js
*
* Notes ::  Updated by Prasanna Kumar Koluguri
* <date> : <note>
*
*/

var lot_number_array=[];
function suitelet(request, response)
{

	try{
	if(request.getMethod()=='GET')
		{
			log('<<Execution Start>>');

			
			//Get the Sales Order Id
			var salesorder_id = request.getParameter('salesorderid');
			//salesorder_id = '1395200';
			
			log('Sales Order ID::'+salesorder_id);
			
			if(salesorder_id)
				{
					//get the lot numbers into an array
					get_lot_numbers(salesorder_id);
					
					log('Lot Number Array::'+lot_number_array);
				}
			
			
			
			/**
			 * Call the Suitelet to Generate COA
			 */
			if(lot_number_array.length>1)
				{
					//response.write("LOT_NUMBER_EXCEEDED");
				
					errorscreen();
				}
			else if(lot_number_array.length==0)
			{
				//response.write("EMPTY_LOT_NUMBER");
				
				emptylotscreen();
			}
			else
			{
				call_generate_coa_suitelet(lot_number_array,salesorder_id);
				log('COA Generated>>');
				
			}
			log('<<Execution End>>');
		
		}
	}
	catch(e)
	{
		log('Exception Occured::'+e);
	}
}

/**
 * Search the Item fulfillment and get the lot Numbers
 * @param salesorder_id
 */
function get_lot_numbers(salesorder_id)
{
	var columns=new Array();
	columns.push(new nlobjSearchColumn('status'));
	
	var filters= new Array();
	
	filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', salesorder_id));
	
	//var results = nlapiSearchRecord('itemfulfillment', 'customsearch_dd_coa_lot_search', filters, columns);
	
	var resultsObj = nlapiLoadSearch('itemfulfillment', 'customsearch_dd_coa_lot_search');
	
	resultsObj.addFilters(filters);
	
	//Run the search Object
	var runObject=resultsObj.runSearch();
	
	
	//Get the results from the saved search
	var results = runObject.getResults(0, 1000);
	if(results && results.length>0)
		{
			log('Results Length::'+results.length);
			
			//Get Columns from the savedsearch
			var columns = runObject.getColumns();
			
			for(var i=0;i<results.length;i++)
				{
				//Get the Lot Numbers and add those to the array
				lot_number_array.push(results[i].getValue(columns[2]));
					
				}
		}
	
	
	
}

/**
 * Add the lot numbers from the item fulfillment
 * @param id
 */
function add_lot_numbers(id)
{
	var item_fulfillment_record= nlapiLoadRecord('itemfulfillment',id);
	
	var count= item_fulfillment_record.getLineItemCount('item');
	
	if(count>0)
		{
		log('Line Item Count::'+count);
			for(var j=1;j<=count;j++)
				{
					var lot_number= item_fulfillment_record.getLineItemValue('item', 'serialnumbers', j);
					log('LOT NUMBER::'+lot_number);
					if(lot_number)
						{
							lot_number_array.push(lot_number);
						}
					
				}
		}
}

/**
 * Function to trigger the Generate COA Suitelet
 */
function call_generate_coa_suitelet(lot_number_array,salesorder_id)
{
	
	log('LOT NUMBERED ARRAY WHILE TRIGGERING GENERATE COA SUITELET::'+lot_number_array);
	/**
	 * Convert the array into string and append it to the URL
	 */
	
	
	var SuiteletURL = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=143&deploy=1&compid=915960_SB3&h=2508ebc2749c3e903464&esPrintSAC=T&salesorderid='+salesorder_id+'&request_from_so=T&esLoc=1&esLotNumbers='+lot_number_array+'';

	/*var headerParam_Arr = new Array();
										
	headerParam_Arr['User-Agent-x'] = 'SuiteScript-Call';
	headerParam_Arr['Authorization'] = 'NLAuth nlauth_account=915960_SB3, nlauth_email=pkoluguri@deloitte.com, nlauth_signature=Netsuite@123, nlauth_role=3';
	headerParam_Arr['Content-Type'] = 'application/json';*/
	
	var responseSuitelet = nlapiRequestURL(SuiteletURL,null,null,null,null);
            
	//nlapiLogExecution('Debug','GENERATE COA','responseREST_O == '+responseSuitelet);
	//nlapiLogExecution('Debug','GENERATE COA','HTTP Code == '+responseSuitelet.getCode());
	//nlapiLogExecution('Debug','GENERATE COA','Body == '+responseSuitelet.getBody());	

	
	/**
	 * Code to be uncommented when used for SCA
	 */
	var Body = responseSuitelet.getBody();
	var pdfcontent=Body.split(':::');
	
	var success_lots= pdfcontent[0];
	var missing_lots = pdfcontent[1];
	var filename= pdfcontent[2];
	var content= pdfcontent[3];
	
	log('Success Lots::'+success_lots);
	log('Missing Lots::'+missing_lots);
	log('File Name::'+filename);
	log('Content::'+content);
	
	var pdfOutput = nlapiXMLToPDF(content);;
	pdfOutput.setFolder('1064326');// This is the folder under Microbiologics>>COA
	pdfOutput.setName(filename);
	var file_id= nlapiSubmitFile(pdfOutput);
	log('COA Created in File Cabinet::'+file_id);
	
	var url=nlapiLoadFile(file_id).getURL();
	log('PDF URL::'+url);
	
	if(nlapiGetContext().getEnvironment()=='SANDBOX')
		{
			url='https://system.sandbox.netsuite.com'+url + '&_xd=T&e=T';
		}
	else
		{
			url='https://system.na1.netsuite.com'+url + '&_xd=T&e=T';
		}
	
	displaycoa(success_lots, missing_lots ,url);
	
	//var responseContent= success_lots+ '***' + missing_lots + '***' + url;
	//response.write(responseContent);
	 
	
	log('COA PDF Generated');
	
	
}

/**
 * This function will log all the details wherever needed
 * @param details
 */
function log(details)
{
	nlapiLogExecution('debug', 'Generate COA from SO', details);
}

function loading_html()
{
	var loadinghtml="";
	loadinghtml += "<html>";
	loadinghtml += "	<head>";
	loadinghtml += "		<link href=\"https:\/\/fonts.googleapis.com\/css?family=Roboto\" rel=\"stylesheet\" type=\"text\/css\" \/>";
	loadinghtml += "		<style type=\"text\/css\">";
	loadinghtml += "body{";
	loadinghtml += "font-family: 'Roboto';";
	loadinghtml += "font-size: 14px;";
	loadinghtml += "text-align: center;";
	loadinghtml += "}		<\/style>";
	loadinghtml += "		<title><\/title>";
	loadinghtml += "	<\/head>";
	loadinghtml += "	<body>";
	loadinghtml += "		<p>";
	loadinghtml += "			<img height=\"75px\" src=\"http:\/\/dev.microbiologics.com\/images\/microbiologicsLogo.jpg\" \/><br>Generating Certificates of Analysis...<\/p>";
	loadinghtml += "		<p>";
	loadinghtml += "			<img height=\"30px\" src=\"http:\/\/dev.microbiologics.com\/images\/default.gif\" \/><\/p>";
	loadinghtml += "	<\/body>";
	loadinghtml += "<\/html>";
	loadinghtml += "";

	response.write(loadinghtml);
	
	
	
	log('End');
}


function displaycoa(success_lots, missing_lots ,url)
{

	var success_lots_array=success_lots.split('||');
	log('Success Lots Array::'+success_lots_array);
	
	var missing_lots_array=missing_lots.split('||');
	log('Missing Lots Array::'+missing_lots_array);
	
	var displaycoa="";
	displaycoa += "<html>";
	displaycoa += "	<head>";
	displaycoa += "	<link href=\"https:\/\/fonts.googleapis.com\/css?family=Roboto\" rel=\"stylesheet\" type=\"text\/css\">";
	displaycoa += "		<style>";
	displaycoa += "body{";
	displaycoa += "font-family: 'Roboto';";
	displaycoa += "font-size: 14px;";
	displaycoa += "text-align: center;";
	displaycoa += "}";
	displaycoa += "div{";
	displaycoa += "font-size: 16px;";
	displaycoa += "font-weight: bold;";
	displaycoa += "}";
	displaycoa += "";
	displaycoa += ".button-primary-small";
	displaycoa += "{";
	displaycoa += "            color: #FFFFFF;";
	displaycoa += "font-weight: 400;";
	displaycoa += "display: inline-block;";
	displaycoa += "border: 1px solid #004FA3;";
	displaycoa += "padding: 10px 20px;";
	displaycoa += "background: #004FA3;";
	displaycoa += "text-decoration: none;";
	displaycoa += "cursor: pointer;";
	displaycoa += "margin: 0;";
	displaycoa += "text-align: center;";
	displaycoa += "font-size: 15px;";
	displaycoa += "}";
	displaycoa += "";
	displaycoa += "";
	displaycoa += "<\/style>";
	displaycoa += "		<title><\/title>";
	displaycoa += "	<\/head>";
	displaycoa += "	<body>";
	displaycoa += "		<img height=\"75px\" src=\"http:\/\/dev.microbiologics.com\/images\/microbiologicsLogo.jpg\" >";
	displaycoa += "			<br><b>Certificates of analysis have been generated for the following lot numbers:<\/b>";
	displaycoa += "		<br>";
	displaycoa += "			["+success_lots_array+"]";
	displaycoa += "		<p>";
	displaycoa += "			<div><a class=\"button-primary-small\" href="+url+">Click here to download the Certificates of Analysis<\/a><\/div><\/p>";
	displaycoa += "		<br>";
	displaycoa += "		<p>";
	
	if(!missing_lots_array && missing_lots_array.length>0)
		{
			displaycoa += "			<b>Certificates of Analysis do not exist for the following lot numbers:<\/b><br \/>";
			displaycoa += "			(Please contact support for more information.)<br>";
			displaycoa += "			["+missing_lots_array+"]<\/p>";
		}
	displaycoa += "	<\/body>";
	displaycoa += "<\/html>";
	
	response.write(displaycoa);
	
}

function errorscreen()
{
	var errorscreen="";
	errorscreen += "<html>";
	errorscreen += "	<head>";
	errorscreen += "		<link href=\"https:\/\/fonts.googleapis.com\/css?family=Roboto\" rel=\"stylesheet\" type=\"text\/css\" \/>";
	errorscreen += "		<style type=\"text\/css\">";
	errorscreen += "body{";
	errorscreen += "font-family: 'Roboto';";
	errorscreen += "font-size: 14px;";
	errorscreen += "text-align: center;";
	errorscreen += "}";
	errorscreen += "div{";
	errorscreen += "font-family: 'Roboto';";
	errorscreen += "font-size: 14px;";
	errorscreen += "}		<\/style>";
	errorscreen += "		<title><\/title>";
	errorscreen += "	<\/head>";
	errorscreen += "	<body>";
	errorscreen += "		<p>";
	errorscreen += "			&nbsp;<\/p>";
	errorscreen += "		<p>";
	errorscreen += "			<img height=\"75px\" src=\"http:\/\/dev.microbiologics.com\/images\/microbiologicsLogo.jpg\" \/><\/p>";
	errorscreen += "		<p>";
	errorscreen += "			More than 40 lots with Certificates of Analysis have been found. <br>Please use our standalone Certificate of Analysis generation page.<\/p>";
	errorscreen += "		<p>";
	errorscreen += "			<a href=\"http:\/\/www.microbiologics.com\/site\/certificate.html\">Click here to navigate to the page.<\/a><\/p>";
	errorscreen += "	<\/body>";
	errorscreen += "<\/html>";
	errorscreen += "";


	response.write(errorscreen);
	
}


function emptylotscreen()
{
	var emptylotscreen="";
	emptylotscreen += "<html>";
	emptylotscreen += "	<head>";
	emptylotscreen += "		<link href=\"https:\/\/fonts.googleapis.com\/css?family=Roboto\" rel=\"stylesheet\" type=\"text\/css\" \/>";
	emptylotscreen += "		<style type=\"text\/css\">";
	emptylotscreen += "body{";
	emptylotscreen += "font-family: 'Roboto';";
	emptylotscreen += "font-size: 14px;";
	emptylotscreen += "text-align: center;";
	emptylotscreen += "}";
	emptylotscreen += "div{";
	emptylotscreen += "font-family: 'Roboto';";
	emptylotscreen += "font-size: 14px;";
	emptylotscreen += "}		<\/style>";
	emptylotscreen += "		<title><\/title>";
	emptylotscreen += "	<\/head>";
	emptylotscreen += "	<body>";
	emptylotscreen += "		<p>";
	emptylotscreen += "			&nbsp;<\/p>";
	emptylotscreen += "		<p>";
	emptylotscreen += "			<img height=\"75px\" src=\"http:\/\/dev.microbiologics.com\/images\/microbiologicsLogo.jpg\" \/><\/p>";
	emptylotscreen += "		<p>";
	emptylotscreen += "			Sorry, There are no valid lots found on this order. <br> (Please contact support for more information.)<\/p>";
	emptylotscreen += "	<\/body>";
	emptylotscreen += "<\/html>";
	emptylotscreen += "";

	response.write(emptylotscreen);
}