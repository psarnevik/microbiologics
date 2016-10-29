/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Sep 2016     aramar			This suite let to display distributor report graph.
 * 2.00		  27 Sep 2016	  aramar			Included HTML table and bar charts for the distributor report graph.
 * 3.00		  28 Sep 2016     aramar            Adjusted the HTML table.			
 *
 */
/*
 * This suite let to display distributor report graph.
 */
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {HTML} HTML output is written via response object
 */
var FirstYear	  = '';
var SecondYear	  = '';
function suitelet(request, response){
	var headLine="";
	headLine += "<h3 class=\"headline\">Sales Dashboard<\/h3>";


	
	try{
//		Get the Customer ID from the parameter	
		var customerId 					= request.getParameter('customerId');
//		Execute only if the customer id is present
		if(customerId){
			var context 				= nlapiGetContext();
			// Fetch the script parameter for the "Distributor Report"saved search
			var Distributor_ReportSearchID= context.getSetting('SCRIPT', 'custscript_dd_portal_graph_search');
			var search 		 			= nlapiLoadSearch(null, Distributor_ReportSearchID);
			var columns 	 			= search.getColumns();
//			Fetch the year from the columns			
			FirstYear 					= columns[2].getLabel();
			FirstYear					= FirstYear.substring(0, 4);
			FirstYear =parseInt(FirstYear);
			log('FirstYear='+FirstYear);
			SecondYear 					= columns[3].getLabel();
			SecondYear					= SecondYear.substring(0, 4);
			SecondYear =parseInt(SecondYear);
			log('SecondYear='+SecondYear);
			//Adding filters to the search
			var Arrfilters 				= new Array();
			Arrfilters.push(new nlobjSearchFilter('entity', null,'is', customerId));
			// Get all the search results in an Array	
			var searchResults = nlapiSearchRecord('transaction',Distributor_ReportSearchID, Arrfilters);
			var Allcolumns = searchResults[0].getAllColumns();
			if(searchResults==null || searchResults=='' ){
				return response.write('There is not data available for this Customer');
			}
			/*
			 * Loop through the search results to create a Distributor object for each result that is stored in the distributor list array
			 */
			var result 						= searchResults[0];
			var FirstYear_Sales_Goal 		= result.getValue(Allcolumns[2]);
			var SecondYear_Sales_Goal 		= result.getValue(Allcolumns[3]);
			var FirstYear_Sales 			= result.getValue(Allcolumns[4]);
			var SecondYear_Sales 			= result.getValue(Allcolumns[5]);
//			Get First Year Data's for the table 
			var FirstYear_YTD_Goal 			= result.getValue(Allcolumns[6]);
			var FirstYear_Percent_achived 	= result.getValue(Allcolumns[8]);
			var FirstYear_YEND_Sales_Goal 	= result.getValue(Allcolumns[10]);
			var FirstYear_Sales_YEND_Goal 	= result.getValue(Allcolumns[12]);
			var FirstYear_Percent_YEND_Goal = result.getValue(Allcolumns[14]);
			var FirstYear_YEND_Sales 		= result.getValue(Allcolumns[16]);
//			Get Second Year Data's for the table 
			var SecondYear_YTD_Goal 		= result.getValue(Allcolumns[7]);
			var SecondYear_Percent_achived 	= result.getValue(Allcolumns[9]);
			var SecondYear_YEND_Sales_Goal 	= result.getValue(Allcolumns[11]);
			var SecondYear_Sales_YEND_Goal 	= result.getValue(Allcolumns[13]);
			var SecondYear_Percent_YEND_Goal= result.getValue(Allcolumns[15]);
//			Create the HTML content for the Distributor output in bar chart
			var html="";
			html += "  <head>";
			html += "    <link href=\"https:\/\/fonts.googleapis.com\/css?family=Roboto+Condensed\" rel=\"stylesheet\" type=\"text\/css\" \/>	";
			html += "	<script type=\"text\/javascript\" src=\"https:\/\/www.gstatic.com\/charts\/loader.js\"><\/script>";
			html += "    <script type=\"text\/javascript\">";
			html += "google.charts.load('current', {packages: ['corechart', 'bar']});";
			html += "google.charts.setOnLoadCallback(drawAxisTickColors);";
			html += "";
			html += "function drawAxisTickColors() {";
			html += "      var data = google.visualization.arrayToDataTable([";
			html += "         ['Year', 'YTD Sales Goal', 'YTD Sales'],";
			html += "['"+FirstYear+"', {v:"+FirstYear_Sales_Goal+", f:'$"+FirstYear_Sales_Goal+"'}, {v:"+FirstYear_Sales+", f:'$"+FirstYear_Sales+"'}],";
			html += "['"+SecondYear+"', {v:"+SecondYear_Sales_Goal+", f:'$"+SecondYear_Sales_Goal+"'}, {v:"+SecondYear_Sales+", f:'$"+SecondYear_Sales+"'}],";
			html += "      ]);";
			html += "";
			html += "	   var options = {";
			html += "		title: 'YTD Sales Goal vs. YTD Sales',";
			html += "		titleTextStyle: {fontName: 'Roboto Condensed', fontSize: 16},";
			html += "		colors: ['#FF1033', '#004FA3'],";
			html += "		legend: {position: 'bottom', textStyle: {fontName: 'Roboto Condensed', fontSize: 14}},";
			html += "		width: 500,";
			html += " 		height: 400,";
			html += "		vAxis: {format: 'currency', minValue: 0, textStyle: {fontName: 'Roboto'}}";
			html += "	   };";
			html += "	  ";
			html += "      var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));";
			html += "      chart.draw(data,options);";
			html += "    }";
			html += "    <\/script>";
			html += "<style>";
			html += ".headline {";
			html += "    font-size: 24px;";
			html += "    font-family: \"Roboto Condensed\";";
			html += "    padding-bottom: 0;";
			html += "    margin-bottom: 0;";
			html += "    font-weight: bold;";
			html += "}";
			html += "	div.chart {";
			html += "    height: 100";
			html += "	width: 100;";
			html += "	}";
			html += "<\/style>";
			html += "  <\/head>";
//			Create the HTML table for the Distributor output in table
			Report =Createtable(html,FirstYear,SecondYear,FirstYear_Sales_Goal,SecondYear_Sales_Goal,FirstYear_Sales,SecondYear_Sales,FirstYear_YTD_Goal,SecondYear_YTD_Goal,FirstYear_Percent_achived,SecondYear_Percent_achived,FirstYear_YEND_Sales_Goal,SecondYear_YEND_Sales_Goal,FirstYear_Sales_YEND_Goal,SecondYear_Sales_YEND_Goal,FirstYear_Percent_YEND_Goal,SecondYear_Percent_YEND_Goal,FirstYear_YEND_Sales);
//			Display the HTML ouptput in response		
			response.write(Report);
		}
	} catch (e) {
		nlapiLogExecution('Error', 'DD_SL_Distributor_Report ', 'Error  during DD_SL_Distributor_Report - ' + e.message);
	}
}
/**
 * This function will log all the details wherever needed
 * @param{string}- details
 * @param{string}- error
 */
function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}
/*
 * This function to create the table
 */
/**
 * This function will create the to create the table
 * @param{string}- details of distributor report
 * return {HTML}- html content
 */
function Createtable(html,FirstYear,SecondYear,FirstYear_Sales_Goal,SecondYear_Sales_Goal,FirstYear_Sales,SecondYear_Sales,FirstYear_YTD_Goal,SecondYear_YTD_Goal,FirstYear_Percent_achived,SecondYear_Percent_achived,FirstYear_YEND_Sales_Goal,SecondYear_YEND_Sales_Goal,FirstYear_Sales_YEND_Goal,SecondYear_Sales_YEND_Goal,FirstYear_Percent_YEND_Goal,SecondYear_Percent_YEND_Goal,FirstYear_YEND_Sales)
{var strVar="";
strVar += "<html>";
strVar += "<h3 class=\"headline\">Sales Dashboard<\/h3>";
strVar += html;
strVar += "<body>";
strVar += "    <style>";
strVar += "        body {";
//strVar += "            padding-right:100%;";
strVar += "            height:410px;";
strVar += "        }";
strVar += "        table {";
strVar += "            border-collapse: collapse;";
strVar += "            width: 100%;";
//strVar += "            border-top: 2px solid #C6D9F1;";
strVar += "            padding:10px;";
strVar += "			   font-family:'Roboto Condensed', sans-serif; ";
strVar += "        }";
strVar += "        ";
strVar += "        .row1 {";
strVar += "            border-bottom: none;";
strVar += "            background-color: #C6D9F1;";
strVar += "        }";
strVar += "        ";
strVar += "        .row3 {";
strVar += "            background-color: #C6D9F1;";
strVar += "        }";
strVar += "        ";
strVar += "        tr {";
//strVar += "            border-bottom: 2px solid #C6D9F1;";
strVar += "        }";
strVar += "        ";
strVar += "        th {";
strVar += "            text-align: left;";
strVar += "        }";
strVar += "         ";
strVar += "    <\/style>";

strVar += "    <table width = \"100%\">";
strVar += "    <tr>";
strVar += "    <td width = \"50%\">";
strVar += "    <div class=\"chart\" id=\"chart_div\"><\/div>";
strVar += "    <\/td>";
strVar += "    <td width = \"50%\">";

strVar += "    <table cellpadding=\"5\">";
strVar += "        <thead>";
strVar += "            <tr class=\"main\">";
strVar += "                <th> <\/th>";
strVar += "                <th><u>"+FirstYear+"<\/u><\/th>";
strVar += "                <th><u>"+SecondYear+"<\/u><\/th>";
strVar += "            <\/tr>";
strVar += "        <\/thead>";
strVar += "        <tbody>";
strVar += "            <tr>";
strVar += "                <tr class=\"row1\">";
 strVar += "                    <td class=\"clr\">YTD Sales Goal<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(FirstYear_Sales_Goal)+"<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(SecondYear_Sales_Goal)+"<\/td>";
strVar += "                <\/tr>";
strVar += "                <tr class=\"row1\">";
strVar += "                    <td>YTD Sales<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(FirstYear_Sales)+"<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(SecondYear_Sales)+"<\/td>";
strVar += "                <\/tr>";
strVar += "                <tr class=\"row1\">";
strVar += "                    <td>Sales Above\/Below YTD Goal<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(FirstYear_YTD_Goal)+"<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(SecondYear_YTD_Goal)+"<\/td>";
strVar += "                <\/tr>";
strVar += "                <tr class=\"row3\">";
strVar += "                    <td>% of YTD Goal Achieved <\/td>";
strVar += "                    <td>"+FirstYear_Percent_achived+"<\/td>";
strVar += "                    <td>"+SecondYear_Percent_achived+"<\/td>";
strVar += "                <\/tr>";
strVar += "                <tr>";
strVar += "                    <td>Year-End Sales goal<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(FirstYear_YEND_Sales_Goal)+"<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(SecondYear_YEND_Sales_Goal)+"<\/td>";
strVar += "                <\/tr>";
strVar += "                <tr>";
strVar += "                    <td>Sales to Year-End goal<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(FirstYear_Sales_YEND_Goal)+"<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(SecondYear_Sales_YEND_Goal)+"<\/td>";
strVar += "                <\/tr>";
strVar += "                <tr>";
strVar += "                    <td>% of Year-End Goal Achieved <\/td>";
strVar += "                    <td>"+FirstYear_Percent_YEND_Goal+"<\/td>";
strVar += "                    <td>"+SecondYear_Percent_YEND_Goal+"<\/td>";
strVar += "                <\/tr>";
strVar += "                <tr>";
strVar += "                    <td>Year-End Sales<\/td>";
strVar += "                    <td>$"+commaSeparateNumber(FirstYear_YEND_Sales)+"<\/td>";
strVar += "                    <td>-<\/td>";
strVar += "                <\/tr>";
strVar += "        <\/tbody>";
strVar += "    <\/table>";
strVar += "    <\/td>";
strVar += "    <\/tr>";
strVar += "        <\/table>";
strVar += "<\/body>";
strVar += "";
strVar += "<\/html>";
return strVar;
}
/**
 * This function to get the currency format from the string
 * @param{string}- details of distributor report
 * return {currency}- Value
 */
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
        val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
      }
      return val;
    }