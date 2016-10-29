/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Aug 2016     parnevik
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function setFieldValues(type){
	var form = nlapiGetFieldValue('customform');
	var location = nlapiGetFieldValue('location');
	
	var infoForm = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_info_item_form');
	var locationParam = nlapiGetContext().getSetting('SCRIPT','custscript_dd_st_cloud_location');
	
	//If form is not the information item form, then exit the script
	if(form != infoForm){
		log('Item form does not match script form parameter, exiting script.');
		return;
	}
	//If the item's location is not the location parameter (e.g., St. Cloud : Warehouse), then exit the script
	if(location != locationParam){
		log('Item location does not match script parameter location, exiting script.');
		return;
	}

	var hasCategory = hasWebsiteCategory();
	var hasURL = hasDocURL();

	if(!hasCategory || !hasURL){
		var itemRec = nlapiLoadRecord('noninventoryitem', nlapiGetRecordId());
		if(!hasCategory){
			log('Item does not have website category.');
			setWebsiteCategory(itemRec);
		}
		if(!hasURL){
			setDocURL(itemRec);
		}
		nlapiSubmitRecord(itemRec);
	}
}

function hasDocURL(){
	var itemDocURL = nlapiGetFieldValue('custitem_dd_document_url'); //Check to see if doc URL is filled out, if so then exit function
	var itemDoc = nlapiGetFieldValue('custitem_dd_info_item_document');
	
	if((itemDoc != '' || itemDoc) && (itemDocURL == '' || !itemDocURL)){
		log('Item has document and does not have a document URL');
		return false;
	}
	else{
		log('Item does not need a URL');
		return true;
	}
}

function hasWebsiteCategory(){
	var count = nlapiGetLineItemCount('sitecategory');
	var hasCategory = false;
	
	for(var i = 1; i <= count; i++){
		var category = nlapiGetLineItemValue('sitecategory', 'website', i);
		if(category == '3'){
			hasCategory = true;
			break;
		}
	}
	return hasCategory;
}

function setWebsiteCategory(itemRec){
	log('Setting website category');
	try{
		itemRec.selectNewLineItem('sitecategory');
		itemRec.setCurrentLineItemValue('sitecategory', 'website', '3');
		itemRec.setCurrentLineItemValue('sitecategory', 'category', '-141');
		itemRec.setCurrentLineItemValue('sitecategory', 'isdefault', 'T');
		itemRec.commitLineItem('sitecategory');
	}
	catch(e){
		nlapiLogExecution('ERROR', 'Error setting site category', 'Error message: '+e.details);
	}
}

function setDocURL(itemRec){
	log('Setting document URL');	
	var docId = itemRec.getFieldValue('custitem_dd_info_item_document');
	var docRec = nlapiLoadFile(docId);
	var docURL = docRec.getURL();

	itemRec.setFieldValue('custitem_dd_document_url', docURL);	
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}