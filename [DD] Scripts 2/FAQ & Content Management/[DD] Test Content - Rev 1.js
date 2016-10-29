/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Sep 2016     parnevik
 *
 */

function suitelet(request, response){
	var customerId = request.getParameter('customerId');
	if(customerId){
		var customerName = nlapiLookupField('customer', customerId, 'companyname');
	}
	
	var html="";
	html += "<html>";
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
	html += "         ['2015', {v:60755, f:'$60,755'}, {v:64428, f:'$64,428'}],";
	html += "         ['2016', {v:83328, f:'$83,328'}, {v:50704, f:'$50,704'}],";
	html += "      ]);";
	html += "";
	html += "	   var options = {";
	html += "		title: 'YTD Sales Goal vs. YTD Sales',";
	html += "		titleTextStyle: {fontName: 'Roboto Condensed', fontSize: 16},";
	html += "		colors: ['red', 'blue'],";
	html += "		legend: {position: 'bottom', textStyle: {fontName: 'Roboto Condensed', fontSize: 14}},";
	html += "		vAxis: {format: 'currency', minValue: 0, textStyle: {fontName: 'Roboto'}}";
	html += "	   };";
	html += "	  ";
	html += "      var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));";
	html += "      chart.draw(data,options);";
	html += "    }";
	html += "    <\/script>";
	html += "<style>";
	html += "	div.chart {";
	html += "    height: 400;";
	html += "	width: 500;";
	html += "	}";
	html += "<\/style>";
	html += "  <\/head>";
	html += "  <body>";
	html += "    <div class=\"chart\" id=\"chart_div\"><\/div>";
	html += "  <\/body>";
	html += "<\/html>";

	response.write(html);
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}
