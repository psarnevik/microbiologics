/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Sep 2016     parnevik
 *
 */

/**
 * Main function used to retrieve alternative product formats, support hub links to populate the item detail page in SCA.
 * 
 * Parameters:
 * contentType:
 * - altFormat - retrieves the list of items with the same product format as the given item ID)
 * - supportHub - retrieves the support hub links based on the item ID  
 * 
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var content = '';
	var contentType = request.getParameter('contentType');
	var itemId = request.getParameter('itemId');
	log('contentType = '+contentType);
	
	// Main function that looks at the content type and item id to determine what to return in the response object
	switch(contentType){
	case 'altFormat': //Alternative Formats
		content = getAltFormats(itemId);
		break;
		
	case 'supportHub': // Support hub categories and links
		content = getSupportHubLinks(itemId);
		break;

	default:
		log('Content type does not exist, contentType = '+contentType);
	}
	response.write(JSON.stringify(content));
	
}

/**
 * Gets the alternative formats based on the item id.
 * 
 * @param {Int} Internal ID of an item record.
 * @returns {Array} Array of item objects with the details to show on the website. 
 */
function getAltFormats(itemId){
	var location = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_prod_detail_location');
	var website = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_web_site_prod_detail');
	var docItemType = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sup_hub_doc')
	var maxResults = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_max_alt_formats');
	
	var itemArray =[];
	
	try{
		var catalogNo = nlapiLookupField('item',itemId,'custitem21');
		if(catalogNo == '' || !catalogNo){
			return itemArray;
		}

		var filters = [];
		var columns = [];

		filters.push(new nlobjSearchFilter('internalidnumber', null, 'notequalto', itemId));
		filters.push(new nlobjSearchFilter('custitem21', null, 'is', catalogNo));
		filters.push(new nlobjSearchFilter('isonline', null, 'is', 'T'));
		filters.push(new nlobjSearchFilter('location', null, 'anyof', location));
		filters.push(new nlobjSearchFilter('website', null, 'anyof', website));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F') );
		filters.push(new nlobjSearchFilter('custitem_sca_item_type', null, 'noneof', docItemType) );

		columns.push(new nlobjSearchColumn('storedisplayname'));
		columns.push(new nlobjSearchColumn('custitem_facet_product_format'));
		columns.push(new nlobjSearchColumn('urlcomponent'));
		
		var formulaColumn = new nlobjSearchColumn('formulatext');
		formulaColumn.setFormula("LTRIM(regexp_substr({itemid},'[^:]*$'))");
		columns.push(formulaColumn);
		
		
		
		

		var results = nlapiSearchRecord('item', null, filters, columns);

		for(var i = 0; results && results.length && i < results.length; i++){
			var items = {};

			var displayName = results[i].getValue(columns[0]);
			var productFormat = results[i].getText(columns[1]);
			var url = results[i].getValue(columns[2]);
			var itemid = results[i].getValue(columns[3]);

			log('i = '+i+', displayName: '+displayName+', productFormat: '+productFormat+', url: '+url+', itemid: '+itemid);

			items.displayName = displayName + ',  SKU: '+itemid;
			items.productFormat = productFormat;
			items.url = url;

			itemArray[i] = items;
			if(i == maxResults){
				break;
			}
		}
	}
	catch(e){
		nlapiLogExecution('ERROR', 'Error searching for alt formats.', e.getCode()+', '+e.getDetails());
	}
	return itemArray;
}

/**
 * Gets the support hub links and document categories for each support hub category based on the item id.
 * 
 * @param {Int} itemId - internal id of the item.
 * @returns {Boolean} True if documents exist in the category to be displayed on the site, False if there aren't any 
 */
function getSupportHubLinks(itemId){
	var supportHub = [];
	try{
		var fields = ['custitem_facet_product_format', 'custitem_sca_item_type'];
		var itemFields = nlapiLookupField('item', itemId, fields);
		
		var prodFormat = itemFields.custitem_facet_product_format;
		var itemType = itemFields.custitem_sca_item_type;
		
		if(itemType == '1'){
			return supportHub;
		}

		var filters = [];
		var columns = [];

		filters.push(new nlobjSearchFilter('internalidnumber', 'custrecord_dd_pf_support_hub_categories', 'equalto', prodFormat));

		columns.push(new nlobjSearchColumn('name'));
		columns.push(new nlobjSearchColumn('custrecord_dd_sup_hub_doc_category'));
		columns.push(new nlobjSearchColumn('custrecord_dd_sup_hub_displ_order').setSort());

		var results = nlapiSearchRecord('customrecord_dd_support_hub_categories', null, filters, columns);

		for(var i = 0; results && results.length && i < results.length; i++){
			var supCat = {};
			var docCatId = [];


			var supCatName = results[i].getValue(columns[0]);
			var docCatId = results[i].getValue(columns[1]).split(',');
			var docCat = results[i].getText(columns[1]);



			log('i = '+i+', supCatName: '+supCatName+', docCat: '+docCat+', docCatId: '+docCatId);

			supCat.supCatName = supCatName;
			supCat.docCat = docCat;

			if(hasDocs(docCatId, prodFormat)){
				supportHub.push(supCat);
			}
		}
	}
	catch(e){
		nlapiLogExecution('ERROR', 'Error searching for support hub categories.', e.getCode()+', '+e.getDetails());
	}
	return supportHub;	
}

/**
 * Does a search based on the doc categories to see if there are documents available to be displayed on the site.
 * 
 * @param {Array} docCatId - Array of document category internal Ids.
 * @param {Array} prodFormat - Array of product format internal Ids.
 * @returns {Boolean} True if documents exist in the category to be displayed on the site, False if there aren't any 
 */
function hasDocs(docCatId, prodFormat){
	var location = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_prod_detail_location');
	var website = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_web_site_prod_detail');
	var docItemType = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sup_hub_doc');
	
	var filters = [];
	var columns = [];
	
	filters.push(new nlobjSearchFilter('custitem_facet_product_format', null, 'anyof', prodFormat));
	filters.push(new nlobjSearchFilter('custitem_sca_item_type', null, 'anyof', docItemType));
	filters.push(new nlobjSearchFilter('custitem_document_category', null, 'anyof', docCatId));
	filters.push(new nlobjSearchFilter('isonline', null, 'is', 'T'));
	filters.push(new nlobjSearchFilter('location', null, 'anyof', location));
	filters.push(new nlobjSearchFilter('website', null, 'anyof', website));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F') );
	
	var results = nlapiSearchRecord('item', null, filters);
	
	if(results){
		log('Docs exist for categories: '+docCatId);
		return true;
	}
	else{
		log('Docs do not exist for categories: '+docCatId);
		return false;
	}
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}