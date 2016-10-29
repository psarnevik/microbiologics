/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Mar 2013     Richard Cai
 *
 *Rev-1  	  24 Oct,2016     Prasanna Kumar	Commented line number 29,30,31 and 32
 *
 *
 */

//var CUST_REC_CONTROL_ITEMS='customrecord_control_items';
//var SUBLIST_OCI_ID = 'recmachcustrecord_oci_sales_order';
var GLB_LICENSE_TYPE_EXPORT=1;
var GLB_LICENSE_TYPE_IMPORT=2;
var GLB_COUNTRYCODELISTARR;
var GLB_TYPE;

function soControllItemsClientPageInit(type, name){
    var functionName="soControllItemsClientPageInit";
	var $LT = ELIM.LIST.MBL.LICENSETYPE;
	GLB_TYPE=type;
    GLB_LICENSE_TYPE_EXPORT=$LT.LICENSE_TYPE_EXPORT;
    GLB_LICENSE_TYPE_IMPORT=$LT.LICENSE_TYPE_IMPORT;
    GLB_COUNTRYCODELISTARR=loadCountryCodeListArr();
    
    disableOCIsublistColFields(true);
    
   // $("#customsublist2txt").hide();
   // $("#recmachcustrecord_oci_sales_ordertxt").click();
    
	//$('#tbl_recmachcustrecord_oci_sales_order_insert').hide();
	//$("input[value=Done]").closest('table').show();
}

function soControllItemsClientFieldChange(type, name, linenum){
    var functionName="soControllItemsClientFieldChange";
	var $ITEM = ELIM.CONSTANT.MBL.ITEM;
	var $SO = ELIM.CONSTANT.MBL.SALESORDER;
    
    if(type == null & name == $SO.SHIPCOUNTRY)
    {
        soControllItemsClientRecalc($ITEM.ID);
    }
}

function soControllItemsClientValidateDelete(type, name){
	//deleteAllControlledItems();
	//alert("All Controlled Items have been sucessfully deleted.");
    return true;
}

function soControllItemsClientSaveRecord(){
	var functionname ="soControllItemsClientSaveRecord";
	var $ITEM = ELIM.CONSTANT.MBL.ITEM;
	var $OCI = ELIM.CONSTANT.MBL.ORDERCONTROLLEDITEM;
	var SUBLIST_OCI_ID = 'recmach' + $OCI.SALESORDER;
    soControllItemsClientRecalc($ITEM.ID);
    var soId = nlapiGetRecordId();
    
	if (GLB_TYPE == 'create' || GLB_TYPE == 'copy') {
	    alterIfOCIexists();	
	}
	if (GLB_TYPE == 'edit') {
		var roleIdArr=null;
		var context = nlapiGetContext();
		var strRoleId = context.getSetting('SCRIPT', 'custscript_es_role_id');
		if (!isNOE(strRoleId)){
			roleIdArr = strRoleId.split(/,/g);
			removeDupArrElement(roleIdArr);
			removeEmptyArrElement(roleIdArr);
			var userRoleId = nlapiGetRole();
			if( !inArray(userRoleId, roleIdArr) ) {
				alterIfOCIexists();
			}
		}
	}
    disableOCIsublistColFields(false);
    return true;	
}

function soControllItemsClientRecalc(type){
    var functionName="soControllItemsClientRecalc"; 

    //console.log(functionName+"||type: "+type);
	var $OCI = ELIM.CONSTANT.MBL.ORDERCONTROLLEDITEM;
	var SUBLIST_OCI_ID = 'recmach' + $OCI.SALESORDER;
	var $ITEM = ELIM.CONSTANT.MBL.ITEM;
	var $SO = ELIM.CONSTANT.MBL.SALESORDER;
	
    if(type==$ITEM.ID){
    	var location = nlapiGetFieldValue("location");
        var shipcountry=nlapiGetFieldValue($SO.SHIPCOUNTRY);
        if( isNOE(shipcountry) ) return true;
        if(shipcountry == "US") return true;
        if(location == "2" || location == "7") return true; // Do not process for Lexington Locations
        //console.log("GLB_COUNTRYCODELISTARR: "+JSON.stringify(GLB_COUNTRYCODELISTARR));
        if( isNOE(GLB_COUNTRYCODELISTARR) ) return true;
        if( GLB_COUNTRYCODELISTARR.length==0 ) return true;        

        disableOCIsublistColFields(false);
        
        var soShipCountryIdx=findCountryCodeIndexInt(shipcountry,GLB_COUNTRYCODELISTARR);   
        
        var iItemLineCount = nlapiGetLineItemCount($ITEM.ID);

        var objItems = new Object();
        var arrItems = new Array();
        var arrItemsToDelIdx = new Array();
        for(var idx=1; idx <= iItemLineCount; idx++)
        {
            var itemId = nlapiGetLineItemValue($ITEM.ID, $ITEM.ID, idx);
            var quantity = parseInt(nlapiGetLineItemValue($ITEM.ID, $ITEM.QUANTITY, idx));
            if(isNaN(quantity)) quantity = 0;
            var isclosed = nlapiGetLineItemValue($ITEM.ID, "isclosed", idx) == "T";

            if(objItems[itemId] == null || objItems[itemId] == undefined)
            {
                objItems[itemId] = new Object();
                objItems[itemId].quantity = 0;
                objItems[itemId].is_export = false;
                objItems[itemId].is_import = false;
                objItems[itemId].has_export_line = false;
                objItems[itemId].has_import_line = false;
                objItems[itemId].isclosed = isclosed;
	            if(!isclosed)
	            {
	            	objItems[itemId].quantity += quantity;
	            }
                arrItems.push(itemId);
            }
        }
        
        var arrFilters = new Array();
        arrFilters.push(new nlobjSearchFilter("internalid", null, "anyof", arrItems));
        
        var arrColumns = new Array();
        arrColumns.push(new nlobjSearchColumn("internalid"));
        arrColumns.push(new nlobjSearchColumn($ITEM.EXPORTCONTROL));
        arrColumns.push(new nlobjSearchColumn($ITEM.IMPORTCONTROLCOUNTRY));
        
        var arrResults = nlapiSearchRecord($ITEM.ID, null, arrFilters, arrColumns);
        
        for(var idx=0; idx < arrResults.length; idx++)
        {
            var stItemId = arrResults[idx].getValue("internalid");
            var bIsExportControl = arrResults[idx].getValue($ITEM.EXPORTCONTROL) == "T";
            var stCountries = arrResults[idx].getValue($ITEM.IMPORTCONTROLCOUNTRY);
            var arrCountries = new Array();
            if(stCountries != "" && stCountries != null)
            {
                arrCountries = stCountries.split(",");
            }
            
            if( inArray(soShipCountryIdx, arrCountries) ){
                objItems[stItemId].is_import = true;
            }
            objItems[stItemId].is_export = bIsExportControl;
            
            if(!objItems[stItemId].is_export && !objItems[stItemId].is_import)
            {
                objItems[stItemId].quantity = 0;
            }
        }
        
        var iOCILineCount = nlapiGetLineItemCount(SUBLIST_OCI_ID);
        var iOCILineCount_old = iOCILineCount;
        nlapiCancelLineItem(SUBLIST_OCI_ID);
        
        for(var idx=iOCILineCount; idx > 0; idx--)
        {
            var stCurItemId = nlapiGetLineItemValue(SUBLIST_OCI_ID, $OCI.ITEM, idx);
            var stType = nlapiGetLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSETYPE, idx);
            //var stLicense = nlapiGetLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSE, idx);
            var stLicenseNum = nlapiGetLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSESHARP, idx);

            if(objItems[stCurItemId] != undefined && objItems[stCurItemId] != null)
            {
            	if(objItems[stCurItemId].isclosed)
            	{
                    if(stType == GLB_LICENSE_TYPE_IMPORT)
                    {
                        objItems[stCurItemId].has_import_line = true;
                    }
                    else if(stType == GLB_LICENSE_TYPE_EXPORT)
                    {
                        objItems[stCurItemId].has_export_line = true;
                    }
                    
            		if(!isNOE(stLicenseNum))
            		{
                                nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                                nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, 0);
                                nlapiCommitLineItem(SUBLIST_OCI_ID);
            		}
                    else
                    {
                        nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                    	nlapiRemoveLineItem(SUBLIST_OCI_ID);////remove if the item has import license, qty<=0, and is not closed
                    }
            	}
            	else
            	{
                    if(stType == GLB_LICENSE_TYPE_IMPORT)
                    {
                        if(objItems[stCurItemId].is_import)
                        {
                            if(objItems[stCurItemId].quantity > 0)
                            {
                                nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                                nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, objItems[stCurItemId].quantity);
                                nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.COUNTRY, soShipCountryIdx);
                                nlapiCommitLineItem(SUBLIST_OCI_ID);
                                objItems[stCurItemId].has_import_line = true;
                            }
                            else
                            {
                                nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                            	nlapiRemoveLineItem(SUBLIST_OCI_ID);////remove if the item has import license, qty<=0, and is not closed
                            }
                        }
                        else
                        {
                            nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                            nlapiRemoveLineItem(SUBLIST_OCI_ID);////remove if the item has no import license now, even previously it had
                        }
                    }

                    if(stType == GLB_LICENSE_TYPE_EXPORT)
                    {
                        if(objItems[stCurItemId].is_export)
                        {
                            if(objItems[stCurItemId].quantity > 0)
                            {
                                nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                                nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, objItems[stCurItemId].quantity);
                                nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.COUNTRY, soShipCountryIdx);
                                nlapiCommitLineItem(SUBLIST_OCI_ID);
                                objItems[stCurItemId].has_export_line = true;
                            }
                            else
                            {
                                nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                        		nlapiRemoveLineItem(SUBLIST_OCI_ID);////remove if the item has export license, qty<=0, and is not closed
                            }
                        }
                        else
                        {
                            nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                            nlapiRemoveLineItem(SUBLIST_OCI_ID);////remove if the item has no export license now, even previously it had
                        }
                    }
            	}
            }
            else
            {
            	if(!isNOE(stLicenseNum)){////when related item is not found for this OCI, keep it if it has license assigned OR delete it if no license
                    nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, 0);
                    nlapiCommitLineItem(SUBLIST_OCI_ID);
            	}
            	else{
                    nlapiSelectLineItem(SUBLIST_OCI_ID, idx);
            		nlapiRemoveLineItem(SUBLIST_OCI_ID);
            	}
            }
            //if(iOCILineCount_old!=iOCILineCount) nlapiCommitLineItem(SUBLIST_OCI_ID);
        }
        
        for(var stItemId in objItems)
        {
            if(objItems[stItemId].quantity > 0)
            {
                if(objItems[stItemId].is_export && !objItems[stItemId].has_export_line)////when no exp OCI exists for exp type item, create exp OCI
                {
                    nlapiSelectNewLineItem(SUBLIST_OCI_ID);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.ITEM, stItemId, false, true);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSETYPE, GLB_LICENSE_TYPE_EXPORT, false, true);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, objItems[stItemId].quantity, false, true);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.COUNTRY, soShipCountryIdx, false, true);
                    //console.log("stItemId: "+stItemId+"||GLB_LICENSE_TYPE_EXPORT: "+GLB_LICENSE_TYPE_EXPORT+"||objItems[stItemId].quantity: "+objItems[stItemId].quantity);
                    nlapiCommitLineItem(SUBLIST_OCI_ID);
                }
                if(objItems[stItemId].is_import && !objItems[stItemId].has_import_line)////when no imp OCI exists for imp type item, create imp OCI
                {
                    nlapiSelectNewLineItem(SUBLIST_OCI_ID);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.ITEM, stItemId, false, true);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSETYPE, GLB_LICENSE_TYPE_IMPORT, false, true);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, objItems[stItemId].quantity, false, true);
                    nlapiSetCurrentLineItemValue(SUBLIST_OCI_ID, $OCI.COUNTRY, soShipCountryIdx, false, true);
                   //console.log("stItemId: "+stItemId+"||GLB_LICENSE_TYPE_EXPORT: "+GLB_LICENSE_TYPE_EXPORT+"||objItems[stItemId].quantity: "+objItems[stItemId].quantity+"||soShipCountryIdx: "+soShipCountryIdx);
                    nlapiCommitLineItem(SUBLIST_OCI_ID);
                }
            }
        }

        disableOCIsublistColFields(true);
    }
}

function disableOCIsublistColFields(isDisable){
	var $OCI = ELIM.CONSTANT.MBL.ORDERCONTROLLEDITEM;
	var SUBLIST_OCI_ID = 'recmach' + $OCI.SALESORDER;
	if( isNOE(isDisable) ) isDisable=true;
    nlapiDisableLineItemField(SUBLIST_OCI_ID, $OCI.ITEM, isDisable);
    nlapiDisableLineItemField(SUBLIST_OCI_ID, $OCI.COUNTRY, isDisable);
    nlapiDisableLineItemField(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, isDisable);
    nlapiDisableLineItemField(SUBLIST_OCI_ID, $OCI.LICENSETYPE, isDisable);
    nlapiDisableLineItemField(SUBLIST_OCI_ID, $OCI.LICENSESHARP, isDisable);
}

function loadCountryCodeListArr(recTypeId){
	var $CCTY = ELIM.CONSTANT.MBL.CUSTCOUNTRY;
    if(recTypeId==null || recTypeId=='') recTypeId=$CCTY.ID;
    var countryCodeListArr = new Array();
    var filters = [
                   new nlobjSearchFilter('isinactive',null,'is','F')
    ];
    var columns = [
                   new nlobjSearchColumn('internalid'),
                   new nlobjSearchColumn($CCTY.NAME),
                   new nlobjSearchColumn($CCTY.CODE),
                   new nlobjSearchColumn('isinactive') ////just record if no filter applied on this
     ];
    
    var results = nlapiSearchRecord(recTypeId,null,filters,columns);
    
    if(results == null || results == "" || results == undefined) return [];
    //if( !isNOE(results) ){
    for ( var i = 0; results != null && i < results.length; i++ ){
        var result = results[i];
        var internalid = result.getValue('internalid');
        var countryCode = result.getValue($CCTY.CODE);
        countryCodeListArr[internalid]=countryCode;
    }//for
    return countryCodeListArr;  
}

function findCountryCodeIndexInt(countryCodeStr,countryCodeListStrArr){
    if(countryCodeStr==null || countryCodeStr=='') return -1;
    if(countryCodeListStrArr==null || countryCodeListStrArr=='') return -1;
    for ( var i = 0; i < countryCodeListStrArr.length; i++ ){
        if(countryCodeListStrArr[i]!=null && countryCodeListStrArr[i]!=''){
            if(countryCodeStr.toLowerCase()==countryCodeListStrArr[i].toLowerCase()) return i;
        }
    }//for
    return -1;  
}
function inArray(val, arr)
{   
    var bIsValueFound = false;  
    
    for(var i = 0; i < arr.length; i++)
    {
        if(val == arr[i])
        {
            bIsValueFound = true;        
            break;    
        }
    }
    
    return bIsValueFound;
}
function isNOE(valueStr)
{
    return(valueStr == null || valueStr == "" || valueStr == undefined);
}
//check data type
function isArrayType(variable){
    if( Object.prototype.toString.call(variable) === '[object Array]') return true;
    else return false;  
}

function deleteAllControlledItems(){
	var functionName="deleteAllControlledItems";
	var $OCI = ELIM.CONSTANT.MBL.ORDERCONTROLLEDITEM;
	var $SO = ELIM.CONSTANT.MBL.SALESORDER;
    var soId = nlapiGetRecordId();
	var soRec = nlapiLoadRecord($SO.ID, soId);

	////==========================================================================================================search Order Controlled Item (OCI), start
	var orderControlledItemsArr=getOrderControlledItemsFromSoArr(soRec);	
	////==========================================================================================================search Order Controlled Item (OCI), end
	
	var orderControlledItemsIdxToDelArr=new Array();////store the id qualified to delete	
	//=====================================================================================get all OCIs via saved search, and array their id for Delete or Update, start
	for(var i=0;i<orderControlledItemsArr.length; i++){	
		var orderControlledItem=orderControlledItemsArr[i];
		if( isNOE(orderControlledItem.internalid) ) continue;
		
			orderControlledItemsIdxToDelArr.push(i);
	}//for
	//=====================================================================================get all OCIs via saved search, and array their id for Delete or Update, end

	//=====================================================================================Delete qualified id, start
	try{
		for(var i=0;i<orderControlledItemsIdxToDelArr.length; i++){
			var index = orderControlledItemsIdxToDelArr[i];
			nlapiDeleteRecord($OCI.ID, orderControlledItemsArr[index].internalid);
		}
	}
	catch(exx){
		var errorStr = (exx.getCode != null) ? exx.getCode() + '\n' + exx.getDetails() + '\n' + exx.getStackTrace().join('\n') : exx.toString();
		//nlapiLogExecution('ERROR', functionName, 'A problem occured whilst ' + processStr + ': ' + '\n' + errorStr);
		if (!isNOE(isDebugMode) && isDebugMode) response.write('ERROR:A problem occured whilst DELETING' + errorStr);
	}
	//=====================================================================================Delete qualified id, end
}
function removeDupArrElement(arrayName)
{
	var newArray = [];
	label:for (var i=0; i < arrayName.length;i++)
	{
		for (var j=0; j< newArray.length;j++ ) { if (newArray[j] == arrayName[i]) { continue label; } }
		newArray[newArray.length] = arrayName[i];
	}
	return newArray;
}
function removeEmptyArrElement(arr)
{   
    
    for(var i = 0; i < arr.length; i++)
    {
        if(arr[i]=="")
        {
        	arr.splice(i,1);
        	i--;
        }
    }
}
function getOrderControlledItemsFromSoArr(soRec){
	var $OCI = ELIM.CONSTANT.MBL.ORDERCONTROLLEDITEM;
	var SUBLIST_OCI_ID = 'recmach' + $OCI.SALESORDER;
	if( isNOE(soRec) ) return new Array();

	var orderControlledItemsArr=new Array();
	var lineItemCount = soRec.getLineItemCount(SUBLIST_OCI_ID);
	for (var i_ptrLines = 1; i_ptrLines <= lineItemCount; i_ptrLines++){
		var tempObj=new Object();
		tempObj.linenum = i_ptrLines;
		tempObj.internalid = soRec.getLineItemValue(SUBLIST_OCI_ID, "id", i_ptrLines);
		tempObj.itemId = soRec.getLineItemValue(SUBLIST_OCI_ID, $OCI.ITEM, i_ptrLines);
		tempObj.quantity_ordered = soRec.getLineItemValue(SUBLIST_OCI_ID, $OCI.QUANTITYORDERD, i_ptrLines);
		tempObj.license_type = soRec.getLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSETYPE, i_ptrLines);
		tempObj.license_num = soRec.getLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSESHARP, i_ptrLines);
		tempObj.license = soRec.getLineItemValue(SUBLIST_OCI_ID, $OCI.LICENSE, i_ptrLines);
		tempObj.country = soRec.getLineItemValue(SUBLIST_OCI_ID, $OCI.COUNTRY, i_ptrLines);
		orderControlledItemsArr.push(tempObj);
	}////for
	return orderControlledItemsArr;
}////function getOrderControlledItemsFromSoArr(soRec){


function alterIfOCIexists(){
	var functionname ="alterIfOCIexists";
	var $OCI = ELIM.CONSTANT.MBL.ORDERCONTROLLEDITEM;
	var SUBLIST_OCI_ID = 'recmach' + $OCI.SALESORDER;
    var iOCILineCount = nlapiGetLineItemCount(SUBLIST_OCI_ID);
    if(iOCILineCount>0){
    	var context = nlapiGetContext();
    	var custscript_es_oci_pop_up_message = context.getSetting('SCRIPT', 'custscript_es_oci_pop_up_message');
    	alert(custscript_es_oci_pop_up_message);
    }
}
