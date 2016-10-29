/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Sep 2016     parnevik
 *
 */

/**
 * Main pricing suitelet for all functions within the webcart and SCA item pricing
 * 
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	/*
	 * Parameters (in URL of the suitelet):
	 * -- itemID: internal id of an item
	 * -- customerId: the internal id of the customer
	 * -- task: defines the task that the suitelet is performing
	 */
	
	var itemId = request.getParameter('itemId');
	var customerId = request.getParameter('customerId');
	var task = request.getParameter('task');
	var tranId = request.getParameter('tranId');
	var details = {};
	var field = '';
	
	/*
	 * Task Options:
	 * - itemType: get the item type of the given item
	 * - royalty: gets the royalty percentage of the given item
	 * - price: gets the item's price based on the customer's pricing preference and the royalty percentage
	 * - breakout: gets the total royalty amount based on the cart (must use POST and pass the cart in a JSON)
	 */
	switch(task){
	case 'itemType':
		if(itemId == 'undefined' || !itemId || itemId == null){
			return;
		}
		
		try{
			field = nlapiLookupField('item', itemId, 'recordtype');
			details.field = field;
			response.write(JSON.stringify(details));
		}
		catch(e){
			log('Error getting item type.',true);
			details.field = field;
			response.write(JSON.stringify(details));
		}
		break;
		
	case 'royalty':
		if(itemId == 'undefined' || !itemId || itemId == null){
			return;
		}
		
		try{
			field = nlapiLookupField('item', itemId, 'custitem_total_royalty_percentage');
			details.field = field;
			response.write(JSON.stringify(details));
		}
		catch(e){
			log('Error getting royalty percent.',true);
			details.field = field;
			response.write(JSON.stringify(details));
		}
		break;
		
	case 'price':
		if(itemId == 'undefined' || !itemId || itemId == null || customerId == null || customerId == '' || customerId =='undefined'){
			return;
		}
		
		var details = getCustomerPrice(itemId, customerId);
		response.write(JSON.stringify(details));
		break;
		
	case 'breakout':
		var cartObj = JSON.parse(request.getBody());
		var pricingPref = nlapiLookupField('customer', customerId, 'custentity_pricing_preference');
		
		//If the customer's pricing preference is breakout pricing, then get the total royalty amount of the cart
		if(pricingPref == 2){
			log('Customer does not have breakout pricing.');
			details = getBreakoutAmount(cartObj);
		}
		//Otherwise, the royalty amount is $0 and not shown in the cart
		else{
			log('Customer does not have breakout pricing.');
			details.field = 0;
			details.hasRoyaltyItem = 'F';
		}
		
		response.write(JSON.stringify(details));
		break;
		
	case 'orderHistory':
		details = getRoyaltyHistory(tranId);
		
		response.write(JSON.stringify(details));
		break;
		
	default:
		details.field = field;
	response.write(JSON.stringify(details));
	}
}

/**
 * Gets the customer's price based on the customer's price level and pricing preference.
 * 
 * @param {itemId} The internal id of the item record
 * @param {customerId} The internal id of the customer
 * @returns {Float} the customer's item price
 */
function getCustomerPrice(itemId, customerId){
	log('Item ID: '+itemId+', Customer ID: '+customerId);
	var defaultMessage = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_sca_no_price_message');
	//the internal ID of the no royalty pricing preference
	var noRoyalty = 3;
	var custPrice = {};
	custPrice.price = -1;
	custPrice.basePrice = -1;
	
	try{
		var itemFields = nlapiLookupField('item', itemId, ['dontshowprice', 'nopricemessage', 'custitem_total_royalty_percentage','baseprice']);
		var dontShowPrice = itemFields.dontshowprice;
		var noPriceMessage = itemFields.nopricemessage;
		
		//If the item doesn't have a "no price message", then use the script parameter pricing message
		if(noPriceMessage == ''){
			noPriceMessage = defaultMessage; 
		}
		
		var basePrice = itemFields.baseprice;
		var royaltyString = itemFields.custitem_total_royalty_percentage;
		var royaltyPercent = prepPercentageValue(royaltyString);

		//Sets the base price of the item to include royalty fees (for all pricing preferences)
		//This is the price shown with the "strikethrough" font on the website
		basePrice = (basePrice * (1 + royaltyPercent)).toFixed(2);
		
		//If the item has the "don't show price" box checked, then return the "no price message"
		//Base price and customer price is still -1 since it won't be shown
		if(dontShowPrice == 'T'){
			custPrice.noPriceMessage = noPriceMessage;
			return custPrice;
		}
		
		//Get the customer's price level and pricing preferencce
		var custFields = nlapiLookupField('customer', customerId, ['pricelevel','custentity_pricing_preference']);
		var priceLevel = custFields.pricelevel;
		var pricingPref = custFields.custentity_pricing_preference;

		//If the customer's price level isn't set and they are not supposed to pay royalty fees, then use the item's base price
		if(!priceLevel && pricingPref == noRoyalty){
			custPrice.price = itemFields.baseprice;
			return custPrice;
		}
		else if(!priceLevel && pricingPref != noRoyalty){
			custPrice.price = basePrice;
			return custPrice;
		}

		var filters = [];
		var columns = [];


		filters.push(new nlobjSearchFilter('pricelevel', 'pricing', 'anyof', priceLevel));
		filters.push(new nlobjSearchFilter('internalidnumber', null, 'equalto', itemId));

		columns.push(new nlobjSearchColumn('unitprice', 'pricing'));

		var results = nlapiSearchRecord('item', null, filters, columns);

		if(!results){
			custPrice.price = basePrice;
			return custPrice;
		}

		var custBasePrice = results[0].getValue(columns[0]);

		var price = (custBasePrice * (1 + royaltyPercent)).toFixed(2);
		
		if(pricingPref != noRoyalty){
			custPrice.price = price;
			custPrice.basePrice = basePrice;
		}
		else{
			custPrice.price = custBasePrice;
			custPrice.basePrice = basePrice;
		}
	}
	catch(e){
		nlapiLogExecution('ERROR', 'Error Getting Price', 'Details: '+e.getDetails()+', ID: '+e.getId()+', Stack Trace: '+e.getStackTrace());
		custPrice.basePrice = -1;
		return custPrice;
	}
    
    return custPrice;
}

function prepPercentageValue(v) {
	if (v === null || v === false || v.length === 0){
		v = "0.0%";
	}
    
	v = v.split('%');
    return ((parseFloat(v[0])) / 100);
}

/**
 * Gets the total royalty amount of the cart
 * 
 * @param {cartObj} The cart object {item: "", amount: ""}, where amount = rate * quantity or extended amount of the cart line
 * @returns {Float} The cart's total royalty fee
 */
function getBreakoutAmount(cartObj){
	var royaltyItem = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_royalty_item');
	var royaltyTotal = 0;
	var royaltyObj = {};
	royaltyObj.field = royaltyTotal;
	royaltyObj.hasRoyaltyItem = 'F';
	
	try{
		log('Cart Object: '+JSON.stringify(cartObj));
		var cartArr = cartObj.items;
		var cartSize = cartArr.length;
		log('cartSize: '+cartSize);
		var lookupItems = [];

		for(var i = 0; i < cartSize; i++){
			var id = cartArr[i].id; 
			
			//If the item int he cart is the royalty item, then set the total royalty as the amount
			//from the royalty item since it has already been added to the cart
			if(id == royaltyItem){
				royaltyTotal = cartArr[i].amount;
				royaltyObj.field = royaltyTotal;
				royaltyObj.hasRoyaltyItem = 'T';
				return royaltyObj;
			}
			
			lookupItems.push(id);
		}
		log('lookupItems: '+lookupItems);

		var filters = [];
		var columns = [];

		filters.push(new nlobjSearchFilter('internalid', null, 'anyof', lookupItems));
		columns.push(new nlobjSearchColumn('custitem_total_royalty_percentage'));
		//log('170');
		var results = nlapiSearchRecord('item', null, filters, columns);
		log('results length: '+results.length);

		var itemRoySearch = [];

		for(var i = 0; i < results.length; i++){
			var item = {};
			var id = results[i].getId();
			var royalty = prepPercentageValue(results[i].getValue('custitem_total_royalty_percentage'));

			log('id: '+id+', royalty: '+royalty);

			item.id = id;
			item.royalty = royalty;

			itemRoySearch.push(item);
		}

		for(var i = 0; i < cartSize; i++){
			for(var j = 0; j < itemRoySearch.length; j++){
				if(cartArr[i].id == itemRoySearch[j].id){
					cartArr[i].royalty = itemRoySearch[j].royalty;					
					cartArr[i].royaltyAmount = parseFloat((cartArr[i].amount - (cartArr[i].amount / (1 + cartArr[i].royalty))).toFixed(2));

					royaltyTotal = royaltyTotal + cartArr[i].royaltyAmount;
				}
			}
		}

		royaltyTotal = royaltyTotal.toFixed(2);
		royaltyObj.field = royaltyTotal;

		log('Cart Array: '+JSON.stringify(cartArr));
		log('Total Royalty: '+royaltyTotal);

		return royaltyObj;
	}
	catch(e){
		nlapiLogExecution('ERROR', 'Error Getting Royalty Total', 'Details: '+e.getDetails()+', ID: '+e.getId()+', Stack Trace: '+e.getStackTrace());
		return royaltyObj;
	}
}

function getRoyaltyHistory(tranId){
	var royaltyItem = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_royalty_item');
	var royaltyTotal = 0;
		
	var royaltyObj = {};
	royaltyObj.field = royaltyTotal;
	royaltyObj.hasRoyaltyItem = 'F';

	var filters = [];
	var columns = [];

	filters.push(new nlobjSearchFilter('internalidnumber', null, 'equalto', tranId));
	filters.push(new nlobjSearchFilter('custbody_pricing_preference', null, 'anyof', '2'));
	filters.push(new nlobjSearchFilter('internalidnumber', 'item', 'equalto', royaltyItem));

	columns.push(new nlobjSearchColumn('amount', null, 'sum'));

	try{
		var results = nlapiSearchRecord('transaction', null, filters, columns);

		if(results && results.length > 0){
			royaltyTotal = results[0].getValue('amount', null, 'sum');
			royaltyObj.hasRoyaltyItem = 'T';
			
			if(royaltyTotal == ''){
				royaltyTotal = 0;
				royaltyObj.hasRoyaltyItem = 'F';
			}
			
			royaltyObj.field = royaltyTotal;
			
			
			return royaltyObj;
		}
		else{
			return royaltyObj;
		}
	}
	catch(e){
		nlapiLogExecution('ERROR', 'Error Getting Royalty Total', 'Details: '+e.getDetails()+', ID: '+e.getId()+', Stack Trace: '+e.getStackTrace());
		return royaltyObj;
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