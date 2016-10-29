/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Oct 2016     aramar			JIRA#884.contact information from customer record
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var ArrLocationRecord  = [],
ArrLocationFields 	   = ['custrecord_dd_contact_info_cust_service','custrecord_dd_contact_info_general'],
ArrEmpRecord	       = [],	
Primaryrep_phone	   = '',
Primaryrep_office_phone= '',
contact_info_cs		   = '',
Contact_gen_info	   = ''	,
Supervisor_PrimaryRep  = [],
Supervisor_PrimaryRep_fields  = ['supervisor','entityid'],
Supervisor_name		   ='',	
Primaryrep_email	   = '',	
customerservicerep	   = '',
Contactobject 		   = {},
regex 				   = '/<br>/gi',
regex1				   = '/<a[^\b>]+>(.+)[\<]\/a>/gi';	
function DD_SL_Contact_Info_Customer(request, response){
	try{
	nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' ******* SCRIPT START ******');
	var Customer_ID = request.getParameter('customerid');
	nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' Customer_ID = '+Customer_ID);
//	Execute if the customer internal id passed to this suite let to get search search customer object
	if (Customer_ID) {
		var CustomerRecord 		= nlapiLoadRecord('customer',Customer_ID);
		var intlocation 		= CustomerRecord.getFieldValue('custentityloc_id');
		var locationtxt 		= CustomerRecord.getFieldText('custentityloc_id');
		var intprimaryrep		= CustomerRecord.getFieldValue('salesrep');
		var intsalesCount 		= CustomerRecord.getLineItemCount('salesteam');
		for(var i=1;intsalesCount && i<=intsalesCount;i++){
			var salesRole		= CustomerRecord.getLineItemText('salesteam','salesrole', i);
			nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' salesRole = '+salesRole);
//			Execute only if the salesRole =CSR	
			if(salesRole =='CSR'){
			customerservicerep = CustomerRecord.getLineItemText('salesteam','employee', i);
			}
			}
// Fetch the location field information Contact general information and cs		
		ArrLocationRecord    = nlapiLookupField('location',intlocation,ArrLocationFields);
		contact_info_cs  = ArrLocationRecord.custrecord_dd_contact_info_cust_service;
		Contact_gen_info = ArrLocationRecord.custrecord_dd_contact_info_general;

		var Str_Contact_gen_info=Contact_gen_info.replace(/<br>/gi, " ");
		Str_Contact_gen_info=Str_Contact_gen_info.replace(/<a[^\b>]+>(.+)[\<]\/a>/gi, " $1  ");
		nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' Str_Contact_gen_info = '+Str_Contact_gen_info);
		

		var Str_contact_info_cs=contact_info_cs.replace(/<br>/gi, " ");
		Str_contact_info_cs=Str_contact_info_cs.replace(/<a[^\b>]+>(.+)[\<]\/a>/gi, " $1  ");
		nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' Str_contact_info_cs = '+Str_contact_info_cs);
		
		if(intprimaryrep){
		ArrSupervisor_PrimaryRep 	= nlapiLookupField('employee',intprimaryrep,Supervisor_PrimaryRep_fields);
		Supervisor_name				= ArrSupervisor_PrimaryRep.entityid;
		Supervisor_PrimaryRep		= ArrSupervisor_PrimaryRep.supervisor;
		Supervisor_PrimaryReptxt    = nlapiLookupField('employee',intprimaryrep,'supervisor',true);
		                                               
		}
	if(Supervisor_PrimaryRep){
		var Primaryrep_Record =nlapiLoadRecord('employee',Supervisor_PrimaryRep);
		Primaryrep_office_phone = Primaryrep_Record.getFieldValue('officephone');
		Primaryrep_phone		= Primaryrep_Record.getFieldValue('phone');
		Primaryrep_email		= Primaryrep_Record.getFieldValue('email');
		
	}
	/*
	nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' customerservicerep = '+customerservicerep);
	nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' Primaryrep_phone = '+Primaryrep_phone);
	nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' Primaryrep_office_phone = '+Primaryrep_office_phone);
	nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' Primaryrep_email = '+Primaryrep_email);*/
// form a Contact JSON Object	
	Contactobject.genContactInfo  	   		= Str_Contact_gen_info;
	Contactobject.custServiceRep  			= customerservicerep;
	Contactobject.custServiceContactInfo   	= Str_contact_info_cs;
	Contactobject.salesRepName     			= Supervisor_PrimaryReptxt;
	Contactobject.salesRepPhone1   			= Primaryrep_phone;
	Contactobject.salesRepPhone2   			= Primaryrep_office_phone;
	Contactobject.salesRepEmail    			= Primaryrep_email;
	response.write(JSON.stringify(Contactobject));
	}else{
		response.write('There is No associated Data with this Customer');
	}
	nlapiLogExecution('DEBUG', 'DD_SL_Contact_Info_Customer', ' ******* SCRIPT END ******');
} catch (e) {
	nlapiLogExecution('Error', 'DD_SL_Contact_Info_Customer ', 'Error  during DD_SL_Contact_Info_Customer - ' + e.message);
}
}
