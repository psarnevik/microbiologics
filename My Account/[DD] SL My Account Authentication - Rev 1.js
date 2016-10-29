/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Sep 2016     parnevik         Initial release
 * 1.01       13 Sep 2016     parnevik         Added error handling and comments
 *
 */

/**
 * Suitelet to determine whether the user has access to the custom tab within "My Account"
 * Based on the customer ID, Page ID, and user email address - determine whether the user has access to the page
 * Inputs: customerId, userEmail, pageId (corresponds to the pages setup within the custom record [DD] My Account Page)
 * 
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {boolean} True if the user has access, 
 */
function suitelet(request, response){
	log('--- SUITELET STARTED ---');
	var customerId = request.getParameter('customerId');
	var userEmail = request.getParameter('userEmail');
	var pageId = request.getParameter('pageId');

	//Determine the user role
	var userRole = getRole(userEmail, customerId);
	log('User Role: '+userRole);
	
	//If the user role returned is blank or false because of an error, then the user will not have access to the page (false is returned)
	if(userRole == '' || !userRole){
		response.write(false);
	}
	//Else run the hasAccess function to determine if the user has access to the page based on the page type
	else{
		response.write(hasAccess(userRole, pageId));
	}
}

/**
 * Based on the user's email and the customer ID, returns the user's role
 * Error handling: if an error occurs, false will be returned
 * 
 * @param {String} userEmail - the email address of the logged in user
 * @param {Int} customerId - the internal ID of the customer that the user belongs to and is logged in as
 * @returns {Int} userRole - the internal ID of the user role that the person is logged in as
 */
function getRole(userEmail, customerId){
	var userRole = '';
	try{
		var custRec = nlapiLoadRecord('customer', customerId); // load the customer record
		var customerEmail = custRec.getFieldValue('email');
		var customerRole = custRec.getFieldValue('accessrole');
		log('Customer Email: '+customerEmail+'Customer Role: '+customerRole);

		if(userEmail == customerEmail){ // Checks first to see if the user's email is the main customer's email address
			userRole = customerRole; // if so, then the role is the customer's main role (not the contact)
		}
		else{ // else check the contact records assigned to the customer that have access to the customer center
			var contactCount = custRec.getLineItemCount('contactroles'); // run through and count the contact that are included in the customer record

			for (var i=1; i <= contactCount; i++){
				var contactEmail = custRec.getLineItemValue('contactroles','email', i); // get the e-mail address of the contact
				if( contactEmail == userEmail){ // if the user's email matches then get their role and return it
					userRole = custRec.getLineItemValue('contactroles', 'role', i);
					break;
				}
			}	
		}
	}

	catch(e){
		nlapiCreateError('Error in getRole function.',e.message);
		return false;
	}
	return userRole;
}

/**
 * Based on the user's role and the ID of the page (stored in the My Account custom record), determine whether the user has access to the page
 * Error handling: if an error occurs, false is returned
 * 
 * @param {Int} userRole - the internald ID of the user role
 * @param {Int} pageId - the internal ID of the page the user is trying to access
 * @returns {Boolean} true if the user has access to the page based on the page ID, else false
 */
function hasAccess(userRole, pageId){
	log('--- Determining if User Role has page Access ---');

	var filters = [];
	filters.push(new nlobjSearchFilter('custrecord_dd_my_account_role', null, 'anyof', userRole));
	filters.push(new nlobjSearchFilter('id', null, 'equalto', pageId));

	//Search the My Account custom record to determine if there are any records stating the user's role has access to a specific page type
	try{
		var results = nlapiSearchRecord('customrecord_dd_my_account_page', null, filters, null);
		
		//If there are search results, then there is a matching row in the my account record, so the user has access to the page
		if(results){
			return true;
		}
		else{//If no results, then the user doesn't have access to the page
			return false;
		}
	}

	catch(e){
		nlapiCreateError('Error in hasAccess function.',e.message);
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