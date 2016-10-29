/**
 * @author Elim Solutions, Inc.
 */

//Date: 3/31/2016
//Author: Ben Wirzbach (RSM)
//RSM brought in to edit what forms the Auto Assign Button will appear on
//Updated by parnevik@deloitte.com to include new sales order form

var mbForms = ['124','206','229'];
//Added by RSM
var newRoyaltySalesOrderFormID = '206';

/*
 * This script will email specified contacts related to the customer on Page
 * Init event
 */
function pageInit_setDefaultMsg(type) {
    var formId = nlapiGetFieldValue('customform');
	var isMBForm = mbForms.indexOf(formId);
	
	try {
        if (isMBForm > -1) {
            if (nlapiGetFieldValue('custbody37') == 'F') setDefaultMessage(type)
        }

    } catch (e) {
        var stErrMsg = '';
        if (e.getDetails != undefined) {
            stErrMsg = 'Script Error: ' + e.getCode() + '<br>' + e.getDetails() + '<br>' + e.getStackTrace();
        }
        else {
            stErrMsg = 'Script Error: ' + e.toString();
        }

        alert(stErrMsg);
    }
}

/*
 * This script will set WEB ORDER FORM - DEFAULT MESSAGE'
 * 
 */
function beforeLoad_OnWebOrder(type, form) {
    var formId = nlapiGetFieldValue('customform');
    var isMBForm = mbForms.indexOf(formId);
    
    nlapiLogExecution('DEBUG', 'beforeLoad_OnWebOrder', 'formId = ' + formId);

    if (isMBForm > -1) {
        nlapiLogExecution('DEBUG', 'beforeLoad_OnWebOrder', 'set button');

        form.setScript('customscript_cs_testcatalog');
        form.addButton('custpage_auto_cat_btn', 'Auto Assign Catalog', 'AutoAssignCat()');
    }
}


/*
 * This function will set WEB ORDER FORM - DEFAULT MESSAGE
 */
function setDefaultMessage(type) {
    nlapiLogExecution('DEBUG', 'setDefaultMessage', 'type = ' + type);
    var lineBreak = (type == 'view') ? '<br>' : '\n';
    var commMsgSelect = nlapiSetFieldValue('messagesel', '');
    var messageDefault = 'Thank you for your business!';
    var soContact = nlapiGetFieldValue('custbody35');
    soContact = (soContact != '' && soContact != null) ? lineBreak + 'CONTACT: ' + soContact : '';

    var soPhone = nlapiGetFieldValue('custbody36');
    soPhone = (soPhone != '' && soPhone != null) ? lineBreak + 'PHONE: ' + soPhone : '';

    var commMessage = messageDefault + soContact + soPhone;

    document.forms['output_form'].elements['message'].defaultValue = commMessage;
    nlapiSetFieldValue('message', commMessage, false);

    nlapiLogExecution('DEBUG', 'setDefaultMessage', 'message = ' + commMessage);
};