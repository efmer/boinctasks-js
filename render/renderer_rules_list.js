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

document.addEventListener("DOMContentLoaded", () => {    
    ipcRenderer.on('settings_rules_list', (event,table) => {
        SetHtml('select_rule_list',table);
        SetHtml('select_rule_info_type','');
        SetHtml('select_rule_info_action','');
        SetHtml('select_rule_info_action2','');
        SetHtml('select_rule_error','');
        SetHtml('select_rule_edit','');
        SetHtml('select_rule_cancel','');
        
        let rt = document.getElementById('rules_table');
        if (rt != undefined)
        {
            document.getElementById('rules_table').addEventListener("click", function(event){  
                try {
                    const table = document.getElementById('rules_table');
                    const cols = table.querySelectorAll('tr');
                
                    [].forEach.call(cols, function(col) {                    
                        col.classList.remove("bt_table_selected");
                    });  
                    let target = event.target;
                    let id = parseInt(target.id);
                    if (!isNaN(id))
                    {
                        let checked = target.checked;
                        cols[id+1].classList.add("bt_table_selected");
                        gSelectedRow = id*1;                
                        document.getElementById('delete_rule').disabled = false;  
                        document.getElementById('edit_rule').disabled = false;       
                        ipcRenderer.send("rules","check",id,checked);
                    }
                } catch (error) {
                var ii = 1;
                }           
            });  
        }
    });    
      
    ipcRenderer.on('settings_rules_buttons', (event,buttons) => {
        SetHtml('select_rule_buttons',buttons);
        if (buttons.length > 2)
        {
            document.getElementById('delete_rule').disabled = true;  
            document.getElementById('edit_rule').disabled = true;  
            
            document.getElementById('add_rule').addEventListener("click", function(event){    
                ipcRenderer.send("rules","add_rule")
            })

            document.getElementById('edit_rule').addEventListener("click", function(event){    
            ipcRenderer.send("rules","edit_rule",gSelectedRow)
            }) 

            document.getElementById('delete_rule').addEventListener("click", function(event){    
                ipcRenderer.send("rules","delete_rule",gSelectedRow)
            })
            links();
        }
    });   
 
    ipcRenderer.on('select_rule_edit', (event,txt) => {
        SetHtml('select_rule_edit',txt);
        SetHtml('select_rule_cancel','<br><button id="cancel_rule"> Cancel</button>');

        var el = document.getElementsByClassName("rules_status");
        for (var i = 0; i < el.length; i++) 
        {
            let item = el[i];
            gSelectedStatus = item.id;
        }
//        $('#rules_status option:selected').each(function() {
//            let sel = parseInt($(this).attr("id")); 
//            gSelectedStatus = sel;
//        });        


        var el = document.getElementsByClassName("rules_type");
        for (var i = 0; i < el.length; i++) 
        {
            let item = el[i];
            rulesTypeInfo = item.id;
        }

        var el = document.getElementsByClassName("rules_action");
        for (var i = 0; i < el.length; i++) 
        {
            let item = el[i];
            gSelectedAction = item.id;
            rulesActionInfo(gSelectedAction,"select_rule_info_action")
        }

        var el = document.getElementsByClassName("rules_action2");
        for (var i = 0; i < el.length; i++) 
        {
            let item = el[i];
            gSelectedAction = item.id;
            rulesActionInfo(gSelectedAction,"select_rule_info_action2")
        }       

        document.getElementById('rules_status').addEventListener("click", function(event){  
            let id = -1;
            for (var option of document.getElementById('rules_status').options)
            {
                if (option.selected) {
                    id = option.id;                    
                }
            }

            gSelectedStatus = parseInt(id);
        });        

        document.getElementById('rules_type').addEventListener("click", function(event){    
            let id = -1;
            for (var option of document.getElementById('rules_type').options)
            {
                if (option.selected) {
                    id = option.id;                    
                }
            }
            gSelectedType = parseInt(id);
            rulesTypeInfo(gSelectedType);
        });

        document.getElementById('rules_action').addEventListener("click", function(event){    
            let id = -1;
            for (var option of document.getElementById('rules_action').options)
            {
                if (option.selected) {
                    id = option.id;                    
                }
            }
            gSelectedAction = parseInt(id);
            rulesActionInfo(gSelectedAction,"select_rule_info_action");
        });

        document.getElementById('rules_action2').addEventListener("click", function(event){   
            let id = -1;
            for (var option of document.getElementById('rules_action2').options)
            {
                if (option.selected) {
                    id = option.id;                    
                }
            }             
            gSelectedAction2 = parseInt(id);
            rulesActionInfo(gSelectedAction2,"Fselect_rule_info_action2");
        });

        
        try{
            document.getElementById('add_rule_item').addEventListener("click", function(event){    
                let data = getData();
                ipcRenderer.send("rules","add_rule_item",data)
            })
        } catch (error) {
            var ii = 1;
        }
        
        try{
            document.getElementById('edit_rule_item').addEventListener("click", function(event){    // update rule
                let data = getData();
                ipcRenderer.send("rules","edit_rule_item",data);
            })
        } catch (error) {
            var ii = 1;
        }

        document.getElementById('cancel_rule').addEventListener("click", function(event){    
            let data = getData();
            ipcRenderer.send("rules","cancel_rule",data);
        })
        
        links();
    });

    ipcRenderer.on('settings_rules_error', (event,error) => {
        SetHtml('select_rule_error',error);    
    });
})

function getData()
{
    let ruleItem = null;
    try {
        ruleItem = new Object
        ruleItem.name = document.getElementById('edit_rule_name').value;
        ruleItem.computer = document.getElementById('edit_rule_computer').value;
        ruleItem.project = document.getElementById('edit_rule_project').value;
        ruleItem.version = document.getElementById('edit_rule_version').value;       
        ruleItem.app = document.getElementById('edit_rule_app').value;
        ruleItem.value = document.getElementById('edit_value').value;
        ruleItem.time = document.getElementById('edit_time').value;

        ruleItem.ruleStatus = gSelectedStatus;        
        ruleItem.ruleType = gSelectedType;
        ruleItem.ruleAction = gSelectedAction;
        ruleItem.ruleAction2 = gSelectedAction2;
    } catch (error) {
        var ii = 1;
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
    SetHtml('select_rule_info_type',msg)
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
    SetHtml(id,msg);
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

function SetHtml(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.innerHTML = data; 
    data = null;
  } catch (error) {
    let i = 1;
  }
}
