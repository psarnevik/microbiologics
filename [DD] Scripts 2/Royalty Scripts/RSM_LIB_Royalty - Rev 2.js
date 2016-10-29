/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 2.00       21 Sep 2016     parnevik         Updated with setting original customer price and royalty price
 *
 */


/*
 * @func LogInfo
 * @usage 0
 * @desc Takes a NetSuite nlobjError object and logs the information.
 * @param {Object|String} e - a NetSuite nlobjError or an unexpected error string.
 * @param {String} t - The type of message to log. Options are ERROR, DEBUG, AUDIT, and EMERGENCY
 * @param {String} s - A subject for the logged error.
 * @param {String} m - A custom message provided via script.
 * @returns {Void}
 */

var helperURL = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=297&deploy=1&compid=915960_SB3&h=ec3b77d0e4a535e279f1'

function LogInfo(e, t, s, m) {
    if (e == null || e.length == 0) nlapiLogExecution(t, s, m);
    else if (e instanceof nlobjError || e.getCode()) nlapiLogExecution(t, s, 'Message: ' + m + '\nCode: ' + e.getCode() + '\nDetails: ' + e.getDetails() + '\nStack Trace: ' + e.getStackTrace());
    else nlapiLogExecution(t, s, 'Message: ' + m + '\nError: ' + err.toString());
    return;
};

/*
 * @func PrepPercentageValue
 * @usage 0
 * @desc Takes a string representation of a percentage and returns a decimal representation.
 * @param {String} v - The value to be processed.
 * @returns {Number}
 */
function PrepPercentageValue(v) {
    if (v === null || v === false || v.length === 0) v = "0.0%";
    v = v.split('%');
    return ((parseFloat(v[0])) / 100);
};

/*
 * @func PrepCurrencyValue
 * @usage 0
 * @desc Accepts NetSuite's string representation of currency and processes it to be used in some mathematical formula.
 * @param {String} s - A string representation of currency.
 * @returns {Number}
*/
function PrepCurrencyValue(s) {
    if (s === null || s === false || s.length === 0) s = "0.00";
    return parseFloat(s);
};

/*
 * @func GetItemType
 * @usage 5
 * @desc Provided a NetSuite item internal id it will return the record type for the item.
 * @param {String|Number} i - A NetSuite internal id.
 * @returns {String} t
 */
function GetItemType(i) {
    var t = '';
    if (i == null || i.length == 0) return;
    try {
        //t = nlapiLookupField('item', i, 'recordtype');
    	var url = helperURL+'&itemId='+i+'&task=itemType';
    	nlapiLogExecution('DEBUG', 'Suitelet is working', 'URL: '+url);
    	t = JSON.parse(nlapiRequestURL(url).body);
    	t = t.field;
    	
    	nlapiLogExecution('DEBUG', 'Suitelet is working', 'Item Type: '+t);
    }
    catch (e) {
        LogInfo(e, 'ERROR', 'Lookup Item Type Line');
    }
    return t;
}

/*
 * @func GetItemTotalRoyaltyPercentage
 * @usage 5
 * @desc Given an item type and id this will return the value in the total royalty percentage field on the item record.
 * @param {String} t - A NetSuite item type.
 * @param {String|Number} i - A NetSuite item internal id.
 * @returns {Number} p
 */
function GetItemTotalRoyaltyPercentage(t, i) {
    var p = 0.0;
    if (t == null || t.length == 0 || i == null || i.length == 0) return p;
    try {
        //p = PrepPercentageValue(nlapiLookupField(t, i, 'custitem_total_royalty_percentage'));
    	
    	var url =helperURL+'&itemId='+i+'&task=royalty';
    	nlapiLogExecution('DEBUG', 'Suitelet is working', 'URL: '+url);
    	p = JSON.parse(nlapiRequestURL(url).body);
    	p = p.field;
    	
    	nlapiLogExecution('DEBUG', 'Royalty Suitelet is working', 'Royalty: '+p);
    	
    }
    catch (e) {
        LogInfo(e, 'ERROR', 'Lookup Item Royalty Percentage');
    }
    return p;
}

function getPercentageString(percent) {
    percent = percent * 100
    percent = percent + '%';

    return percent;
}

/*
 * @func SetLineItemRoyaltyValues
 * @usage 10
 * @desc Sets the line item royalty fields on a transaction for the validate line client event.
 * @returns {Void}
 */
function CS_VL_SetLineItemRoyaltyValues() {
    var context = nlapiGetContext().getExecutionContext();
	
	// Initialize variables
    var is_royalty_line = 'F';
    var itemid = nlapiGetCurrentLineItemValue('item', 'item');
 
    if (itemid == null || itemid.length == 0 || itemid == "0"){
    	return;
    }
    
    var itemtype = '';
    var item_royalty_percent = 0.0;
    var amount = PrepCurrencyValue(nlapiGetCurrentLineItemValue('item', 'amount'));
    var royalty_amount = 0.0;
    var baked_price = 0.0;
    var rate = PrepCurrencyValue(nlapiGetCurrentLineItemValue('item', 'rate'));
    var baked_unit_price = 0.0;
    var currBakedPrice = '';
    var qty = '';
    var origRate = '';
    var basePrice = ''
    	
    // Verify the "Is Royalty Line Item" checkbox is not checked.
    is_royalty_line = nlapiGetCurrentLineItemValue('item', 'custcol_mb_is_royalty_line_item');
    if (is_royalty_line == 'T') return;

    // Get the royalty perentage from the item record
    item_royalty_percent = PrepPercentageValue(nlapiGetCurrentLineItemValue('item', 'custcol_royalty_percent'));
    
    if (item_royalty_percent == null || item_royalty_percent == '') {
        itemtype = GetItemType(itemid);
        
        if (itemtype == null || itemtype.length == 0 || itemtype == "itemgroup"){
        	return;
        }
    	
        item_royalty_percent = PrepPercentageValue(GetItemTotalRoyaltyPercentage(itemtype, itemid));
    }

    

    

    // Set the baked unit price
    currBakedPrice = nlapiGetCurrentLineItemValue('item', 'custcol_baked_unit_price');
    baked_unit_price = rate * (1 + item_royalty_percent);
    if(currBakedPrice == ''){
    	nlapiSetCurrentLineItemValue('item', 'custcol_baked_unit_price', baked_unit_price.toFixed(2));
    }
    
    // Set the baked price
    qty = nlapiGetCurrentLineItemValue('item', 'quantity');
    totalBakedPrice = baked_unit_price * qty;
    
    if(currBakedPrice == ''){
    	nlapiSetCurrentLineItemValue('item', 'custcol_baked_price', totalBakedPrice.toFixed(2));
    }
    else{
    	nlapiSetCurrentLineItemValue('item', 'custcol_baked_price', (currBakedPrice * qty).toFixed(2));
    }
    
    //Get rate field for original price of the item
    origRate = nlapiGetCurrentLineItemValue('item', 'custcol_dd_orig_cust_price');
    basePrice = nlapiGetCurrentLineItemValue('item', 'custcol_base_price');

    if(origRate == '' || !origRate){
    	// Set the royalty amount
        royalty_amount = amount * item_royalty_percent;
        nlapiSetCurrentLineItemValue('item', 'custcol_royalty_amount', royalty_amount.toFixed(2));
    	// Set the picking ticket amount (TCKT AMT)
        nlapiSetCurrentLineItemValue('item', 'custcol_picking_ticket_amount', amount.toFixed(2));
        // Set the base price total amount
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price_total', (basePrice * qty).toFixed(2));
        // Set the original customer price
        nlapiSetCurrentLineItemValue('item', 'custcol_dd_orig_cust_price', rate.toFixed(2));
        
        var royaltyPrice = (rate * (1+item_royalty_percent));
        
        if(context == 'webstore'){
        	nlapiSetCurrentLineItemValue('item', 'rate', royaltyPrice.toFixed(2));
        }
    }
    else{
    	// Set the royalty amount
        royalty_amount = (origRate * qty * item_royalty_percent);
        nlapiSetCurrentLineItemValue('item', 'custcol_royalty_amount', royalty_amount.toFixed(2));
    	// Set the picking ticket amount (TCKT AMT)
        nlapiSetCurrentLineItemValue('item', 'custcol_picking_ticket_amount', (origRate * qty).toFixed(2));
        // Set the base price total amount
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price_total', (basePrice * qty).toFixed(2));
    }
    return;
}

/*
 * @func UE_SetLineItemRoyaltyValues
 * @usage 10
 * @desc Sets the line item royalty field values for the entire item sublist on a transaction record.
 * @returns {Void}
 */
function UE_SetLineItemRoyaltyValues() {
	nlapiLogExecution('DEBUG', 'Line 223');
	// Begin loop through the line items.
	for (var i = 1; i <= nlapiGetLineItemCount('item') ; i++) {

		// Initialize and reset variables.
		var is_royalty_line = '';
		var itemid = '';
		var itemtype = '';
		var item_royalty_percent = 0.0;
		var amount = 0.0;
		var royalty_amount = 0.0;
		var baked_price = 0.0;
		var rate = 0.0;
		var baked_unit_price = 0.0;
		var origRate = '';
		var qty = '';
		var basePrice = '';

		// Verify the "Is Royalty Line Item" checkbox is not checked.
		is_royalty_line = nlapiGetLineItemValue('item', 'custcol_mb_is_royalty_line_item', i);
		if (is_royalty_line == 'T') continue;

		// Get the royalty perentage from the item record
		itemid = nlapiGetLineItemValue('item', 'item', i);
		if (itemid == null || itemid.length == 0 || itemid == "0") continue;

		item_royalty_percent = PrepPercentageValue(nlapiGetLineItemValue('item', 'custcol_royalty_percent', i));
		if (item_royalty_percent == null || item_royalty_percent == '') {
			itemtype = GetItemType(itemid);
			if (itemtype == null || itemtype.length == 0 || itemtype == "itemgroup") continue;
			item_royalty_percent = PrepPercentageValue(GetItemTotalRoyaltyPercentage(itemtype, itemid));
		}

		origRate = nlapiGetLineItemValue('item', 'custcol_dd_orig_cust_price', i);
		if(origRate != '' || origRate){
			nlapiSetLineItemValue('item', 'rate', i, origRate);
		}
		
		rate = PrepCurrencyValue(nlapiGetLineItemValue('item', 'rate', i));
		basePrice = nlapiGetCurrentLineItemValue('item', 'custcol_base_price');
		qty = nlapiGetLineItemValue('item', 'quantity', i);


		// Set the picking ticket amount (TCKT AMT)
		nlapiSetLineItemValue('item', 'custcol_picking_ticket_amount', i, (rate * qty).toFixed(2));

		// Set the base price total amount
		nlapiSetLineItemValue('item', 'custcol_base_price_total', i, (basePrice * qty).toFixed(2));

		// Set the royalty amount
		royalty_amount = rate * qty * item_royalty_percent;
		nlapiSetLineItemValue('item', 'custcol_royalty_amount', i, royalty_amount.toFixed(2));

		
		
		// Set the baked unit price
		baked_unit_price = rate * (1 + item_royalty_percent);
		nlapiSetLineItemValue('item', 'custcol_baked_unit_price', i, baked_unit_price.toFixed(2));
	    
		// Set the baked price
		baked_price = (baked_unit_price * qty).toFixed(2);
		nlapiSetLineItemValue('item', 'custcol_baked_price', i, baked_price);
		
		nlapiSetLineItemValue('item', 'custcol_royalty_percent', i, getPercentageString(item_royalty_percent));
	}

	return;
}

/*
 * @func UE_BS_AffectRoyaltyLine
 * @usage 0
 * @desc Calculates the royalty total from all item sublist lines and adds or updates a royalty line item.
 * @returns {Void}
 */
function UE_BS_AffectRoyaltyLine() {
	nlapiLogExecution('DEBUG', 'UE_BS_AffectRoyaltyLine', '-- START -- ');
    // Initialize some variables.
    var royalty_total = 0.0;
    var royalty_line_num = 0;

    for (var i = 1; i <= nlapiGetLineItemCount('item') ; i++) {
    	nlapiLogExecution('DEBUG', 'line 313', 'Rate: '+PrepCurrencyValue(nlapiGetLineItemValue('item', 'rate', i)));
        // Initialize and reset variables.
        var is_royalty_line = 'F';
        var royalty_amount = 0.0;

        // Check to see if this is the royalty line.
        is_royalty_line = nlapiGetLineItemValue('item', 'custcol_mb_is_royalty_line_item', i);
        if (is_royalty_line == 'T') {
            royalty_line_num = i;
            continue;
        }

        // Add the royalty amount to the total amount
        royalty_amount = PrepCurrencyValue(nlapiGetLineItemValue('item', 'custcol_royalty_amount', i));
        royalty_total = royalty_total + royalty_amount;
    }

    // If there is already a royalty line item then update it.
    if (royalty_line_num != 0 && royalty_total > 0) {
    	nlapiSetLineItemValue('item', 'quantity', royalty_line_num, '1');
    	nlapiSetLineItemValue('item', 'rate', royalty_line_num, royalty_total.toFixed(2));
        nlapiSetLineItemValue('item', 'amount', royalty_line_num, royalty_total.toFixed(2));
        nlapiSetLineItemValue('item', 'custcol_base_price', royalty_line_num, royalty_total.toFixed(2));
        nlapiSetLineItemValue('item', 'custcol_base_price_total', royalty_line_num, royalty_total.toFixed(2));
        nlapiSetLineItemValue('item', 'custcol_picking_ticket_amount', royalty_line_num, royalty_total.toFixed(2));
    }
    else if (royalty_total > 0) { // Add a new royalty line item

    	var royItemFields = nlapiLookupField('item', '26831', ['istaxable','description']);
    	var istaxable = royItemFields.istaxable;
    	var description = royItemFields.description;
    	
        nlapiSelectNewLineItem('item');
        nlapiSetCurrentLineItemValue('item', 'item', '26831'); // Add the royalty line item.
        nlapiSetCurrentLineItemValue('item', 'quantity', '1');
        nlapiSetCurrentLineItemValue('item', 'price', '-1'); // Set teh price level to custom.
        nlapiSetCurrentLineItemValue('item', 'custcol_mb_is_royalty_line_item', 'T'); // Set the is royalty line field.
        nlapiSetCurrentLineItemValue('item', 'rate', royalty_total.toFixed(2)); // Set the rate.
        nlapiSetCurrentLineItemValue('item', 'amount', royalty_total.toFixed(2)); // Set the amount.
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price', royalty_total.toFixed(2));
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price_total', royalty_total.toFixed(2));
        nlapiSetCurrentLineItemValue('item', 'custcol_picking_ticket_amount', royalty_total.toFixed(2));
        nlapiSetCurrentLineItemValue('item', 'istaxable', istaxable);
        nlapiSetCurrentLineItemValue('item', 'description', description);
        nlapiCommitLineItem('item');
    }
    
    return;
    nlapiLogExecution('DEBUG', 'UE_BS_AffectRoyaltyLine', '-- END -- ');
}

/*
 * @func onClickUpdateRoyaltyLine
 * @usage 0
 * @desc Calculates the royalty line amount on click of the added button.
 * @returns {Void}
 */
function onClickUpdateRoyaltyLine() {
    // Initialize some variables.
    var royalty_total = 0.0;
    var royalty_line_num = 0;

    // Begin loop through line items
    for (var i = 1; i <= nlapiGetLineItemCount('item') ; i++) {

        // Initialize and reset variables.
        var is_royalty_line = 'F';
        var royalty_amount = 0.0;
        //var origPrice = nlapiGetLineItemValue('item', 'custcol_dd_orig_cust_price', i);
        var rate = nlapiGetLineItemValue('item', 'rate', i);
        var qty = nlapiGetLineItemValue('item', 'quantity', i);
        var royaltyPercent = PrepPercentageValue(nlapiGetLineItemValue('item', 'custcol_royalty_percent', i));
        
        // Check to see if this is the royalty line.
        is_royalty_line = nlapiGetLineItemValue('item', 'custcol_mb_is_royalty_line_item', i);
        
        if (is_royalty_line == 'T') {
            royalty_line_num = i;
            continue;
        }
//        else if(origPrice != '' && origPrice != rate && origPrice > 0){
//        	nlapiSetLineItemValue('item', 'rate', i, origPrice);
//        	nlapiSetLineItemValue('item', 'amount', i, (origPrice * qty).toFixed(2));
//        }

        // Add the royalty amount to the total amount
        //royalty_amount = PrepCurrencyValue(nlapiGetLineItemValue('item', 'custcol_royalty_amount', i));
        royalty_amount = parseFloat((rate * qty * royaltyPercent).toFixed(2));
        //alert('Line: '+i+', qty: '+qty+', royaltyPercent: '+royaltyPercent+', rate: '+rate+', royalty_amount: '+royalty_amount+', royalty_total: '+royalty_total);
        royalty_total = royalty_total + royalty_amount;
        //alert('After adding royalty amount to royalty total, royalty total: '+royalty_total);
    }

    // If there is already a royalty line item then update it.
    if (royalty_line_num != 0 && royalty_total > 0) {
        nlapiSelectLineItem('item', royalty_line_num);
        nlapiSetCurrentLineItemValue('item', 'rate', royalty_total.toFixed(2), true, true);
        nlapiSetCurrentLineItemValue('item', 'amount', royalty_total.toFixed(2), true, true);
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price', royalty_total.toFixed(2), true, true);
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price_total', royalty_total.toFixed(2), true, true);
        nlapiSetCurrentLineItemValue('item', 'custcol_picking_ticket_amount', royalty_total.toFixed(2), true, true);
        nlapiCommitLineItem('item');
    }
    else if (royalty_total > 0) { // Add a new royalty line item

        nlapiSelectNewLineItem('item');
        nlapiSetCurrentLineItemValue('item', 'item', '26831', true, true); // Add the royalty line item.
        nlapiSetCurrentLineItemValue('item', 'quantity', '1', true, true); // Add the quantity.
        nlapiSetCurrentLineItemValue('item', 'price', '-1', true, true); // Set the price level to custom.
        nlapiSetCurrentLineItemValue('item', 'rate', royalty_total.toFixed(2), true, true); // Set the rate.
        nlapiSetCurrentLineItemValue('item', 'amount', royalty_total.toFixed(2), true, true); // Set the amount.
        nlapiSetCurrentLineItemValue('item', 'istaxable', 'T', true, true); // Set the tax.
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price', royalty_total.toFixed(2), true, true);
        nlapiSetCurrentLineItemValue('item', 'custcol_base_price_total', royalty_total.toFixed(2), true, true);
        nlapiSetCurrentLineItemValue('item', 'custcol_picking_ticket_amount', royalty_total.toFixed(2), true, true);
        nlapiSetCurrentLineItemValue('item', 'custcol_mb_is_royalty_line_item', 'T', true, true); // Set the is royalty line field.
        nlapiCommitLineItem('item');
    }
    else {
        alert('No royalty amount to be added.');
    }

    return;
}

//Checks the form id and compares it to the scrip param id. return true to continue processing, return false to cancel processing
function UE_CheckReturnAuthForm() {
    ScriptBase.GetParameters(['custscript_ue_royalty_ra_form_id']);

    var paramFormIds = ScriptBase.Parameters.custscript_ue_royalty_ra_form_id;
    var formId = nlapiGetFieldValue('customform');
    var continueProcessing = false;

    //if the script parameter for the form id is empty then run the code
    if (ScriptBase.CU.IsNullOrEmpty(paramFormIds)) {
        continueProcessing = true;
        return continueProcessing;
    }
    //else loop through comma separated ids
    else {
        var arrFormIds = paramFormIds.split(',');

        for (var i = 0; i < arrFormIds.length; i++) {
            if (formId == arrFormIds[i]) {
                continueProcessing = true;
            }
        }
        return continueProcessing;
    }
}

function UE_CheckCreditMemoForm() {
    ScriptBase.GetParameters(['custscript_ue_royalty_cm_form_id']);

    var paramFormIds = ScriptBase.Parameters.custscript_ue_royalty_cm_form_id;
    var formId = nlapiGetFieldValue('customform');
    var continueProcessing = false;

    //if the script parameter for the form id is empty then run the code
    if (ScriptBase.CU.IsNullOrEmpty(paramFormIds)) {
        continueProcessing = true;
        return continueProcessing;
    }
        //else loop through comma separated ids
    else {
        var arrFormIds = paramFormIds.split(',');

        for (var i = 0; i < arrFormIds.length; i++) {
            if (formId == arrFormIds[i]) {
                continueProcessing = true;
            }
        }
        return continueProcessing;
    }
}

function UE_CheckQuoteForm() {
    ScriptBase.GetParameters(['custscript_ue_royalty_quote_form_id']);

    var paramFormIds = ScriptBase.Parameters.custscript_ue_royalty_quote_form_id;
    var formId = nlapiGetFieldValue('customform');
    log('Checking quote form - PSA - formId: '+formId);
    var context = nlapiGetContext().getExecutionContext();
    
    log('context: '+context);
    
    
    var continueProcessing = false;

    //if the script parameter for the form id is empty then run the code
    if (ScriptBase.CU.IsNullOrEmpty(paramFormIds) || context == 'webstore') {
        continueProcessing = true;
        return continueProcessing;
    }
        //else loop through comma separated ids
    else {
        var arrFormIds = paramFormIds.split(',');

        for (var i = 0; i < arrFormIds.length; i++) {
            if (formId == arrFormIds[i]) {
                continueProcessing = true;
            }
        }
        return continueProcessing;
    }
}

//Checks the form id and compares it to the scrip param id. return true to continue processing, return false to cancel processing
function CS_CheckReturnAuthForm() {
    ScriptBase.GetParameters(['custscript_cs_royalty_ra_form_id']);

    var paramFormIds = ScriptBase.Parameters.custscript_cs_royalty_ra_form_id;
    var formId = nlapiGetFieldValue('customform');
    var continueProcessing = false;

    //if the script parameter for the form id is empty then run the code
    if (ScriptBase.CU.IsNullOrEmpty(paramFormIds)) {
        continueProcessing = true;
        return continueProcessing;
    }
        //else loop through comma separated ids
    else {
        var arrFormIds = paramFormIds.split(',');

        for (var i = 0; i < arrFormIds.length; i++) {
            if (formId == arrFormIds[i]) {
                continueProcessing = true;
            }
        }
        return continueProcessing;
    }
}

function CS_CheckCreditMemoForm() {
    ScriptBase.GetParameters(['custscript_cs_royalty_cm_form_id']);

    var paramFormIds = ScriptBase.Parameters.custscript_cs_royalty_cm_form_id;
    var formId = nlapiGetFieldValue('customform');
    var continueProcessing = false;

    //if the script parameter for the form id is empty then run the code
    if (ScriptBase.CU.IsNullOrEmpty(paramFormIds)) {
        continueProcessing = true;
        return continueProcessing;
    }
        //else loop through comma separated ids
    else {
        var arrFormIds = paramFormIds.split(',');

        for (var i = 0; i < arrFormIds.length; i++) {
            if (formId == arrFormIds[i]) {
                continueProcessing = true;
            }
        }
        return continueProcessing;
    }
}

function CS_CheckQuoteForm() {
    ScriptBase.GetParameters(['custscript_cs_royalty_quote_form_id']);

    var paramFormIds = ScriptBase.Parameters.custscript_cs_royalty_quote_form_id;
    var formId = nlapiGetFieldValue('customform');
    nlapiLogExecution('DEBUG', 'check quote form','formId: '+formId);
    var continueProcessing = false;

    //if the script parameter for the form id is empty then run the code
    if (ScriptBase.CU.IsNullOrEmpty(paramFormIds)) {
        continueProcessing = true;
        return continueProcessing;
    }
        //else loop through comma separated ids
    else {
        var arrFormIds = paramFormIds.split(',');

        for (var i = 0; i < arrFormIds.length; i++) {
            if (formId == arrFormIds[i]) {
                continueProcessing = true;
            }
        }
        return continueProcessing;
    }
}

function UE_CreateUpdateOrderRoyaltyRecords() {	
	//var itemIds = getItemIds();
    var RecId = nlapiGetRecordId();

    var salesOrder = nlapiLoadRecord(nlapiGetRecordType(), RecId);
    var lineCount = salesOrder.getLineItemCount('item');
    var submitOrder = false;
    for(var i = 1; i <= lineCount; i++){
    	var rate = nlapiGetLineItemValue('item', 'rate', i);
    	var origRate = salesOrder.getLineItemValue('item', 'custcol_dd_orig_cust_price', i);
    	var qty = salesOrder.getLineItemValue('item', 'quantity', i);
    	nlapiLogExecution('DEBUG', 'QUANTITY IN AFTER SUBMIT','QUANTITY IN AFTER SUBMIT: '+qty);
    	nlapiLogExecution('DEBUG', 'BAKED PRICE AFTER SUBMIT','BAKED PRICE AFTER SUBMIT: '+(rate*qty));
    	
    	/**
    	 * Code added by Prasanna
    	 */
    	var baked_unit_price=salesOrder.getLineItemValue('item', 'custcol_baked_unit_price', i);
    	nlapiLogExecution('DEBUG', 'BAKED UNIT PRICE AFTER SUBMIT','BAKED UNIT PRICE AFTER SUBMIT: '+baked_unit_price);
    	
    	
    	nlapiLogExecution('DEBUG', 'Line 592','rate: '+rate);
    	nlapiLogExecution('DEBUG', 'Line 593','origRate: '+origRate);

    	if(rate != origRate && origRate != '' && origRate){
    		nlapiLogExecution('DEBUG', 'Line 596','rate does not match origrate, updating rate.');    		
    		salesOrder.setLineItemValue('item', 'rate', i, origRate);
    		
    		/**
    		 * Code added by Prasanna
    		 */
    		salesOrder.setLineItemValue('item', 'custcol_baked_price', i, (baked_unit_price * qty).toFixed(2));
    		submitOrder = true;
    	}
    }
    if(submitOrder){
    	nlapiLogExecution('DEBUG', 'Line 602','submitting record since rate changed.');
    	nlapiSubmitRecord(salesOrder);
    }

    var itemIds = getItemIds();
    
    var resultsItemRoyaltyRec = getItemRoyaltyRecResults(itemIds);

    if (resultsItemRoyaltyRec != null && resultsItemRoyaltyRec.length > 0) {
        var itemRoyaltyAmounts = calculateItemRoyaltyAmounts(resultsItemRoyaltyRec);

        if (itemRoyaltyAmounts != null && itemRoyaltyAmounts.length > 0) {
            var summedRoyaltyAmounts = sumRoyaltyAmountsByCultureCollection(itemRoyaltyAmounts);

            if (summedRoyaltyAmounts != null && summedRoyaltyAmounts.length > 0) {
                createOrUpdateOrderRoyalty(summedRoyaltyAmounts, RecId);

            }
        }
    }
    else {
        ScriptBase.Log.Debug('Item Royalty Record Search Results', '0 results found');
    }
};

//gets item ids from items and return them as an array
function getItemIds() {
    var itemIds = [];

    var ItemCount = nlapiGetLineItemCount('item');

    for (var i = 1; i <= ItemCount; i++) {
        var item = nlapiGetLineItemValue('item', 'item', i);

        itemIds.push(item);
    }

    return itemIds;
};

//Searches for Item Royalty Records based on itemIds
function getItemRoyaltyRecResults(itemIds) {
    var filters = [];
    var cols = [];
    var results = [];

    filters.push(new nlobjSearchFilter('custrecord_item', null, 'anyof', itemIds));
    cols.push(new nlobjSearchColumn('custrecord_item'));
    cols.push(new nlobjSearchColumn('custrecord_culture_collection'));
    cols.push(new nlobjSearchColumn('custrecord_royalty_percent'));

    return results = nlapiSearchRecord('customrecord_item_royalty_record', null, filters, cols);
};


//loops through items and results from Item Royalty Rec search, if it finds a matching item then it calculates the Royalty amount and addes it to an object to be returned
function calculateItemRoyaltyAmounts(resultsItemRoyaltyRec) {
    var itemCount = nlapiGetLineItemCount('item');
    var itemRoyaltyAmounts = [];

    for (var i = 1; i <= itemCount; i++) {
        var item = nlapiGetLineItemValue('item', 'item', i);
        var isRoyaltyLine = nlapiGetLineItemValue('item', 'custcol_mb_is_royalty_line_item', i);

        if (isRoyaltyLine == 'T') continue;
        for (var x = 0; x < resultsItemRoyaltyRec.length; x++) {
            var resultItem = resultsItemRoyaltyRec[x].getValue('custrecord_item');


            if (item == resultItem) {
                //need to determine if the percentage value needs to be divided by 100 or not
                var royaltyPercentage = PrepPercentageValue(resultsItemRoyaltyRec[x].getValue('custrecord_royalty_percent'));
                var cultureCollection = resultsItemRoyaltyRec[x].getValue('custrecord_culture_collection');
                var itemAmount = nlapiGetLineItemValue('item', 'amount', i);
                
                var sales_order_record= nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
                var item_rate = sales_order_record.getLineItemValue('item', 'rate', i);
                nlapiLogExecution('DEBUG', 'ITEM RATE', 'ITEM RATE::'+item_rate);
                
                var item_quantity = sales_order_record.getLineItemValue('item', 'quantity', i);
                nlapiLogExecution('DEBUG', 'ITEM QUANTITY', 'ITEM QUANTITY::'+item_quantity);
                
                var item_amount = (item_rate*item_quantity).toFixed(2);
                nlapiLogExecution('DEBUG', 'ITEM AMOUNT', 'ITEM AMOUNT::'+item_amount);
                
                var rate = nlapiGetLineItemValue('item', 'rate', i);
                var quantity = nlapiGetLineItemValue('item', 'quantity', i);
                var amount=(rate*quantity).toFixed(2);
                var royaltyAmount = (item_amount * royaltyPercentage).toFixed(2);

                itemRoyaltyAmounts.push({
                    CultureCollection: cultureCollection,
                    RoyaltyAmount: Number(royaltyAmount)
                });

            }
        }
    }

    return itemRoyaltyAmounts;
};

//Sums the royalty amounts by culture collection
function sumRoyaltyAmountsByCultureCollection(itemRoyaltyAmounts) {
    var summedRoyaltyAmounts = [];

    summedRoyaltyAmounts = Enumerable.From(itemRoyaltyAmounts).GroupBy("$.CultureCollection", null,
            function (key, g) {
                var result = {
                    CultureCollection: key,
                    SummedRoyaltyAmount: g.Sum("$.RoyaltyAmount"),
                    IsFound: false
                }
                return result;
            }).ToArray();

    return summedRoyaltyAmounts;
};

function createOrUpdateOrderRoyalty(summedRoyaltyAmounts, RecId) {
    var filters = [];
    var cols = [];
    var results = [];

    filters.push(new nlobjSearchFilter('custrecord_or_salesorder', null, 'is', RecId));
    cols.push(new nlobjSearchColumn('custrecord_new_royalty_type'));

    results = nlapiSearchRecord('customrecord_order_royalties', null, filters, cols);

    //For loop looks for existing Order Royalty records
    if (results != null && results.length > 0) {
        for (var i = 0; i < summedRoyaltyAmounts.length; i++) {
            var cultureCollection = summedRoyaltyAmounts[i].CultureCollection;
            
            for (var x = 0; x < results.length; x++) {
                var resultsCultureCollection = results[x].getValue('custrecord_new_royalty_type');

                if (cultureCollection == resultsCultureCollection) {
                    updateOrderRoyalty(results[x].getId(), summedRoyaltyAmounts[i].SummedRoyaltyAmount);
                    summedRoyaltyAmounts[i].IsFound = true;
                    break;
                }
            }
        }
    }

    //For loop looks at isFound property to determine which Order Royalty need to be created
    for (var j = 0; j < summedRoyaltyAmounts.length; j++) {
        if (summedRoyaltyAmounts[j].IsFound == false) {
            creatOrderRoyalty(RecId, summedRoyaltyAmounts[j].CultureCollection, summedRoyaltyAmounts[j].SummedRoyaltyAmount);
        }
    }

};

//Updates the amount on the existing Order Royalties Record
function updateOrderRoyalty(orderRoyaltyId, royaltyAmount) {
    nlapiSubmitField('customrecord_order_royalties', orderRoyaltyId, 'custrecord_or_amount', royaltyAmount);
};

function creatOrderRoyalty(RecId, cultureCollection, royaltyAmount) {
	var newOrderRoyalty = nlapiCreateRecord('customrecord_order_royalties');

    newOrderRoyalty.setFieldValue('custrecord_or_salesorder', RecId);
    newOrderRoyalty.setFieldValue('custrecord_new_royalty_type', cultureCollection);
    newOrderRoyalty.setFieldValue('custrecord_or_amount', royaltyAmount);

    nlapiSubmitRecord(newOrderRoyalty);
}

function log(details, error){
	if(error){
		nlapiLogExecution('ERROR', 'Error Details', details);
	}
	else{
		nlapiLogExecution('DEBUG', 'Debug Details', details);
	}
}