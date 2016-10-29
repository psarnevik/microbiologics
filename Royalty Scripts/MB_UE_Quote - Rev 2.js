/*
*Author: Ben Wirzbach (RSM)
*Date: 2/09/2016
*Description: A collection of User Event functions for the Quote record.
* Quote User Events
*/

var ScriptBase;

var Events = {

    /*
     * Before Load
     */
    Quote_BeforeLoad: function (type, form, request) {
        ScriptBase = new McGladrey.Script.UserEvent('BeforeLoad', 'Quote_BeforeLoad', {
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
    Quote_BeforeSubmit: function (type) {
        ScriptBase = new McGladrey.Script.UserEvent('BeforeSubmit', 'Quote_BeforeSubmit', {
            Type: type
        });
        ScriptBase.Run([
            Modules.CalculateLineItemRoyalty.Process,
            Modules.CreateOrUpdateRoyaltyLine.Process
        ]);
    }
};


var Modules = {

    /*
     * Add the calculate button
     * Total Usage: 0
     */
    AddCalculateButton: (function () {
        //Private
        var func = 'AddCalculateButton';

        /*
         * Main processing method.
         */
        function process() {
            var continueProcess = UE_CheckQuoteForm();

            if (continueProcess == true) {
                ScriptBase.Arguments.Form.addButton('custpage_calculate_button', 'Calculate Royalty', 'onClickUpdateRoyaltyLine()');
            }
            else return;
        };

        //Public
        return {
            Process: function () {
                var continueProcessing = true;
                if (ScriptBase.Arguments.Type != 'create' && ScriptBase.Arguments.Type != 'edit') continueProcessing = false;
                //if (nlapiGetFieldValue('customform') != '205') continueProcessing = false; // New forms only
                //if (nlapiGetFieldValue('customform') != '206') continueProcessing = false; // New forms only
                //if (nlapiGetFieldValue('custbody_pricing_preference') == "3") continueProcessing = false; // GSA Option no go

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
            var continueProcess = UE_CheckQuoteForm();

            if (continueProcess == true) {
                UE_SetLineItemRoyaltyValues();
                return;
            }
            else return;
        };

        //Public
        return {
            Process: function () {
                var continueProcessing = true;
                //if (nlapiGetFieldValue('customform') != '205') continueProcessing = false;
                //if (nlapiGetFieldValue('customform') != '206') continueProcessing = false;

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
     * Module Description
     * Total Usage: 0
     */
    CreateOrUpdateRoyaltyLine: (function () {
        //Private
        var func = 'CreateOrUpdateRoyaltyLine';

        /*
         * Main processing method.
         */
        function process() {
            var continueProcess = UE_CheckQuoteForm();

            if (continueProcess == true) {
                UE_BS_AffectRoyaltyLine();
                return;
            }
            else return;
        };

        //Public
        return {
            Process: function () {
                var continueProcessing = true;
                if (ScriptBase.Arguments.Type != 'edit' && ScriptBase.Arguments.Type != 'create') continueProcessing = false;
                //if (nlapiGetFieldValue('customform') != '205') continueProcessing = false; // New forms only
                //if (nlapiGetFieldValue('customform') != '206') continueProcessing = false; // New forms only
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
    })()
};