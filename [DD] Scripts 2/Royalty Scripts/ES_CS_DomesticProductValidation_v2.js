/**
 * Copyright (c) 2012 Elim Solutions, Inc.
 * 50 McIntosh Drive Suite 110 Markham, Ontario L3R 9T3 Canada.
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Elim Solutions, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Elim Solutions.
 * 
 */

/**
 * $Id: ES_CS_DomesticProductValidation_v2.js 676 2015-05-21 15:36:55Z richard@elimsolutions.ca $ 
 */

/**
 * 
 * Author: Daniel Arenas
 * Email: daniel@elimsolutions.ca
 * 
 * Modified by: Richard C.
 * Email: richard@elimsolutions.ca
 * patch#20150520:
 * like the "HAZ" for "HAZARDOUS", now need new "GMO" used for new "GMO â€“ GENETICALLY MODIFIED MICRO-ORGANISMS"
 * created getSpecifiedProductionInfoType()
 * updated validateLine_checkProduct(), saveRecord_checkProduct()
 * 
 */


// ##### START CONSTANT VARIABLES #####
// Search String 
var MATCH_DOMESTIC = /DOMESTIC/gi;
var MATCH_HAZARDOUS = /HAZARDOUS/gi;
var MATCH_GMO = /GMO/gi;

// Sublist - Item
var SUBLIST_ITEM_ID = 'item';
var SUBLIST_ITEM_ITEM = 'item';
var SUBLIST_ITEM_PROD_INFO_TYPE = 'custcol_prod_info_type';
var SUBLIST_ITEM_PROD_INFO = 'custcol7'; 
var SUBLIST_ITEM_OVERRIDE_DOMESTIC = 'custcol_override_domestic'; 

// Body Fields
var SHIP_COUNTRY = 'shipcountry';

// Custom General Preference
var VALID_DOMESTIC_CODE = getCustomGeneralPreference('custscript_override_ship_domestic_code');

// ##### END CONSTANT VARIABLES #####

function pageInit_checkProduct(type)
{
	var functionName = 'pageInit_checkProduct';
	var processStr = '';
	
	try
	{
		nlapiDisableLineItemField(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO, true);
	}
		catch(ex)
	{
		
	}
}

function lineInit_checkProduct(type)
{
	var functionName = 'lineInit_checkProduct';
	var processStr = '';
	
	var isTypeItem = (!isNullOrEmpty(type) && type == 'item') ? true : false;
	
	try
	{
		nlapiSetCurrentLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_OVERRIDE_DOMESTIC, '');
	}
		catch(ex)
	{
		
	}
}


function validateLine_checkProduct(type)
{
	var functionName = 'validateLine_checkProduct';
	var isValidLine = true;
	
	try
	{
		var stProductInfo = nlapiGetCurrentLineItemText(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO);
		var isMatchDomestic = (!isNullOrEmpty(stProductInfo.match(MATCH_DOMESTIC))) ? true : false;
		
		if (isMatchDomestic)
		{
			var stCustomerShipTo = nlapiGetFieldValue(SHIP_COUNTRY);
			var stDomesticCode = nlapiGetCurrentLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_OVERRIDE_DOMESTIC);
			var isValidOverrideDomesticCode = (!isNullOrEmpty(stDomesticCode) && stDomesticCode == VALID_DOMESTIC_CODE) ? true : false;
			var isShipToUSPR = (!isNullOrEmpty(stCustomerShipTo) && stCustomerShipTo == 'US' && stCustomerShipTo == 'PR') ? true : false;
/*			
			if (!isShipToUSPR)
			{
				if (!isValidOverrideDomesticCode)
				{
					alert('This item is for domestic use only.' +'\n' + 'Please enter override code to allow domestic only shipment.');
					isValidLine = false;
				}				
			}
*/
		}
		
		//var setProdInfo = (isMatchHazardous) ? nlapiSetCurrentLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO_TYPE, 'HAZ') : nlapiSetCurrentLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO_TYPE, '');

		var stProdInfoType =getSpecifiedProductionInfoType(stProductInfo);		
		nlapiLogExecution('DEBUG', 'getSpecifiedProductionInfoType ', 'stProdInfoType =' + stProdInfoType);
		var setProdInfo = nlapiSetCurrentLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO_TYPE, stProdInfoType);
		
	}
		catch(ex)
	{
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		alert(errorStr);
		isValidLine = false;
	}
	return true;
}


function saveRecord_checkProduct(type)
{
	var functionName = 'saveRecord_checkProduct';
	var processStr = '';
	var isSaveRecord = true;

	var arrItemsWithError = [];
	var arrLinesWithError = [];
	var intLineCount = nlapiGetLineItemCount(SUBLIST_ITEM_ID);
	
	try
	{
		for (var i = 1; i <= intLineCount; i++)
		{
			var stProductInfo = nlapiGetLineItemText(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO, i);
			var stItemName = nlapiGetLineItemText(SUBLIST_ITEM_ID, SUBLIST_ITEM_ITEM, i);

			var isMatchDomestic = (!isNullOrEmpty(stProductInfo.match(MATCH_DOMESTIC))) ? true : false;
			
			if (isMatchDomestic)
			{
				var stCustomerShipTo = nlapiGetFieldValue(SHIP_COUNTRY);
				var stDomesticCode = nlapiGetLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_OVERRIDE_DOMESTIC, i);
				var isShipToUSPR = (!isNullOrEmpty(stCustomerShipTo) && stCustomerShipTo == 'US' && stCustomerShipTo == 'PR') ? true : false;
				//var isValidOverrideDomesticCode = (!isNullOrEmpty(stDomesticCode) && stDomesticCode == VALID_DOMESTIC_CODE) ? true : false;
				var hasDomesticCode = (!isNullOrEmpty(stDomesticCode)) ? true : false;
				
				if (!isShipToUSPR)
				{
					if (!hasDomesticCode)
					{
						arrItemsWithError.push(stItemName);
						arrLinesWithError.push(i);
					}
				}
			}
			
			//var setProdInfo = (isMatchHazardous) ? nlapiSetLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO_TYPE, i, 'HAZ') : nlapiSetLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO_TYPE, i, '');

			var stProdInfoType =getSpecifiedProductionInfoType(stProductInfo);
			var setProdInfo = nlapiSetCurrentLineItemValue(SUBLIST_ITEM_ID, SUBLIST_ITEM_PROD_INFO_TYPE, stProdInfoType);
		}
		
		var arrItemsWithErrorTotal = (!isNullOrEmpty(arrItemsWithError)) ? arrItemsWithError.length : 0;
		var isAlertError = (arrItemsWithErrorTotal > 0) ? true : false;

/*		
		if (isAlertError)
		{
			var arrItemsWithErrorTotal = (!isNullOrEmpty(arrItemsWithError)) ? arrItemsWithError.length : 0;
			var stMsg = (arrItemsWithErrorTotal > 1) ? 'are' : 'is';
			var stErrorMsg = 'The item(s) ' + arrItemsWithError.toString() + ' at Transaction item line(s) #' + arrLinesWithError.toString() + ' ' + ' for domestic use only.' + '\n' + 'Please enter override code to allow domestic only shipment.' ;
			alert(stErrorMsg);
			isSaveRecord = false;				 
		}
*/
	}
		catch(ex)
	{
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		alert(errorStr);
		isSaveRecord = false;
	}

	return true;
}
/*
 * patch#20150520
 * based on Product Info, find if it has certain keywords.
 * if so, then set specified Production Info Type
 */
function getSpecifiedProductionInfoType(stProductInfo){
	if(isNullOrEmpty(stProductInfo)) return "";
	//------------------------------------------check any match
	var isMatchHazardous = (!isNullOrEmpty(stProductInfo.match(MATCH_HAZARDOUS))) ? true : false;
	var isMatchGMO = (!isNullOrEmpty(stProductInfo.match(MATCH_GMO))) ? true : false;
	//------------------------------------------set Production Info Type accordingly	
	var stProdInfoType = "";
	if(isMatchHazardous) stProdInfoType = 'HAZ';
	else if(isMatchGMO) stProdInfoType = 'GMO';
	//------------------------------------------return
	return stProdInfoType;
}

// ===

function isNullOrEmpty(valueStr)
{
	return(valueStr == null || valueStr == "" || valueStr == undefined); 
}

function getCustomGeneralPreference(stScriptIdParam)
{
	var ctxObj = nlapiGetContext();
	var genPrefValue = '';

	try 
	{
		genPrefValue = ctxObj.getSetting('PREFERENCE', stScriptIdParam);
	}
		catch(ex)
	{
		genPrefValue = '';
	}
	return genPrefValue;
}
