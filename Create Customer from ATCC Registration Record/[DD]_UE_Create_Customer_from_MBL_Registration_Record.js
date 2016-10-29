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
function DD_UE_Create_Customer_MBL_Registration(type){
	try{
		if(type=='create') {
			nlapiLogExecution('DEBUG', 'DD_UE_Create_Customer_MBL_Registration',   '********** SCRIPT START**********');
//			Get the Record ID of MBL Registration record 			
			var RegistrationRecID 		= nlapiGetRecordId();
			nlapiLogExecution('DEBUG', 'DD_UE_Create_Customer_MBL_Registration',   ' RegistrationRecID = ' + RegistrationRecID);
			// Fetch the script parameter for the Password
			var Password = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_password');
			// Fetch the Country and Distributor of the MBL Registration record		
			var Country					= nlapiGetFieldText('custrecordmblreg_country');
			var Distributor				= nlapiGetFieldValue('custrecordmblreg_distributor');
			nlapiLogExecution('DEBUG', 'DD_UE_Create_Customer_MBL_Registration',   ' Distributor = ' + Distributor);
//			Execute only if the 	Country and the Distributor is empty		
			if(Country=='United States' && (!Distributor)){
//				Get the related field values from Registration record to create a customer record				
				var Companyname 		= nlapiGetFieldValue('custrecordmblreg_companyname');
				var Firstname 			= nlapiGetFieldValue('custrecordmblreg_firstname');
				var Lastname 			= nlapiGetFieldValue('custrecordmblreg_lastname');
				var Phone 				= nlapiGetFieldValue('custrecordmblreg_phone');
				var Email 				= nlapiGetFieldValue('custrecordmblreg_email');
				var Addressline1 		= nlapiGetFieldValue('custrecordmblreg_address1');
				var Addressline2 		= nlapiGetFieldValue('custrecordmblreg_address2');
				var City 				= nlapiGetFieldValue('custrecordmblreg_city');
				var State 				= nlapiGetFieldValue('custrecordmblreg_stateprovince');
				var Zip 				= nlapiGetFieldValue('custrecordmblreg_zippostal');
				var MBLID 				= 'MBLR'+RegistrationRecID;
				var Title 				= nlapiGetFieldValue('custrecordmblreg_title');
				var Datecreated  		= nlapiGetFieldValue('custrecordmblreg_createdte');
//				Call the customer creation function to create the customer record				
				var CustomerRecID 		= CreateCustomer(Companyname,Phone,MBLID,Email,Addressline1,Addressline2,City,Country,State,Zip,Datecreated);
//				Using the created customer record ID,call the Contact creation function to create the Contact record			
				var ContactRecID 		= CreateContact(CustomerRecID,Firstname,Lastname,Title,Email,Phone);
//				Call the function to give the user access to the contact				
				var CustomerID 			= GiveaccessCustomer(CustomerRecID,ContactRecID,Password);
//				Set the created customer record id into MBL Registration record.				
				nlapiSubmitField('customrecordmblregistration', RegistrationRecID, 'custrecordmblreg_distributor', CustomerRecID, true);	 
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
function CreateCustomer(Companyname,Phone,MBLID,Email,Addr1,Addr2,City,Country,State,Zip,Datecreated){
	try{
		var CustomerRecord 				= nlapiCreateRecord('customer');
		CustomerRecord.setFieldValue('isperson','F');
		CustomerRecord.setFieldValue('companyname',Companyname);
		CustomerRecord.setFieldValue('phone',Phone);
		CustomerRecord.setFieldValue('email',Email);
		CustomerRecord.setFieldValue('custentity_pricing_preference',1);
		CustomerRecord.setFieldValue('custentity14',1);
		CustomerRecord.setFieldValue('custentityloc_id',1);
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
		CustomerRecord.setFieldValue('custentity4',MBLID);
		CustomerRecord.setFieldValue('custentity7',Datecreated);
		CustomerRecord.setFieldValue('taxable','T');
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
function GiveaccessCustomer(CustomerRecId,ContactID,Password){
	try{
		nlapiLogExecution('DEBUG', 'GiveaccessCustomer',   ' Password = ' + Password);
		var CustomerRecord 				= nlapiLoadRecord('customer',CustomerRecId);
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