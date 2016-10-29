/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Sep 2016     aramar			JIRA - 313.Create UE script to create customer from end user registration record
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
/*
 * This script  to create customer and contact records from end user registration record creation.
 * script triggers on After Submit event.
 */
var BlnTaxExempt ='F';
function DD_UE_Create_Customer_MBL_Registration(type){
	try{
		if(type=='create') {
			nlapiLogExecution('DEBUG', 'DD_UE_Create_Customer_MBL_Registration',   '********** SCRIPT START**********');
//			Get the Record ID of MBL Registration record 			
			var RegistrationRecID 		= nlapiGetRecordId();
			nlapiLogExecution('DEBUG', 'DD_UE_Create_Customer_MBL_Registration',   ' RegistrationRecID = ' + RegistrationRecID);
			// Fetch the script parameter for the Password
			var Context 			   = nlapiGetContext();
			var Password 			   = Context.getSetting('SCRIPT', 'custscript_dd_password');
			var StCloudlocation		   = Context.getSetting('SCRIPT', 'custscript_dd_st_cld_location');
			var MBLDistributor		   = Context.getSetting('SCRIPT', 'custscript_dd_customer_microbiologics');
			// Fetch the Country and Distributor of the MBL Registration record		
			var Country					= nlapiGetFieldText('custrecordatccreg_country');
			var Distributor				= nlapiGetFieldValue('custrecord_distributor_registration');
			var location				= nlapiGetFieldValue('custrecord_atccreg_es_locationid');
			var Customer_Distributor	= nlapiGetFieldValue('custrecordatccreg_distributor');
			nlapiLogExecution('DEBUG', 'DD_UE_Create_Customer_MBL_Registration',   ' Distributor = ' + Distributor);
//			Execute only if the 	Country and the Distributor is empty		
			if(Country=='United States' && (!Distributor)&&(StCloudlocation==location)&&(MBLDistributor==Customer_Distributor)){
//				Get the related field values from Registration record to create a customer record				
				var Companyname 		= nlapiGetFieldValue('custrecordatccreg_companyname');
				var Firstname 			= nlapiGetFieldValue('custrecordatccreg_firstname');
				var Lastname 			= nlapiGetFieldValue('custrecordatccreg_lastname');
				var Phone 				= nlapiGetFieldValue('custrecordatccreg_phone');
				var Email 				= nlapiGetFieldValue('custrecordatccreg_email');
				var Addressline1 		= nlapiGetFieldValue('custrecordatccreg_address1');
				var Addressline2 		= nlapiGetFieldValue('custrecordatccreg_address2');
				var City 				= nlapiGetFieldValue('custrecordatccreg_city');
				var State 				= nlapiGetFieldValue('custrecordatccreg_stateprovince');
				var Zip 				= nlapiGetFieldValue('custrecordatccreg_zippostal');
				var MBLID 				= nlapiGetFieldValue('name');//RegistrationRecID;
				var Title 				= nlapiGetFieldValue('custrecordatccreg_title');
				//var Datecreated  		= nlapiGetFieldValue('created');
				var TaxExempt			= nlapiGetFieldValue('custrecordatccreg_taxexempt');
			
//				Call the customer creation function to create the customer record				
				var CustomerRecID 		= CreateCustomer(Companyname,Phone,Email,Addressline1,Addressline2,City,Country,State,Zip,TaxExempt);
//				Using the created customer record ID,call the Contact creation function to create the Contact record			
				var ContactRecID 		= CreateContact(CustomerRecID,Firstname,Lastname,Title,Email,Phone);
//				Call the function to give the user access to the contact				
				var CustomerID 			= GiveaccessCustomer(CustomerRecID,ContactRecID,Password,RegistrationRecID);
//				Set the created customer record id into MBL Registration record.				
				nlapiSubmitField('customrecordatccregistration', RegistrationRecID, 'custrecord_distributor_registration', CustomerRecID, true); 
			}
		}
	} catch (e) {
		nlapiLogExecution('Error', 'DD_UE_Create_Customer_MBL_Registration ', 'Error  during DD_UE_Create_Customer_MBL_Registration - ' + e.message);
	}
	nlapiLogExecution('DEBUG', 'DD_UE_Create_Customer_MBL_Registration',   '********** SCRIPT END ***********');
}
/**
 * This function  to Create Customer Record
 * @param{int} 		- Company name
 * @param{int} 		- Phone
 * @param{int} 		- MBLID
 * @param{email} 	- Email
 * @param{string} 	- Addr1 
 * @param{string} 	- Addr2
 * @param{string}  	- City
 * @param{int} 		- Country
 * @param{int} 		- State
 * @param{int} 		- Zip
 * @param{date} 	- Datecreated
 * @return{int} 	- Customer Record internal ID 
 */
var shippingmethod ='';
function CreateCustomer(Companyname,Phone,Email,Addr1,Addr2,City,Country,State,Zip,TaxExempt){
	try{
		var Shippingmethod_tax  = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_shipping_method_taxable');
		var Shippingmethod_NT   = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_shipping_method_nt');
		if(TaxExempt==1){
			BlnTaxExempt		= 'T';
			shippingmethod		= Shippingmethod_tax;
		}if(TaxExempt==2){
			BlnTaxExempt		= 'F';
			shippingmethod		= Shippingmethod_NT;
		}
		var CustomerRecord 				= nlapiCreateRecord('customer');
		CustomerRecord.setFieldValue('isperson','F');
		CustomerRecord.setFieldValue('companyname',Companyname);
		CustomerRecord.setFieldValue('phone',Phone);
		CustomerRecord.setFieldValue('email',Email);
		CustomerRecord.setFieldValue('custentity_pricing_preference',1);
		CustomerRecord.setFieldValue('custentity14',1);
		CustomerRecord.setFieldValue('custentityloc_id',1);
		CustomerRecord.setFieldValue('shippingitem',shippingmethod);
		CustomerRecord.setFieldText('custentity13','Direct - Retail');
		CustomerRecord.selectNewLineItem('addressbook');
		CustomerRecord.setCurrentLineItemValue('addressbook', 'addr1',Addr1);
		CustomerRecord.setCurrentLineItemValue('addressbook', 'addr2',Addr2);
		CustomerRecord.setCurrentLineItemValue('addressbook', 'city',City);
		CustomerRecord.setCurrentLineItemText('addressbook', 'country',Country);
		CustomerRecord.setCurrentLineItemValue('addressbook', 'state',State);
		CustomerRecord.setCurrentLineItemValue('addressbook', 'zip',Zip);
		CustomerRecord.commitLineItem('addressbook');	
		CustomerRecord.setFieldText('category','Blank');
		CustomerRecord.setFieldValue('taxable',BlnTaxExempt);
		CustomerRecord.setFieldText('shippingcarrier','FedEx/More');
		
		var intCustomerRecID			= nlapiSubmitRecord(CustomerRecord, true,true); 
		nlapiLogExecution('DEBUG', 'CreateCustomer',   ' intCustomerRecID = ' + intCustomerRecID);
		return intCustomerRecID;
	} catch (e) {
		nlapiLogExecution('Error', 'CreateCustomer ', 'Error  during CreateCustomer - ' + e.message);
	}
}
/**
 * This function to Create Contact Record
 * @param{int} 		- CustomerRecID
 * @param{string} 	- First name
 * @param{string} 	- Last name
 * @param{string} 	- Title
 * @param{email}  	- Email
 * @param{int}  	- Phone
 * @return{int} 	- Contact record internal ID 
 */
function CreateContact(CustomerRecID,Firstname,Lastname,Title,Email,Phone){
	try{
		var ContactRecord 				= nlapiCreateRecord('contact');
		ContactRecord.setFieldValue('company',CustomerRecID);
		ContactRecord.setFieldValue('firstname',Firstname);
		ContactRecord.setFieldValue('lastname',Lastname);
		ContactRecord.setFieldValue('title',Title);
		ContactRecord.setFieldValue('email',Email);
		ContactRecord.setFieldValue('phone',Phone);
		var intContactRecID				= nlapiSubmitRecord(ContactRecord, true,true); 
		nlapiLogExecution('DEBUG', 'CreateContact',   ' intContactRecID = ' + intContactRecID);
		return intContactRecID;
	} catch (e) {
		nlapiLogExecution('Error', 'CreateContact ', 'Error  during CreateContact - ' + e.message);
	}
}
/**
 * This function to Grant access to customers contact
 * @param{int} 		- CustomerRecId
 * @param{int} 		- ContactID
 * @param{string}  	- Password
 * @return{int} 	- customer Record Internal ID 
 */
function GiveaccessCustomer(CustomerRecId,ContactID,Password,ATCCRecID){
	try{
		nlapiLogExecution('DEBUG', 'GiveaccessCustomer',   ' Password = ' + Password);
		var ATCCRecord					= [];
		var Fields						= ['name','created'];
		 	ATCCRecord					= nlapiLookupField('customrecordatccregistration', ATCCRecID, Fields);
		var ATCCID						= ATCCRecord.name;
		var ATCCDateCreated				= ATCCRecord.created;
		nlapiLogExecution('DEBUG', 'GiveaccessCustomer',   ' ATCCID = ' + ATCCID);
		nlapiLogExecution('DEBUG', 'GiveaccessCustomer',   ' ATCCDateCreated = ' + ATCCDateCreated);
		var ATCCDateString				= nlapiStringToDate(ATCCDateCreated);
		var ATCCDateformat				= nlapiDateToString(ATCCDateString);
		nlapiLogExecution('DEBUG', 'GiveaccessCustomer',   ' ATCCDateformat = ' + ATCCDateformat);
		var CustomerRecord 				= nlapiLoadRecord('customer',CustomerRecId);
		CustomerRecord.setFieldValue('custentity3',ATCCID);
		CustomerRecord.setFieldValue('custentity6',ATCCDateformat);
		CustomerRecord.selectLineItem('contactroles',1);
		CustomerRecord.setLineItemValue('contactroles', 'contact',1,ContactID);
		CustomerRecord.setLineItemValue('contactroles', 'giveaccess',1,'T');
		CustomerRecord.setLineItemValue('contactroles', 'passwordconfirm',1,Password);
		CustomerRecord.setLineItemValue('contactroles', 'password',1,Password);
		CustomerRecord.setLineItemValue('contactroles', 'password2',1,Password);
		CustomerRecord.setLineItemValue('contactroles', 'sendemail',1,'T');
		CustomerRecord.commitLineItem('contactroles');
		var intCustomerRecID			= nlapiSubmitRecord(CustomerRecord, true,true); 
		nlapiLogExecution('DEBUG', 'GiveaccessCustomer',   ' GiveaccessCustomer = ' + intCustomerRecID);
		return intCustomerRecID;
	} catch (e) {
		nlapiLogExecution('Error', 'GiveaccessCustomer ', 'Error  during GiveaccessCustomer - ' + e.message);
	}
}