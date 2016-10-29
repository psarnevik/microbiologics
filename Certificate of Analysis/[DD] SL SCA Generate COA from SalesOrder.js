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
var folder_id=null;
var sandbox_url_prefix=null;
var production_url_prefix=null;
var generate_coa_suitelet_url=null;
var downloadable_suffix='&_xd=T&e=T';
/**
 * main function which gets the request and sends the response
 * 
 * @param request
 * @param response
 */
function suitelet(request, response)
{

	try{
	if(request.getMethod()=='GET'){	
		//loading_html();
		log('<<Execution Start>>');

		folder_id=nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_folder_id');
		log('Folder ID::'+folder_id);
		
		sandbox_url_prefix=nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sandbox_url_prefix');
		log('Sandbox URL Prefix::'+sandbox_url_prefix);
		
		production_url_prefix=nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_production_url_prefix');
		log('Production URL Prefix::'+production_url_prefix);
		
		generate_coa_suitelet_url=nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_generate_coa_suitelet_url');
		log('Generate COA Suitelet URL::'+generate_coa_suitelet_url);
		
		if(!generate_coa_suitelet_url)
			{
				log('Declare COA suitelet URL under deployments');
			}
		
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
			else
				{
					var lotnumbers=request.getParameter('lot_numbers');
					lot_number_array = lotnumbers.split(',');
					log('Lot NUmber Array from Web Form::'+lot_number_array);
					
				}
			
			
			
			/**
			 * Call the Suitelet to Generate COA
			 */
			if(lot_number_array.length>40)
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
 * @param salesorder_id-- Holds the sales order id
 */
function get_lot_numbers(salesorder_id)
{
	var columns=new Array();
	columns.push(new nlobjSearchColumn('status'));
	
	var filters= new Array();
	
	filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', salesorder_id));
	
	//Load the search
	var resultsObj = nlapiLoadSearch('itemfulfillment', 'customsearch_dd_coa_lot_search');
	
	
	// Add the filters
	resultsObj.addFilters(filters);
	
	//Run the search Object
	var runObject=resultsObj.runSearch();
	
	
	//Get the results from the saved search
	var results = runObject.getResults(0, 1000);
	if(results && results.length>0){
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
 * 
 * @param lot_number_array-- Holds the lot number list
 * @param lot_number_array-- Holds the Sales oRder ID
 */
function call_generate_coa_suitelet(lot_number_array,salesorder_id)
{
	
	log('LOT NUMBERED ARRAY WHILE TRIGGERING GENERATE COA SUITELET::'+lot_number_array);
	/**
	 * Convert the array into string and append it to the URL
	 */
	
	//var SuiteletURL=nlapiResolveURL('SUITELET', 'customscript_dd_sca_generate_coa_from_so', 'customdeploy_mbl_generate_coa_from_sales');
	
	//SuiteletURL+='&esPrintSAC=T&salesorderid='+salesorder_id+'&request_from_so=T&esLoc=1&esLotNumbers='+lot_number_array;
	//var SuiteletURL = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=143&deploy=1&compid=915960_SB3&h=2508ebc2749c3e903464&esPrintSAC=T&salesorderid='+salesorder_id+'&request_from_so=T&esLoc=1&esLotNumbers='+lot_number_array+'';
	
	var SuiteletURL =generate_coa_suitelet_url+'&esPrintSAC=T&salesorderid='+salesorder_id+'&request_from_so=T&esLoc=1&esLotNumbers='+lot_number_array;
	var responseSuitelet = nlapiRequestURL(SuiteletURL,null,null,null,null);

	
	//Get the response body
	var Body = responseSuitelet.getBody();
	var pdfcontent=Body.split(':::');

	log('PDF CONTENT[0]::'+pdfcontent[0]);
	if(pdfcontent[0]=="INVALID_LOT_NUMBERS")
		{
			var invalid_lots = pdfcontent[1];
			log('Invalid Lots::'+invalid_lots);
			displaycoa(null,invalid_lots , null);
		}
	else
		{
	
	//Get the Successful Lots
	var success_lots= pdfcontent[0];
	log('Success Lots::'+success_lots);
	
	//Get the Missing Lots
	var missing_lots = pdfcontent[1];
	log('Missing Lots::'+missing_lots);
	
	//Get the File Name
	var filename= pdfcontent[2];
	log('File Name::'+filename);
	
	//Get the XML Content for the PDF
	var content= pdfcontent[3];
	log('Content::'+content);
	
	
	//Convert from XML to PDF
	var pdfOutput = nlapiXMLToPDF(content);;
	pdfOutput.setFolder(folder_id);// This is the folder under Microbiologics>>COA
	pdfOutput.setName(filename);
	pdfOutput.setIsOnline(true);
	var file_id= nlapiSubmitFile(pdfOutput);
	log('COA Created in File Cabinet::'+file_id);
	
	var url=nlapiLoadFile(file_id).getURL();
	log('PDF URL::'+url);
	
	
	//Append the URL based on the Environment
	if(nlapiGetContext().getEnvironment()=='SANDBOX')
		{
			url=sandbox_url_prefix +url + downloadable_suffix;
		}
	else
		{
			url=production_url_prefix +url + downloadable_suffix;
		}
	
	displaycoa(success_lots, missing_lots ,url);
	
	//var responseContent= success_lots+ '***' + missing_lots + '***' + url;
	//response.write(responseContent);
	 
	
	log('COA PDF Generated');
	
		}
}

/**
 * This function will log all the details wherever needed
 * @param details
 */
function log(details)
{
	nlapiLogExecution('debug', 'Generate COA from SO', details);
}


/**
 * This is the initial loading screen
 */
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
	
	
	
	log('End Loading Sequence');
}

/**
 * This is the screen which appears once the Gerenation of COA is complete
 * 
 * @param success_lots-- Holds the successful Lots
 * @param missing_lots -- Holds the missing lots
 * @param url-- Holds the URL of the PDF file which gets downloaded
 */
function displaycoa(success_lots, missing_lots ,url)
{

	var success_lots_array=[];
	var missing_lots_array=[];
	
	if(success_lots && success_lots.length>0)
		{
	success_lots_array=success_lots.split('||');
	log('Success Lots Array::'+success_lots_array);
		}
	
	if(missing_lots && missing_lots.length>0)
	{
	missing_lots_array=missing_lots.split('||');
	log('Missing Lots Array::'+missing_lots_array);
	}
	
	var displaycoa="";
	displaycoa += "<html>";
	displaycoa += "	<head>";
	displaycoa += "<script type=\"text\/javascript\">";
	displaycoa += "            document.body.innerHTML = '';";
	displaycoa += "        <\/script>"; 
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
	
	if(success_lots_array && success_lots_array.length>0 && url)
		{
	displaycoa += "			<br><b>Certificates of analysis have been generated for the following lot numbers:<\/b>";
	displaycoa += "		<br>";
	displaycoa += "			"+parseArray(success_lots_array);
	displaycoa += "		<p>";
	displaycoa += "			<div><a class=\"button-primary-small\" href="+url+">Click here to download the Certificates of Analysis<\/a><\/div><\/p>";
	
	
		}
	displaycoa += "		<br>";
	if(missing_lots_array && missing_lots_array.length>0 &&missing_lots_array!='null' && missing_lots_array!=null)
		{
		
			displaycoa += "		<p>";
			displaycoa += "			<b>Certificates of Analysis do not exist for the following lot numbers:<\/b><br \/>";
			displaycoa += "			"+parseArray(missing_lots_array)+"<br><br>";
			displaycoa += "			Please contact support for more information.<br>";
			displaycoa += "			Phone: 320.253.1640<br>";
			displaycoa += "			USA Toll Free: 800.599.BUGS (2847)<br>";
			displaycoa += "			Email: <a href=\"mailto:info@microbiologics.com\">info@microbiologics.com<\/a><\/p>";
//			displaycoa += "			"+parseArray(missing_lots_array)+"<\/p>";
			
		}
	displaycoa += "	<\/body>";
	displaycoa += "<\/html>";
	
	response.write(displaycoa);
	
}


/**
 * Displays the screen when there are more than 40lots
 * and redirects to the other screen(where user can enter lots manually)
 */
function errorscreen()
{
	var errorscreen="";
	errorscreen += "<html>";
	errorscreen += "	<head>";
	errorscreen += "<script type=\"text\/javascript\">";
	errorscreen += "            document.body.innerHTML = '';";
	errorscreen += "        <\/script>"; 
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
	errorscreen += "			<a href=\"http:\/\/dev.microbiologics.com\/certificate-of-analysis\">Click here to navigate to the page.<\/a><\/p>";
	errorscreen += "	<\/body>";
	errorscreen += "<\/html>";
	errorscreen += "";


	response.write(errorscreen);
	
}

/**
 * Displays when there is no COA for the Lot Numbers
 */
function emptylotscreen()
{
	var emptylotscreen="";
	emptylotscreen += "<html>";
	emptylotscreen += "	<head>";
	emptylotscreen += "<script type=\"text\/javascript\">";
	emptylotscreen += "            document.body.innerHTML = '';";
	emptylotscreen += "        <\/script>"; 
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
	emptylotscreen += "			Sorry, there are no valid lots found on this order, please contact support for more information.<br>";
	emptylotscreen += "			Phone: 320.253.1640<br>";
	emptylotscreen += "			USA Toll Free: 800.599.BUGS (2847)<br>";
	emptylotscreen += "			Email: <a href=\"mailto:info@microbiologics.com\">info@microbiologics.com<\/a><\/p>";
	emptylotscreen += "	<\/body>";
	emptylotscreen += "<\/html>";
	emptylotscreen += "";

	response.write(emptylotscreen);
}


/**
 * Used to display the array elements in new line
 * @param array
 * @returns {String}
 */
function parseArray(array){
	var text = '';
	
	log(array.length);
	
	for(var i = 0; i < array.length; i++){
		
		text += array[i];
		log(array[i]);
		if( i < array.length - 1){
			//text += ', ';
			text += "<br>";
		}	
	}
	return text;
}