/*
    BoincTasks Js to show and control one or multiple BOINC clients.
    Copyright (C) 2021-now  eFMer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

let gSelectedRow = -1;
let gSelectedStatus = 0;
let gSelectedType = 0;
let gSelectedAction = 0;
let gSelectedAction2 = 0;


// must be identical with rules_constants.js
const RULE_ELAPSED_TIME_NR          = 0;
const RULE_ELAPSED_TIME_DELTA_NR    = 1;    
const RULE_CPU_PERC_NR              = 2;
const RULE_PROGRESS_PERC_NR         = 3;
const RULE_TIME_LEFT_NR             = 4;
const RULE_USE_NR                   = 5;
const RULE_TIME_NR                  = 6;
const RULE_CONNECTION_NR            = 7;
const RULE_DEADLINE_NR              = 8;
const RULE_ACTION_NO_NR             = -1;
const RULE_ACTION_ALLOW_WORK_NR     = 0;
const RULE_ACTION_NO_WORK_NR        = 1;
const RULE_ACTION_RESUME_NETWORK_NR = 2;    
const RULE_ACTION_NO_NETWORK_NR     = 3;    
const RULE_ACTION_ALLOW_PROJECT_NR  = 4;    
const RULE_ACTION_SUSPEND_PROJECT_NR= 5;    
const RULE_ACTION_RUN_EXE_NR        = 6;    
const RULE_ACTION_SNOOZE_NR         = 7;
const RULE_ACTION_SNOOZE_GPU_NR     = 8;    
const RULE_ACTION_EMAIL_NR          = 9;   
const RULE_ACTION_ALERT_NR          = 10;
const RULE_ACTION_SUSPEND_TASK_NR   = 11;

const { ipcRenderer } = require('electron')
const shell = require('electron').shell

$(document).ready(function() {
    ipcRenderer.on('settings_rules_list', (event,table) => {
        $("#select_rule_list").html(table);
     
        $("#select_rule_info_type").html("");
        $("#select_rule_info_action").html("");
        $("#select_rule_info_action2").html("");        
        $("#select_rule_error").html("");
        $("#select_rule_edit").html("");
        $("#select_rule_cancel").html("");
        
        $( "#rules_table").on( "click", "tr", function(e) {
            try {
                const table = document.getElementById('rules_table');
                const cols = table.querySelectorAll('tr');
            
                [].forEach.call(cols, function(col) {
                  $(col).removeClass("selected");
                });  
                let id = this.id;
                if(id.length > 0)
                { 
                    $("#"+id).addClass("selected")
                    gSelectedRow = id*1;
                    $("#delete_rule").show();
                    $("#edit_rule").show();
                }                
            } catch (error) {
               var ii = 1;
            }           
        });
        $( "#rules_table").on( "click", "input", function(e) {
            let id = this.id;
            if(id.length > 0)
            {
                let checked = this.checked;
                ipcRenderer.send("rules","check",id,checked)
            }
        });
    });    

    ipcRenderer.on('settings_rules_buttons', (event,buttons) => {
        $("#select_rule_buttons").html(buttons);
        $("#delete_rule").hide();
        $("#edit_rule").hide();
        
        $("#add_rule").click(function( event ) {
            ipcRenderer.send("rules","add_rule")
        })
        $("#edit_rule").click(function( event ) {
           ipcRenderer.send("rules","edit_rule",gSelectedRow)
        }) 
        $("#delete_rule").click(function( event ) {
            ipcRenderer.send("rules","delete_rule",gSelectedRow)
        })
        links();                 
    });   

    ipcRenderer.on('select_rule_edit', (event,txt) => {
        $("#select_rule_edit").html(txt);

        $("#select_rule_cancel").html('<br><button id="cancel_rule"> Cancel</button>');

        $('#rules_status option:selected').each(function() {
            let sel = parseInt($(this).attr("id")); 
            gSelectedStatus = sel;
        });        
        $('#rules_type option:selected').each(function() {
            let sel = parseInt($(this).attr("id")); 
            gSelectedType = sel;
            rulesTypeInfo(sel)
        });
        $('#rules_action option:selected').each(function() {
            gSelectedAction = parseInt($(this).attr("id"));
            rulesActionInfo(gSelectedAction,"#select_rule_info_action")
        });
        $('#rules_action2 option:selected').each(function() {
            gSelectedAction2 = parseInt($(this).attr("id"));
            rulesActionInfo(gSelectedAction2,"#select_rule_info_action2")
        });        

        $("#rules_status").on("change", function(event) {
            gSelectedStatus = parseInt($('option:selected', this).attr("id"));
        });        
        $("#rules_type").on("change", function(event) {
            gSelectedType = parseInt($('option:selected', this).attr("id"));
            rulesTypeInfo(gSelectedType);
        });
        $("#rules_action").on("change", function(event) {
            gSelectedAction = parseInt($('option:selected', this).attr("id"));
            rulesActionInfo(gSelectedAction,"#select_rule_info_action");
        });
        $("#rules_action2").on("change", function(event) {
            gSelectedAction2 = parseInt($('option:selected', this).attr("id"));
            rulesActionInfo(gSelectedAction2,"#select_rule_info_action2");
        });

        $("#add_rule_item").click(function( event ) {
            let data = getData();
            ipcRenderer.send("rules","add_rule_item",data)
        }) 
        $("#edit_rule_item").click(function( event ) {
            let data = getData();
            ipcRenderer.send("rules","edit_rule_item",data);
        })
        $("#cancel_rule").click(function( event ) {
            let data = getData();
            ipcRenderer.send("rules","cancel_rule",data);
        })
        
        links();
    });

    ipcRenderer.on('settings_rules_error', (event,error) => {
        $("#select_rule_error").html(error);   
    });
});

function getData()
{
    let ruleItem = null;
    try {
        ruleItem = new Object
        ruleItem.name = $('#edit_rule_name').val();
        ruleItem.computer = $('#edit_rule_computer').val();
        ruleItem.project = $('#edit_rule_project').val();
        ruleItem.version = $('#edit_rule_version').val();        
        ruleItem.app = $('#edit_rule_app').val();
        ruleItem.value = $('#edit_value').val();
        ruleItem.time = $('#edit_time').val();

        ruleItem.ruleStatus = gSelectedStatus;        
        ruleItem.ruleType = gSelectedType;
        ruleItem.ruleAction = gSelectedAction;
        ruleItem.ruleAction2 = gSelectedAction2;
    } catch (error) {
        
    }
    return ruleItem;
}

function rulesTypeInfo(nr)
{
    let msg = "<br><b>Event type information:</b><br>";   
    switch(nr)
    {
        case RULE_CONNECTION_NR:
            msg += "On connection change, Value (change,lost)";
        break;
        case RULE_CPU_PERC_NR:
            msg += "If CPU percentage drops below Value, e.g. 0.51 (0.51%) or 15.23";
        break;
        case RULE_DEADLINE_NR:
            msg += "If deadline drops below Value, e.g. 25:00 (25 minutes) or 24:01:00 or 1d,12:24:00 (day,hour:minutes:seconds)" ;
        break;
        case RULE_ELAPSED_TIME_NR:
            msg += "If elapsed time is above Value, e.g. 12:00 (12 minutes) or 01:00:00 (1 hour) or 1d,12:24:00 (day,hour:minutes:seconds)(day is optional)" ;
        break;
        case RULE_ELAPSED_TIME_DELTA_NR:
            msg += "Elapsed time delta (interval) (elapsed - previous elapsed) is below Value, e.g. 00:01:30 (1 minute and 30 seconds)(hour:minutes:seconds)" ;
        break;
        case RULE_PROGRESS_PERC_NR:
            msg += "If progress is above Value, e.g. 99.9 (99.9%) (number between 100 and 0)" ;
        break;
        case RULE_TIME_LEFT_NR:
            msg += "If time left is below Value, e.g. 10:00 (10 minutes)(hour:minutes:seconds)" ;
        break;
        case RULE_TIME_NR:
            msg += "At clock time Value e.g. 01:00:00 (at 1 am.) 23:00:00 (at 11 pm) 11:00:00,13:00:00 (at 11 am and 1 pm)";
        break;
        case RULE_USE_NR:
            msg += "No action selected";
        break;        
    }
    $("#select_rule_info_type").html(msg);
}

function rulesActionInfo(nr,id)
{
    let msg = "<br><b>Action information:</b><br>";
    switch(nr)
    {
        case RULE_ACTION_ALLOW_WORK_NR:
            msg += "Resume fetching new work for project.";
        break;
        case RULE_ACTION_NO_WORK_NR:
            msg += "Suspend fetching work for project.";
        break;
        case RULE_ACTION_RESUME_NETWORK_NR: 
            msg += "Resume network connection, for selected computer(s).";
        break;
        case RULE_ACTION_NO_NETWORK_NR:
            msg += "Suspend network connection, for selected computer(s).";
        break;          
        case RULE_ACTION_ALLOW_PROJECT_NR:
            msg += "Resume tasks for project to run.";
        break;
        case RULE_ACTION_SUSPEND_PROJECT_NR:
            msg += "Suspend tasks for project to run.";
        break;
        case RULE_ACTION_RUN_EXE_NR: 
            msg += "Run external executable.";
        break;     
        case RULE_ACTION_SNOOZE_NR:
            msg += "Snooze, stop all CPU&GPU tasks on selected computer(s)";            
        break;
        case RULE_ACTION_SNOOZE_GPU_NR:
            msg += "Snooze, stop all GPU tasks on selected computer(s)";
        break;
        case RULE_ACTION_EMAIL_NR:
            msg += "Send email";
        break;
        case RULE_ACTION_ALERT_NR:
            msg += "Show message on screen";
        break;
        case RULE_ACTION_SUSPEND_TASK_NR:
            msg += "Suspend task";
        break;
        default:
            msg += "No action selected";
    }
    $(id).html(msg);
}

function links()
{
    const links = document.querySelectorAll('a[href]')
    Array.prototype.forEach.call(links, function (link) {
       const url = link.getAttribute('href')
       if (url.indexOf('http') === 0) {
          link.addEventListener('click', function (e) {
              e.preventDefault()
              shell.openExternal(url)
          })
       }
    })    
}