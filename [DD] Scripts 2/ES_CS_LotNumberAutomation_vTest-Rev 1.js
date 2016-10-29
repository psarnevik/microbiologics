var IN_JOIN = 'inventoryNumber';
var MULTISELECT_DELIM = String.fromCharCode(5);
var LOT_ASSEMBLY_TYPE = '5';
var LOT_INV_TYPE = '1';
var SEARCH_LOT = '83';// '77';
var FLD_EXPIRY_DATE = 'custcol_expiry_dates';
var MULTISELECT_DELIM = String.fromCharCode(5);
var FLD_CATALOG = 'custcol4';

var LOT = 'lot';
var EXPIRY = 'expiry';
var QTY = 'qty';
var NAME = 'catalog';

var SO_OUTPUT = '';

var arrItemLots = new Array();
var arrTransLineCorrected = [];
var arrItemCats = new Array();


/*
 * Page Init, If Sales Order is using "Sales Order Web form", automatically
 * assign a lot number to each line"
 */
function AutoAssignCat()
{
    try 
    {
        var itemLines = nlapiGetLineItemCount('item');
        
        for (var i = 1; i <= itemLines; i++) 
        {
        	nlapiSelectLineItem('item', i);
        	
        	/**
        	 * code added by prasanna- Restricting not to edit "End of Group" Line Item
        	 */
        	var item_id = nlapiGetCurrentLineItemValue('item', 'item');
            //alert('Processing Item ID::'+item_id);
        	
            if(item_id!=0)
            	{
            
            var stCurLotNbrs = nlapiGetCurrentLineItemValue('item', 'serialnumbers');
            var stCurCats = nlapiGetCurrentLineItemValue('item', FLD_CATALOG);
            if (stCurLotNbrs == null || stCurLotNbrs == '') 
            {
            	
                populate_LotNumber();
                nlapiCommitLineItem('item');
            }
            else 
            {
                if (stCurCats == null || stCurCats == '') 
                {
                    populate_Catalogs();
                    nlapiCommitLineItem('item');
                }
            }
            	}
        }
    } 
    catch (e) 
    {
        var errorText = 'UNEXPECTED ERROR: \n\n Error Details: ' + e.toString();
        nlapiSendEmail(-5, 'esther@elimsolutions.ca', 'Error on script running: ES_CS_LotNumberAutomation.js.', errorText, null, null, null);
        
        return;
    }
    
}

/* This will set the LOT number when the item is changed */
function postSourcing_AutomateSerial(stType, stName)
{

    if (stType == 'item' && stName == 'item') 
    {
        populate_LotNumber();
    }
    
}

function populate_LotNumber(bQtyEdit)
{
    var stLocation = nlapiGetFieldValue('location');
    
    var stItem = nlapiGetCurrentLineItemValue('item', 'item');
    var iQty = nlapiGetCurrentLineItemValue('item', 'quantity');
    var stItemType = nlapiGetCurrentLineItemValue('item', 'custcol_item_type');
    
    //alert('Location:'+stLocation+'\nItem::'+stItem+'\nQuantity::'+iQty+'\nItem Type::'+stItemType);
    
    if (stItem == '' || stItem == null) return;
    
    if (stItemType != LOT_ASSEMBLY_TYPE && stItemType != LOT_INV_TYPE) return;
    
    if (stLocation == '' || stLocation == null) 
    {
        alert('Please select a location first in order to automate the population of LOT numbers.');
        return;
    }
    
    if (arrItemLots[stItem] == null || arrItemLots[stItem] == undefined) 
    {
        retrieveItemLots(stItem);
    }
    if (arrItemLots[stItem][stLocation] == null || arrItemLots[stItem][stLocation] == undefined) 
    {
        retrieveItemLots(stItem);
    }
    
    if (iQty == 0 || iQty == '' || iQty == null) 
    {
        nlapiSetCurrentLineItemValue('item', 'serialnumbers', '', true, true);
        nlapiSetCurrentLineItemValue('item', FLD_EXPIRY_DATE, '', true, true);
        return;
    }
    
    var stCurLotNbrs = nlapiGetCurrentLineItemValue('item', 'serialnumbers');
    
    var stDfltLotNbrs = '';
    var arrLotNbrs = new Array();
    var iQty = parseInt(nlapiGetCurrentLineItemValue('item', 'quantity'));
    var iCnt = 0;
    var arrExpiryDates = new Array();
    if (arrItemLots[stItem][stLocation] != null && arrItemLots[stItem][stLocation] != undefined) 
    {
        for (var idx = 0; idx < arrItemLots[stItem][stLocation].length && iCnt < iQty; idx++) 
        {
            var stLotNbr = arrItemLots[stItem][stLocation][idx][LOT];
            
            //alert('Lot Number::'+idx+':::'+stLotNbr);
            
            var stExpiryDate = arrItemLots[stItem][stLocation][idx][EXPIRY];
            var iQtyAvailable = arrItemLots[stItem][stLocation][idx][QTY];
            if (isNaN(iQtyAvailable)) 
            {
                iQtyAvailable = 0;
            }
            
            var iCurQty = (iQty - iCnt);
            if (iQtyAvailable < iCurQty) 
            {
                iCurQty = iQtyAvailable;
            }
            if (stLotNbr != null && stLotNbr != '') 
            {
                if (iCnt > 0 && iCurQty > 0) 
                {
                    stDfltLotNbrs += '\n';// MULTISELECT_DELIM;
                }
                if (iQty == 1) 
                {
                    stDfltLotNbrs += stLotNbr;
                    arrLotNbrs.push(stLotNbr);
                }
                else 
                {
                    stDfltLotNbrs += stLotNbr + '(' + iCurQty + ')';
                    arrLotNbrs.push(stLotNbr + '(' + iCurQty + ')');
                }
                iCnt += iCurQty;
                arrExpiryDates.push(stExpiryDate);
            }
            
        }
        
        //alert('iCNT::'+iCnt+'||iQty::'+iQty+'||bQtyEdit::'+bQtyEdit);
        if (iCnt > 0 && (iCnt == iQty || !bQtyEdit)) 
        {
            if (iQty > 1) 
            {
                // var els = document.forms['item_form'].elements;
                // els['serialnumbersvalid'].value = 'T';
                // if (els['lineindex'].value == 1)
                // els['serialnumbers'].value = stDfltLotNbrs;
                // deleteAllSelectOptions(els['serialnumbers']);
                var stLots = '';
                for (idxLot in arrLotNbrs) 
                {
                    if (stLots != '') 
                    {
                        stLots += MULTISELECT_DELIM;
                    }
                    stLots += arrLotNbrs[idxLot];
                    // addMultiSelectValue(els['serialnumbers'],
                    // arrLotNbrs[idxLot], arrLotNbrs[idxLot]);
                }
                setSerials(stLots, stLots, true);
                // document.forms[0].elements['validationpending'].value='F';
            }
            else 
            {
            	
                nlapiSetCurrentLineItemValue('item', 'serialnumbers', stDfltLotNbrs, true, true);
               // alert('Lot Numbers Set::'+stDfltLotNbrs);
            		
            }
            
            nlapiSetCurrentLineItemValue('item', FLD_EXPIRY_DATE, arrExpiryDates.toString(), false, true);
            nlapiSetCurrentLineItemValue('item', FLD_CATALOG, arrItemLots[stItem][stLocation][0][NAME], false, true);
            return;
        }
        else 
        {
            if (iCnt > 0) 
            {
                setTimeout(function()
                {
                    populate_LotNumber();
                }, 250);
            }
        }
        
        // LOT ITEM COMMITMENT change
        //        if (iCnt < iQty)
        //        {
        //            var currentLineNo =  nlapiGetCurrentLineItemIndex('item');
        //            
        //            arrTransLineCorrected.push(currentLineNo + '-' + iQty + '-' + iCnt);
        //            
        //            // !!!change the qty without triggering field change event !!!
        //            nlapiSetCurrentLineItemValue('item', 'quantity', iCnt, false, true);
        //            
        //        }
    }
    else 
    {
        populate_Catalogs();
    }
    
    nlapiSetCurrentLineItemValue('item', 'serialnumbers', '', false, true);
    nlapiSetCurrentLineItemValue('item', FLD_EXPIRY_DATE, '', false, true);
}

/* This will set the LOT number when the quantity is changed. */
function fieldChanged_Populate_LotNumber(stType, stName)
{

    if (stType == 'item' && stName == 'quantity') 
    {
        populate_LotNumber(true);
    }
    
}

function validateLine_PopulateExpiryDate(stType, stName)
{
    var stExpiryDate = nlapiGetCurrentLineItemValue('item', FLD_EXPIRY_DATE);
    var stLotNumbers = nlapiGetCurrentLineItemValue('item', 'serialnumbers');
    
    if (stLotNumbers != null && stLotNumbers != '' && stLotNumbers != undefined) 
    {
        populate_ExpiryDates();
    }
    return true;
}

function populate_ExpiryDates()
{
    nlapiSetCurrentLineItemValue('item', FLD_EXPIRY_DATE, '', false, true);
    
    var stSerialNumbers = nlapiGetCurrentLineItemValue('item', 'serialnumbers');
    var stItem = nlapiGetCurrentLineItemValue('item', 'item');
    var stLocation = nlapiGetFieldValue('location');
    
    if (stSerialNumbers != null && stSerialNumbers != '' && stSerialNumbers != undefined && stItem != null &&
    stItem != '' &&
    stItem != undefined &&
    stLocation != null &&
    stLocation != '' &&
    stLocation != undefined) 
    {
    
        if (arrItemLots[stItem] == null || arrItemLots[stItem] == undefined) 
        {
            retrieveItemLots(stItem);
        }
        if (arrItemLots[stItem][stLocation] == null || arrItemLots[stItem][stLocation] == undefined) 
        {
            retrieveItemLots(stItem);
        }
        
        if (arrItemLots[stItem][stLocation] != null && arrItemLots[stItem][stLocation] != undefined) 
        {
            stSerialNumbers = stSerialNumbers.replace(/(\([0-9]*\))/g, '');
            var arrSerials = stSerialNumbers.split(MULTISELECT_DELIM);
            var arrExpiryDates = new Array();
            
            for (var idx = 0; idx < arrItemLots[stItem][stLocation].length; idx++) 
            {
                var stLotNbr = arrItemLots[stItem][stLocation][idx][LOT];
                var stExpiryDate = arrItemLots[stItem][stLocation][idx][EXPIRY];
                if (isInArray(arrSerials, stLotNbr)) 
                {
                    if (!isInArray(arrExpiryDates, stExpiryDate)) 
                    {
                        arrExpiryDates.push(stExpiryDate);
                    }
                }
                
            }
            
            if (arrExpiryDates.length > 0) 
            {
                nlapiSetCurrentLineItemValue('item', FLD_EXPIRY_DATE, arrExpiryDates.toString(), false, true);
            }
        }
        
    }
}


function populate_Catalogs()
{
    nlapiSetCurrentLineItemValue('item', FLD_CATALOG, '', false, true);
    
    var stItem = nlapiGetCurrentLineItemValue('item', 'item');
    
    if (stItem != null && stItem != '' && stItem != undefined) 
    {
        if (arrItemCats[stItem] == null || arrItemCats[stItem] == undefined) 
        {
            retrieveItemCatalog(stItem);
        }
        
        if (arrItemCats[stItem] != null && arrItemCats[stItem] != undefined) 
        {
            nlapiSetCurrentLineItemValue('item', FLD_CATALOG, arrItemCats[stItem][0][NAME], false, true);
        }
    }
}

function isInArray(arr, item)
{
    for (i in arr) 
    {
        if (arr[i] == item) return true;
    }
    
    return false;
}

function retrieveItemLots(stItem)
{
    if (arrItemLots[stItem] == null || arrItemLots[stItem] == undefined) 
    {
        arrItemLots[stItem] = new Array();
    }
    
    var arrFilters = [new nlobjSearchFilter('internalid', '', 'anyof', [stItem])];
    
    var arrResults = nlapiSearchRecord('item', SEARCH_LOT, arrFilters);
    
    if (arrResults) 
    {
        if (arrResults.length > 0) 
        {
        	//alert('Results Length::'+arrResults.length);
            for (var idx = 0; idx < arrResults.length; idx++) 
            {
                var stLoc = arrResults[idx].getValue('location', IN_JOIN);
                var stLotNbr = arrResults[idx].getValue('inventorynumber', IN_JOIN);
                var stExpiryDate = arrResults[idx].getValue('expirationdate', IN_JOIN);
                var iQtyAvailable = parseInt(arrResults[idx].getValue('quantityavailable', IN_JOIN));
                var itemName = arrResults[idx].getValue('itemid');
                
                if (isNaN(iQtyAvailable)) 
                {
                    iQtyAvailable = 0;
                }
                
                if (itemName.indexOf(":") > -1) 
                {
                    var arrItemName = itemName.split(':');
                    itemName = arrItemName[arrItemName.length - 1];
                }
                
                if (arrItemLots[stItem][stLoc] == null) 
                {
                    arrItemLots[stItem][stLoc] = new Array();
                }
                var arrLot = new Array();
                arrLot[LOT] = stLotNbr;
                arrLot[EXPIRY] = stExpiryDate;
                arrLot[QTY] = iQtyAvailable;
                arrLot[NAME] = itemName;
                arrItemLots[stItem][stLoc].push(arrLot);
            }
        }
        else
    	{
    		//alert('No Lots found for this Item::'+[stItem]);
    	}
    }
   
}


function retrieveItemCatalog(stItem)
{
    if (arrItemCats[stItem] == null || arrItemCats[stItem] == undefined) 
    {
        arrItemCats[stItem] = new Array();
    }
    
    var arrFilters = [new nlobjSearchFilter('internalid', null, 'anyof', [stItem])];
    
    var arrResults = nlapiSearchRecord('item', null, arrFilters, [new nlobjSearchColumn('itemid')]);
    
    if (arrResults) 
    {
        if (arrResults.length > 0) 
        {
            for (var idx = 0; idx < arrResults.length; idx++) 
            {
                var itemName = arrResults[idx].getValue('itemid');
                
                if (itemName.indexOf(":") > -1) 
                {
                    var arrItemName = itemName.split(':');
                    itemName = arrItemName[arrItemName.length - 1];
                }
                
                if (arrItemCats[stItem] == null) 
                {
                    arrItemCats[stItem] = new Array();
                }
                
                var arrLot = new Array();
                arrLot[NAME] = itemName;
                arrItemCats[stItem].push(arrLot);
            }
        }
    }
}

function processItemGroup()
{
    if (nlapiIsLineItemChanged('item')) 
    {
        alert('Please make sure to commit/cancel the current line because it is marked as changed before proceeding.');
        return;
    }
    
    alert('This will loop through item groups. Please wait for the confirmation message before changing anything.');
    
    var iLineCnt = nlapiGetLineItemCount('item');
    
    var iCount = 0;
    var bInGroup = false;
    
    for (var x = 1; x <= iLineCnt; x++) 
    {
        var stItemType = nlapiGetLineItemValue('item', 'itemtype', x);
        if (stItemType == 'Discount' || stItemType == 'Markup' || stItemType == 'Description' ||
        stItemType == 'Subtotal' ||
        stItemType == 'Kit' ||
        stItemType == 'Payment' ||
        stItemType == 'Group' ||
        stItemType == 'EndGroup' ||
        stItemType == null) 
        {
            if (stItemType == 'Group') 
            {
                bInGroup = true;
                continue;
            }
            if (stItemType == 'EndGroup') 
            {
                bInGroup = false;
                continue;
            }
            continue;
        }
        
        if (bInGroup) 
        {
            nlapiSelectLineItem('item', x);
            populate_LotNumber();
            nlapiCommitLineItem('item');
        }
    }
    
    alert('Item group processing is now complete.');
}

function setSerials(s, i, multiseldone)
{
    var els, fld, displayfld, labelsfld;
    els = document.forms.item_form.elements;
    fld = document.forms.item_form.elements.serialnumbers;
    displayfld = els.serialnumbers_display;
    displayfld.style.color = "000000";
    labelsfld = els.serialnumbers_labels;
    if (multiseldone) 
    {
        updateMultiSelectValue(fld, displayfld, i, s, labelsfld);
        fld.onchange();
    }
    else 
    {
        NLPopupSelect_updateSelection(i, s, true);
    }
}


/**
 * This function will log all the details wherever needed
 * @param details
 */
function log(details)
{
	nlapiLogExecution('debug', 'Auto Assign Catalog', details);
}