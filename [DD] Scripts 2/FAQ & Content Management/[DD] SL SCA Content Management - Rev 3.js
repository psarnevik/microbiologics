/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2016     parnevik         Initial revision with FAQ data
 * 2.00       23 Sep 2016     parnevik         Updated with newsfeed object
 */

/**
 * Used to return content for FAQ and distributor portal newsfeed.
 * 
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function returnContent(request, response){

	nlapiLogExecution('DEBUG', '-- SUITELET STARTED --');
	
	var contentType = request.getParameter('contentType');
	var customerId = request.getParameter('customerId');
	var subType = '';
	
	var contentObject = {};
	
	switch(contentType){
	case '1': //FAQ
		nlapiLogExecution('DEBUG','Getting Content.', 'contentType = '+contentType);
		contentObject = getFAQ();
		break;

	case '2': //Front Page News (Distributor Portal)
		nlapiLogExecution('DEBUG','Getting Content.', 'contentType = '+contentType);
		subType = 'frontPage';
		contentObject = getNews(subType);
		break;

	case '3': //What's New (Distributor Portal)
		nlapiLogExecution('DEBUG','Getting Content.', 'contentType = '+contentType);
		subType1 = 'whatsNew';
		contentObject.whatsNew = getNews(subType1);
		
		subType2 = 'events';
		contentObject.events = getNews(subType2);
		
		break;

	case '4': //Logos
		subType = 'logos';
		contentObject = getDocs(subType); // function to get logos
		break;

	case '5': //Photos
		subType = 'pics';
		contentObject = getDocs(subType); // function to get photos
		break;

	case '6': //Documents
		subType = 'docs';
		contentObject = getDocs(subType); // function to get documents
		break;
		
	case '7': //Distributor specific documents (needs customer ID as well) 
		subType = 'privateDocs';
		
		// If no customer ID exists, then break
		if(!customerId || customerId == ''){
			log('no customer');
			break;
		}
		contentObject = getDocs(subType, customerId); // function to get distributor specific documents (private docs)
		break;
		
	case '8': //Host a Seminar (Distributor Portal)
		nlapiLogExecution('DEBUG','Getting Content.', 'contentType = '+contentType);
		subType = 'hostSeminar';
		contentObject = getNews(subType);
		break;
		
	case '9': //Order Promotional Material (Distributor Portal)
		nlapiLogExecution('DEBUG','Getting Content.', 'contentType = '+contentType);
		subType = 'orderPromo';
		contentObject = getNews(subType);
		break;

	default:
		nlapiLogExecution('DEBUG', 'Content type does not exist.', 'contentType = '+contentType);
	}
	
	nlapiLogExecution('DEBUG','Returning Content.');
	//nlapiLogExecution('DEBUG','Contents.',JSON.stringify(contentObject));
	response.write(JSON.stringify(contentObject));
}

function getFAQ(){
	var faqContent = {};
	
	var faqTopics = [];
	var faqResults = [];
	
	var searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_faq_search');
	var results = nlapiSearchRecord(null, searchId);
	
	if(results){
		nlapiLogExecution('DEBUG', 'Results from FAQ Search', 'Results = '+results.length);
	}
	
	for(var i = 0; results != null && i < results.length; i++){
		var faqRecord = {};
		record = results[i];
		
		faqRecord.topic = record.getText('custrecord_dd_sca_content_faq_topic');
		faqRecord.title = encodeURIComponent(record.getValue('custrecord_dd_sca_content_title'));
		faqRecord.detail = encodeURIComponent(record.getValue('custrecord_dd_sca_content_detailed_desc'));
		faqRecord.keywords = record.getValue('custrecord_dd_sca_content_keywords');
		faqRecord.description = record.getValue('custrecord_dd_sca_content_description');
		faqRecord.head = record.getValue('custrecord_dd_sca_content_add_head');
		
		faqResults[i] = faqRecord;
		
		//Populates to FAQ Topics array to create the full list of topics (without duplicates)
		if(i == 0){
			faqTopics.push(faqRecord.topic);
			//nlapiLogExecution('DEBUG', 'Topics1', faqTopics[i]);
		}
		else if(faqTopics[(faqTopics.length - 1)] != faqRecord.topic){
			faqTopics.push(faqRecord.topic);
			//nlapiLogExecution('DEBUG', 'Topics1', 'Previous Topics = '+faqTopics[(faqTopics.length - 1)]);
		}
		
		//nlapiLogExecution('DEBUG', 'Decode Title', 'Decoded Title = '+decodeURIComponent(faqRecord.title)+', Encoded Title = '+faqRecord.title);
	}
	
	faqContent.topics = faqTopics;
	faqContent.contents = faqResults;
	
	return faqContent;
}

function getNews(subType){
	var newsFeed = [];
	var searchId = '';
	
	if(subType == 'frontPage'){ // 2
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_news_content');
	}
	else if(subType == 'whatsNew'){ // 3
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_content_whats_new');
	}
	else if (subType == 'events'){ // 3
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_content_events');
	}
	else if (subType == 'hostSeminar'){ // 8
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_host_seminar_search');
	}
	else if (subType == 'orderPromo'){ // 9
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_order_promo_materials');
	}
	
	var results = nlapiSearchRecord(null, searchId);
	
	if(results){
		nlapiLogExecution('DEBUG', 'Results from search', 'Results = '+results.length);
	}
	
	for(var i = 0; results && i < results.length; i++){
		var newsArticle = {};
		var record = results[i];
		
		newsArticle.detail = encodeURIComponent(record.getValue('custrecord_dd_sca_content_detailed_desc'));
		newsFeed.push(newsArticle);
	}
	
	return newsFeed;
}

function getDocs(subType, customerId){
	var webDomain = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_website_domain');
	var docsFeed = [];
	var searchId = '';
	var columns = [];
	var filters = [];
	var allCategories = getAllCategories();
	
	
	if(subType == 'logos'){ // 4
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_logos_search');
		filters.push(new nlobjSearchFilter('custrecord_dd_sca_doc_customer', null, 'anyof', '@NONE@'));
	}
	else if(subType == 'pics'){ // 5
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_photos_search');
		filters.push(new nlobjSearchFilter('custrecord_dd_sca_doc_customer', null, 'anyof', '@NONE@'));
	}
	else if(subType == 'docs'){ // 6
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_document_search');
		filters.push(new nlobjSearchFilter('custrecord_dd_sca_doc_customer', null, 'anyof', '@NONE@'));
	}
	else if(subType == 'privateDocs'){ // 7
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_private_docs');
		filters.push(new nlobjSearchFilter('custrecord_dd_sca_doc_customer', null, 'anyof', customerId));
	}
	
	var results = nlapiSearchRecord(null, searchId, filters);
	
	if(results){
		nlapiLogExecution('DEBUG', 'Results from News Search', 'Results = '+results.length);
		columns = results[0].getAllColumns();
	}
	else{
		return docsFeed;
	}
	
	for(var i = 0; results && i < results.length; i++){
		var doc = {};
		var record = results[i];
		
		var docCatIds = record.getValue(columns[0]);
		docCatIds = docCatIds.split(',');
		var catText = getCategories(docCatIds, allCategories);
		doc.categories = catText;
		
		doc.title = encodeURIComponent(record.getValue(columns[1]));
		doc.detail = encodeURIComponent(record.getValue(columns[2]));
		
		
		var url = record.getValue(columns[3]);
		//Checks to see if the URL is for an internal file, if so, append the website domain to create a full URL
		if(url.indexOf("/") == 0){
			url = webDomain + url;
		}
		
		doc.url = encodeURIComponent(url);
		doc.date = record.getValue(columns[4]);
		
		if(subType == 'pics' || subType == 'logos'){
			doc.hideThumbnail = record.getValue(columns[5]);
			if(!doc.hideThumbnail){
				doc.hideThumbnail = 'F';
			}
		}
		
		if(subType == 'docs' || subType == 'privateDocs'){
			var docThumbnail = record.getValue(columns[6]);
			
			if(docThumbnail != ''){
				doc.docThumbnail = webDomain + docThumbnail;
			}
			else{
				doc.docThumbnail = docThumbnail;
			}
		}
		
		docsFeed.push(doc);
	}
	
	return docsFeed;
}

function getCategories(categoryArray, allCategories){
	var textCategories = [];
	
	for(var i = 0; i < categoryArray.length; i++){
		var catObject = {};
		var catId = categoryArray[i];
		var index = -1;
		
		for(var j = 0; j < allCategories.length; j++){
			//log('allCatsId: '+allCategories[j].id);
			if(catId == allCategories[j].id){
				index = j;
				break;
			}
		}
		
		if(index == -1){
			continue;
		}
		
		catObject.parent = allCategories[index].parent;
		
		var child = allCategories[index].child;
		var colIndex = child.indexOf(' : ');
		if(colIndex != -1){
			child = child.substring(colIndex + 3);
		}
		
		catObject.child = child;
		
		log(JSON.stringify(catObject));
		
		textCategories.push(catObject);
	}
	return textCategories;
}

function getAllCategories(){
	var categories = [];
	var columns = [];
	
	columns.push(new nlobjSearchColumn('name'));
	columns.push(new nlobjSearchColumn('parent'));
	
	var results = nlapiSearchRecord('customrecord_dd_portal_file_category', null, null, columns);
	
	for(var i = 0; results && i < results.length; i++){
		var category = {};
		var record = results[i];
		
		category.id = record.getId();
				
		var parent = record.getText('parent');
		
		if(parent == ''){
			category.parent = record.getValue('name');
		}
		else{
			category.parent = parent;
		}
		
		category.child = record.getValue('name');
		
		log(JSON.stringify(category));
		
		categories.push(category);
	}
	
	return categories;
}



function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}