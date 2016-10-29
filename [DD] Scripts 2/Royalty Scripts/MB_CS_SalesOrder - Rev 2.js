/**
 * Author: Nicholas M. Schultz (RSM)
 * Date: 2015-12-06
 * Description: A collection of client scripts for the Sales Order record.
 * Sales Order Client Events
 * 
 * *Updated on : September 7, 2016
 *Author :  Prasanna Kumar Koluguri
 *Description : The script executes for the newly created custom form "[DD] MBL New Royalty Sales Order - Cash " as well.
 */

var ScriptBase;

var Events = {

    /*
     * Validate Line
     * Return true or false to control validation.
     */
    SalesOrder_ValidateLine: function (type) {
        ScriptBase = new McGladrey.Script.Client('ValidateLine', 'SalesOrder_ValidateLine', {
            Type: type
        }, 'ERROR');
        ScriptBase.AllowLineChange = true;
        ScriptBase.Run([
            Modules.CalculateLineItemRoyalty.Process
        ]);
        return ScriptBase.AllowLineChange;
    }
};

var Modules = {

    /*
     * Calculate the royalty amount for the line item record.
     * Total Usage: 10
     */
    CalculateLineItemRoyalty: (function () {
    	
    	

        //Private
        var func = 'CalculateLineItemRoyalty';

        /*
         * Main processing method.
         * Total Usage: 10
         */
        function process() {
            CS_VL_SetLineItemRoyaltyValues();
            return;
        };

        /*
         * Total Usage: 10
         */
        return {
            Process: function () {
                var continueProcessing = false;
                                
                // Checks the current form to see if it's in the list of forms where the script should run (see the mbForms array variable)
                var formId = nlapiGetFieldValue('customform');
                var mbForms = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_cs_roy_forms');
                var execContext = nlapiGetContext().getExecutionContext();
                var isMBForm = -1;
                
                log('form: '+formId+', MB forms: '+mbForms+', Exec context: '+execContext);
                
                
                if(mbForms != null){
                	mbForms = mbForms.split(',');
                	isMBForm = mbForms.indexOf(formId);
                	log('Current Form: '+formId+', indexOf MB form array: '+isMBForm);
                }
                
                
                if(isMBForm > -1 || execContext == 'webstore'){
                	log('Form is an MB form or exec context is webstore, continue running script.');
                	continueProcessing = true;
                }
                
                
                if (ScriptBase.Arguments.Type == 'item') continueProcessing = true;
                
                //if (nlapiGetFieldValue('customform') != '205') continueProcessing = false; // New forms only
                //if ((nlapiGetFieldValue('customform') == '228') || (nlapiGetFieldValue('customform') == '206')) continueProcessing = true; // New forms only
                if (nlapiGetFieldValue('custbody_pricing_preference') == "3") continueProcessing = false;
                
                if (continueProcessing) {
                    ScriptBase.Log.Audit('Module Execution Starting', func);
                    try {
                        var startBench = ScriptBase.Log.StartBenchmark(func, ScriptBase.Client);
                        process();
                        ScriptBase.Log.EndBenchmark(func, startBench, ScriptBase.Client);
                    }
                    catch (err) {
                        if (err instanceof nlobjError) {
                            ScriptBase.Log.ErrorObject('Unknown nlobjError during module: ' + func, err);
                        }
                        else {
                            ScriptBase.Log.Error('Unknown Error Occurred during module: ' + func, err.message);
                        }

                        throw err;
                    }
                }
                else {
                    ScriptBase.Log.Audit('Module Execution Cancelled', func);
                }
            }
        };
    })()
};

function log(details)
{
	nlapiLogExecution('debug', 'Sales Order Price Calculation', details);
}
