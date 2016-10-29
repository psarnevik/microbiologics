/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Sep 2016     parnevik
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function cleanFiles(type) {
	var searchId = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_coa_saved_search');
	var search = nlapiLoadSearch(null, searchId);
	var searchType = search.getSearchType();
	nlapiLogExecution('debug', 'doMain', 'Search Type: '+searchType);
	
	if(searchType !='file'){
		nlapiLogExecution('debug', 'doMain', 'Search Type is not document, this script is strictly for deleting documents, exiting script.');
		return;	
	}
	
	try {

		var searchResults = nlapiSearchRecord(null, searchId);
		nlapiLogExecution('debug', 'doMain', 'searchResults.length=' + searchResults.length);

		for (var i = 0; searchResults != null && i < searchResults.length; i++) {

			var recordId = searchResults[i].getId(); // Original
			nlapiLogExecution('debug', 'doMain', 'Before Delete: Internal ID=' + recordId);
			if (isEmpty(recordId)){
				continue; //don't process any items that doesn't have an id
			}
			
			nlapiLogExecution('debug', 'doMain', 'Before Delete: Internal ID=' + recordId);
			
			try{
				//nlapiDeleteRecord(searchType, recordId);

				// Check remaining Goverence
				var currentContext = nlapiGetContext();
				if (currentContext.getRemainingUsage() < 100) {

					var status = nlapiScheduleScript(currentContext.getScriptId(), currentContext.getDeploymentId());
					
					return;
					//CANT_DELETE_ACCT
				} // End current usage
			}
			catch (e) {
				nlapiLogExecution('ERROR', 'unexpected error', e.toString());
			}
		} // End for
		if (searchResults.length >= 1000) {
			var status = nlapiScheduleScript(currentContext.getScriptId(), currentContext.getDeploymentId());
		}

	} catch (e) {
		if (e instanceof nlobjError) {
			nlapiLogExecution('ERROR', 'system error', e.getCode() + '\n' + e.getDetails());
		} else {
			nlapiLogExecution('ERROR', 'unexpected error', e.toString());
		}
		if (searchResults.length < 1){
			return;
		}
		if (e.getCode() == 'RCRD_DSNT_EXIST'){
			doMain();
		}
		
		nlapiLogExecution('debug', 'Error', 'Code is: ' + e.getCode() + ', Starting over at beginning of script');
	}
}

function isEmpty(aValue){
	if (aValue == null || aValue == '') 
		return true;

	return false;
}