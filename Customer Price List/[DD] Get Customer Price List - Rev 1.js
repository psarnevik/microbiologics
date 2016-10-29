/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2016     parnevik
 *
 */

var startRow = '<Row>';
var cellPrefix = '<Cell><Data ss:Type="String">';
var cellSuffix = '</Data></Cell>';
var endRow = '</Row>';

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var header = '';
	header += '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'; 
	header += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
	header += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
	header += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
	header += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
	header += 'xmlns:html="http://www.w3.org/TR/REC-html40">'; 
	header += '<Worksheet ss:Name="Sheet1">';
	header += '<Table>';
	
	var footer = '</Table></Worksheet></Workbook>';
	
	var searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sl_search_test');
	var search = nlapiLoadSearch(null, searchId);
	var searchType = search.getSearchType();
	log(searchType);
	
	var columns = search.getColumns();
	var headerRow = getHeaderRow(columns);
	log(headerRow);
	
	var resultSet = search.runSearch();
	
	var dataRows = getDataRows(searchId);
	
	var xml = header + headerRow + dataRows + footer;
	log(xml);

	response.setContentType('EXCEL','TEST FILE.xls');
	response.write(nlapiEncrypt(xml, 'base64'));
	
}

function getHeaderRow(columns){
	var headerRow = startRow;

	for(var i = 0; i < columns.length; i++){
		//log(columns[i].getLabel());
		headerRow += cellPrefix;
		headerRow += columns[i].getLabel();
		headerRow += cellSuffix;
	}

	headerRow += endRow;
	return headerRow;
}

function getDataRows(searchId){
	var dataRows = '';
	var results = nlapiSearchRecord(null, searchId);
	
	if(!results){
		return dataRows;
	}
	
	log(results.length);
	var columns = results[0].getAllColumns();
	var columnLength = columns.length;
	log(columnLength);
	
	for(var i = 0; results && i < results.length; i++){
		dataRows += startRow;
		result = results[i];

		for(var j = 0; j < columnLength; j++){
			dataRows += cellPrefix;
			
			var cellValue = result.getText(columns[j]);
			if(!cellValue || cellValue == ''){
				cellValue = result.getValue(columns[j]);
			}
			
			log(cellValue);
			
			dataRows += cellValue;
			dataRows += cellSuffix;
		}
		dataRows += endRow;
	}
	log(dataRows);
	return dataRows;
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}