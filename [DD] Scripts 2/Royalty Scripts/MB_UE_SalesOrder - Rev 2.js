/**
 * Author: Nicholas M. Schultz (RSM)
 * Date: 2015-12-09
 * Description: A collection of User Event functions for the Sales Order record.
 * Sales Order User Events
 *
 *
 *Updated on : September 7, 2016
 *Author :  Prasanna Kumar Koluguri
 *Description : The script executes for the newly created custom form "[DD] MBL New Royalty Sales Order - Cash " as well.
 *
 */

var ScriptBase;

var Events = {

    /*
     * Before Load
     */
    SalesOrder_BeforeLoad: function (type, form, request) {
        ScriptBase = new McGladrey.Script.UserEvent('BeforeLoad', 'SalesOrder_BeforeLoad', {
            Type: type,
            Form: form,
            Request: request
        });
        ScriptBase.Run([
            Modules.AddCalculateButton.Process
        ]);
    },

    /*
     * Before Submit
     */
    SalesOrder_BeforeSubmit: function (type) {
        ScriptBase = new McGladrey.Script.UserEvent('BeforeSubmit', 'SalesOrder_BeforeSubmit', {
            Type: type
        });
        ScriptBase.Run([
            Modules.CalculateLineItemRoyalty.Process,
            Modules.CreateOrUpdateRoyaltyLine.Process
        ]);
    },

    /*
     * After Submit
     */
    SalesOrder_AfterSubmit: function (type) {
        ScriptBase = new McGladrey.Script.UserEvent('AfterSubmit', 'SalesOrder_AfterSubmit', {
            Type: type
        });
        ScriptBase.Run([
            Modules.CreateUpdateOrderRoyaltyRecords.Process
        ]);
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
            UE_SetLineItemRoyaltyValues();
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
                var mbForms = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_ue_roy_forms');
                var execContext = nlapiGetContext().getExecutionContext();
                mbForms = mbForms.split(',');
                
                var isMBForm = mbForms.indexOf(formId);
                log('Current Form: '+formId+', indexOf MB form array: '+isMBForm);
                
                if(isMBForm > -1 || execContext == 'webstore'){
                	log('Form is an MB form, continue running script.');
                	continueProcessing = true;
                }
                
                //if (nlapiGetFieldValue('customform') != '205') continueProcessing = false;
                //if (nlapiGetFieldValue('customform') != '206' && nlapiGetFieldValue('customform') != '228') continueProcessing = false;

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
    })(),

    /*
     * Create or update the royalty line item.
     * Total Usage: 0
     */
    CreateOrUpdateRoyaltyLine: (function () {

        //Private
        var func = 'CreateOrUpdateRoyaltyLine';

        /*
         * Main processing method.
         * Total Usage: 0
         */
        function process() {

            UE_BS_AffectRoyaltyLine();

            return;
        };

        /*
         * Total Usage: 0
         */
        return {
            Process: function () {
                var continueProcessing = true;
                
                // Checks the current form to see if it's in the list of forms where the script should run (see the mbForms array variable)
                var formId = nlapiGetFieldValue('customform');
                var mbForms = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_ue_roy_forms');
                mbForms = mbForms.split(',');
                
                var isMBForm = mbForms.indexOf(formId);
                log('Current Form: '+formId+', indexOf MB form array: '+isMBForm);
                
                if(isMBForm > -1){
                	log('Form is an MB form, continue running script.');
                	continueProcessing = true;
                }
                
                //if (nlapiGetFieldValue('customform') != '205') continueProcessing = false; // New forms only
                //if (nlapiGetFieldValue('customform') != '206' && nlapiGetFieldValue('customform') != '228') continueProcessing = false; // New forms only
                if (nlapiGetFieldValue('custbody_pricing_preference') == "3") continueProcessing = false; // GSA Option no go

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
    })(),

    /*
     * Add the calculate button.
     * Total Usage: 0
     */
    AddCalculateButton: (function () {

        //Private
        var func = 'AddCalculateButton';

        /*
         * Main processing method.
         * Total Usage: 0
         */
        function process() {

            ScriptBase.Arguments.Form.addButton('custpage_calculate_button', 'Calculate Royalty', 'onClickUpdateRoyaltyLine()');

            return;
        };

        /*
         * Total Usage: 0
         */
        return {
            Process: function () {
                var continueProcessing = true;
                
                // Checks the current form to see if it's in the list of forms where the script should run (see the mbForms array variable)
                var formId = nlapiGetFieldValue('customform');
                var mbForms = nlapiGetContext().getSetting('SCRIPT', 'custscript_dd_ue_roy_forms');
                mbForms = mbForms.split(',');
                
                var isMBForm = mbForms.indexOf(formId);
                log('Current Form: '+formId+', indexOf MB form array: '+isMBForm);
                
                if(isMBForm > -1){
                	log('Form is an MB form, continue running script.');
                	continueProcessing = true;
                }
                
                if (ScriptBase.Arguments.Type != 'create' && ScriptBase.Arguments.Type != 'edit') continueProcessing = false;
                //if (nlapiGetFieldValue('customform') != '205') continueProcessing = false; // New forms only
                //if (nlapiGetFieldValue('customform') != '206' && nlapiGetFieldValue('customform') != '228') continueProcessing = false; // New forms only
                if (nlapiGetFieldValue('custbody_pricing_preference') == "3") continueProcessing = false; // GSA Option no go

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
    })(),

    /*
     * Add the calculate button.
     * Total Usage: 0
     */
    CreateUpdateOrderRoyaltyRecords: (function () {

        //Private
        var func = 'CreateUpdateOrderRoyaltyRecords';

        /*
         * Main processing method.
         * Total Usage: 0
         */
        function process() {
            UE_CreateUpdateOrderRoyaltyRecords();
            return;
        };

        /*
         * Total Usage: 0
         */
        return {
            Process: function () {
                var continueProcessing = true;
                if (ScriptBase.Arguments.Type != 'create' && ScriptBase.Arguments.Type != 'edit') continueProcessing = false;

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