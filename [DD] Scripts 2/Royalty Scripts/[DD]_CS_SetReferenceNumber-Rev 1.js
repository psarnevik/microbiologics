var SET_CATNBRS = new Object();
var Suitelet_WebhelperURL = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=297&deploy=1&compid=915960_SB3&h=ec3b77d0e4a535e279f1';

function postSourcing_setRefNumber(stType, stField)
{
	if(stType == 'item' && stField == 'item')
	{
		var stItemId = nlapiGetCurrentLineItemValue('item','item');
		
		if(stItemId != null && stItemId != '')
		{
			var Suiteleturl 	 = Suitelet_WebhelperURL+'&task=itemType&itemId='+stItemId;
			var SuiteletResponse = JSON.parse(nlapiRequestURL(Suiteleturl).body);
			var stRecType 		 = SuiteletResponse.field;//nlapiLookupField('item',stItemId,'recordType');
			nlapiLogExecution('DEBUG', 'postSourcing_setRefNumber ', 'stRecType =' + stRecType);
			
			if(stRecType == 'itemgroup')
			{
				var stCatNumber = nlapiGetCurrentLineItemValue('item','custcol4');
				SET_CATNBRS[stItemId] = stCatNumber;
				nlapiSetCurrentLineItemValue('item','custcol_set_ref',stCatNumber);
			}
		}
	}
}

function recalc_setItemCatalogNbr(stType)
{
	if(stType == 'item')
	{
		var iCnt = nlapiGetLineItemCount('item');
		for(var idx=1; idx <= iCnt; idx++)
		{
			var stItemId = nlapiGetLineItemValue('item','item', idx);
			var stItemType = nlapiGetLineItemValue('item','itemtype', idx);
			var stCurCatNbr = nlapiGetLineItemValue('item','custcol4', idx);
			if(stItemType != null && stItemType != '')
			{
				stItemType = stItemType.toUpperCase();
			}
			if(stItemType == 'GROUP' && (stCurCatNbr == '' || stCurCatNbr == null))
			{
				if(SET_CATNBRS[stItemId])
				{
					nlapiSetLineItemValue('item','custcol4',idx,SET_CATNBRS[stItemId]);
				}
			}
		}
	}
}


function saveRecord_setPickingAmount()
{
	var iCnt = nlapiGetLineItemCount('item');
	for(var idx=1; idx <= iCnt; idx++)
	{
		var stAmt = nlapiGetLineItemValue('item','amount',idx);
		nlapiSetLineItemValue('item','custcol_picking_ticket_amount',idx,stAmt);
	}
	 	
	return true;
}