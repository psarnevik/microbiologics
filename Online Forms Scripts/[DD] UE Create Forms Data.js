/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Oct 2016     aramar
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */

var url ='';
function DD_UE_Forms_Data(type){
	nlapiLogExecution('DEBUG', 'DD_UE_Forms_Data',   '********** SCRIPT START**********');
//	Get the Record ID of MBL Registration record 			
	var RegistrationRecID 		= nlapiGetRecordId();
	nlapiLogExecution('DEBUG', 'DD_UE_Forms_Data',   ' RegistrationRecID = ' + RegistrationRecID);
	// Fetch the script parameter for the Password
	var Context = nlapiGetContext().getExecutionContext();
	nlapiLogExecution('DEBUG', 'DD_UE_Forms_Data',   ' Context = ' + Context);
	var SuiteletURL =nlapiResolveURL('SUITELET', 'customscript_dd_sl_forms_data_redirect', 'customdeploy_dd_sl_forms_data_redirect');
	nlapiLogExecution('DEBUG', 'DD_UE_Forms_Data',   ' SUITELET URL! = '+SuiteletURL);
	if (nlapiGetContext().getEnvironment() == 'PRODUCTION'){
		url = 'https://system.na1.netsuite.com';
	}else{
		url = 'https://system.sandbox.netsuite.com';
	}
	url += SuiteletURL;
	nlapiLogExecution('DEBUG', 'DD_UE_Forms_Data',   ' url ! = '+url);
	nlapiRequestURL('https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=305&deploy=1&compid=915960_SB3&h=9077c1807351a519a4e0');
}

//Suite let to redirect the Thank you Page
function DD_SL_Redirect_Page(request, response){
	nlapiLogExecution('DEBUG', 'DD_SL_Redirect_Page',   '********** SUITE LET SCRIPT STARTED**********');
	//var URL ='http://dev.microbiologics.com/thank-you-for-submitting-a-request?whence=';
	var URL ='https://www.google.co.in/?gws_rd=ssl';
	nlapiLogExecution('DEBUG', 'DD_UE_Forms_Data',   '  URL! = '+URL);
	//nlapiSetRedirectURL('EXTERNAL', URL);
	response.write(URL);
	nlapiLogExecution('DEBUG', 'DD_SL_Redirect_Page',   '********** SUITE LET SCRIPT END**********');
}
