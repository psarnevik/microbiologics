/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Sep 2016     parnevik
 *
 */

var startRow = '<Row>';
var cellPrefix = '<Cell><Data ss:Type="String">';
var cellSuffix = '</Data></Cell>';
var endRow = '</Row>';

function scheduledScript(type){
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
	
	var searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_doc_saved_search');
	var search = nlapiLoadSearch(null, searchId);
	var searchType = search.getSearchType();
	log(searchType);
	
	var columns = search.getColumns();
	var headerRow = getHeaderRow(columns);
	log(headerRow);
	
	var resultSet = search.runSearch();
	
	var dataRows = getDataRows(searchId);
	
	var xml = header + headerRow + dataRows + footer;
	//log(xml);

	var file = nlapiCreateFile('TEST FILE.xls','EXCEL',nlapiEncrypt(xml, 'base64'));
	file.setFolder(1063995);
	nlapiSubmitFile(file);
	
	
}

function getHeaderRow(columns){
	var headerRow = startRow;

	for(var i = 0; i < columns.length; i++){
		headerRow += cellPrefix;
		headerRow += columns[i].getLabel();
		//headerRow += columns[i].getName();
		headerRow += cellSuffix;
	}

	//Adds column to denote whether the file is inactive or not
	headerRow += cellPrefix;
	headerRow += 'Is Inactive';
	headerRow += cellSuffix;
	
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

		//Checks to see whether the current file is inactive and logs the result in the last column of the row
		var fileId = result.getValue(columns[ (columnLength - 1) ]);
		var fileLoaded = nlapiLoadFile(fileId);
		var isInactive = fileLoaded.isInactive();
		
		//Creates cell for Is Inactive field
		dataRows += cellPrefix;
		dataRows += isInactive;
		dataRows += cellSuffix;
		
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