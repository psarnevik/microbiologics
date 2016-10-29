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

	default:
		nlapiLogExecution('DEBUG', 'Content type does not exist.', 'contentType = '+contentType);
	}
	
	nlapiLogExecution('DEBUG','Returning Content.');
	nlapiLogExecution('DEBUG','Contents.',JSON.stringify(contentObject));
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
	
	var results = nlapiSearchRecord(null, searchId);
	
	if(results){
		nlapiLogExecution('DEBUG', 'Results from News Search', 'Results = '+results.length);
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
	var docsFeed = [];
	var searchId = '';
	var columns = [];
	var filters = [];
	
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
		searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_document_search');
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
		
		doc.industry = record.getValue(columns[0]);
		doc.productFormat = record.getValue(columns[1]);
		doc.title = encodeURIComponent(record.getValue(columns[2]));
		doc.detail = encodeURIComponent(record.getValue(columns[3]));
		doc.url = encodeURIComponent(record.getValue(columns[4]));
		
		docsFeed.push(doc);
	}
	
	return docsFeed;
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}