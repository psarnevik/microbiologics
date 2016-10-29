/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2016     parnevik
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function returnContent(request, response){

	nlapiLogExecution('DEBUG', '-- SUITELET STARTED --');
	
	var contentType = request.getParameter('contentType');
	
	var contentObject = {};
	
	switch(contentType){
	case '1': //FAQ
		nlapiLogExecution('DEBUG','Getting Content.', 'contentType = '+contentType);
		//contentObject.status = 'OK';
		contentObject = returnFAQ(request);
		break;
		
	default:
		nlapiLogExecution('DEBUG', 'Content type does not exist.', 'contentType = '+contentType);
	contentObject.status = 'ERROR';
	}
	
	nlapiLogExecution('DEBUG','Returning Content.');
	nlapiLogExecution('DEBUG','Returning Content.',JSON.stringify(contentObject));
	response.write(JSON.stringify(contentObject));
}

function returnFAQ(request){
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