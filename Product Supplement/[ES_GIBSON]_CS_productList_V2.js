/**
 * Copyright (c) 2008-2012 Elim Solutions Inc.
 * 50 McIntosh Drive, Suite 110, Markham, ON, Canada
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Elim Solutions ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Elim Solutions.
 *
 * SVN      ::    $Id$
 * 
 * Project  ::    MicroBiologics - Gibson Bioscience
 * Filename ::    [ES_GIBSON]_CS_productList.js
 * Created  ::    11 Feb 2013
 * Author   ::    Andrea Hendrickson
 *
 * Notes    ::
 *              <date> :  <note>
 *
 */

//	Determine site origin in order to prevent Suitelet errors and speed migrations
var ES_SUITELET_URL = '/app/site/hosting/scriptlet.nl?script=customscript_es_gibson_getallproducts_v2&deploy=1&compid=915960';
if (window.location.href.indexOf('elimsolutions')>0)
{
	//	Sandbox URL
	ES_SUITELET_URL += '&h=38e53a47229a85c139cf';
}
else
{
	//	Production URL
	ES_SUITELET_URL += '&h=f7c35ede93a950a0c3e3';
}
var S_location;
if (window.location.href.indexOf('microbiologics')>0 || window.location.href.indexOf('mbl')>0)
{
	S_location = '1';
}
else if (window.location.href.indexOf('gibson')>0)
{
	S_location = '2';
}

var es_pathname = window.location.pathname;

if (es_pathname.substring(es_pathname.length-1) == "/")
    {
        es_pathname = es_pathname.substring(0, es_pathname.length-1);
    }

$(document).ready(function()
{
	S_suiteletData = S_savedSearchData + '&es_start=0' + '&es_locationid='+S_location + '&es_pathname=' + es_pathname;
	var oTable = $("#prodTable").dataTable({
		"iDisplayLength": 25,
		"aaSorting": [[2,"asc"]],
		"aoColumns": [
		/* Id */ {"bVisible": false},
		/* Cat */  null,
		/* Name */  {"sClass": "clickable"},
		/* Prod Line */ null],
		"sAjaxSource": ES_SUITELET_URL + S_suiteletData,
        "fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
			oSettings.jqXHR = $.ajax( {
				"dataType": 'json',
				"type": "POST",
				"url": sSource,
				"data": aoData,
				"success": function(data){
					fnCallback(data);
					if (data.action)
					{
						try
						{
							eval(data.action);
						} 
						catch (ex)
						{
							alert('ES ERROR: '+ex);
						}
					}
					if (data.complete)
					{
						eval(data.action);
					}
				}
			});
		}
	});
	oTable.fnDraw();
	$("#topFilter").prepend($("#prodTable_filter"));
	$('#prodTable_previous, #prodTable_next').text('');
});

function addSearchText()
{
	var title = "Search <%=getCurrentAttribute('sitecategory','itemid')%>";
	var thisInput = $("#prodTable_filter input");
	thisInput.val(title).css('color','#acacac');
	
	thisInput.focus(function()
	{
		if(thisInput.val() == title)
		{
			thisInput.val("").css('color','#000');
		}
	});

	thisInput.blur(function()
	{
		if(thisInput.val().length == 0)
		{
			thisInput.css('color','#acacac');
			thisInput.val(title);
		}
	});
}

function filterAlphabetically(elem, x)
{
	$("#alphaSorting a").each(function(){
		if($(this).hasClass('selectedFilter'))
		{
			$(this).removeClass('selectedFilter');
		}
	});
	$(elem).addClass('selectedFilter');
	var oTable = $("#prodTable").dataTable();
	oTable.fnFilter("^"+x, 2, true, false, false);
}

function clearFilter()
{
	$("#alphaSorting a").each(function(){
		if($(this).hasClass('selectedFilter'))
		{
			$(this).removeClass('selectedFilter');
		}
	});

	var oTable = $("#prodTable").dataTable();
	oTable.fnFilter('',2);
	oTable.fnFilter('');

	$("#prodTable_filter input").val("").focus().blur();
	if($("th:contains(Organism/Set Name)").attr('class') == 'clickable sorting' || $("th:contains(Organism/Set Name)").attr('class') == 'clickable sorting_desc')
	{
		$("th:contains(Organism/Set Name)").click();
	}
}