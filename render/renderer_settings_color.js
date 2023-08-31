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

const { ipcRenderer } = require('electron')

let gSettingsColor = null;

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('settings_color', (event, color) => {
        gSettingsColor = color;
        setColor();
    });
    ipcRenderer.on('translations', (event, dlg) => {
        SetHtml("trans_project",dlg.DC_BT_PROJECT);        
        SetHtml("project_running",dlg.DC_BT_PROJECT_RUNNING);
        SetHtml("project_suspended",dlg.DC_BT_TASKS_SUSPENDED);
        SetHtml("project_nonew",dlg.DC_BT_PROJECT_NO_NEW);

        SetHtml("trans_tasks",dlg.DC_BT_TASKS);
        SetHtml("task_download",dlg.DC_BT_TASKS_DOWNLOAD);
        SetHtml("task_ready_report",dlg.DC_BT_TASKS_READY_REPORT);
        SetHtml("task_running",dlg.DC_BT_TASKS_RUNNING);
        SetHtml("task_running_hp",dlg.DC_BT_TASKS_RUNNING_HP);

        SetHtml("gtask_download",dlg.DC_BT_TASKS_DOWNLOAD);
        SetHtml("gtask_ready_report",dlg.DC_BT_TASKS_READY_REPORT);
        SetHtml("gtask_running",dlg.DC_BT_TASKS_RUNNING);
        SetHtml("gtask_running_hp",dlg.DC_BT_TASKS_RUNNING_HP);

        SetHtml("task_abort",dlg.DC_BT_TASKS_ABORT);
        SetHtml("task_waiting_run",dlg.DC_BT_TASKS_WAITING);
        SetHtml("task_ready_start",dlg.DC_BT_TASKS_READY_START);
        SetHtml("task_error",dlg.DC_BT_TASKS_ERROR);

        SetHtml("gtask_abort",dlg.DC_BT_TASKS_ABORT);
        SetHtml("gtask_waiting_run",dlg.DC_BT_TASKS_WAITING);
        SetHtml("gtask_ready_start",dlg.DC_BT_TASKS_READY_START);
        SetHtml("gtask_error",dlg.DC_BT_TASKS_ERROR);

        SetHtml("task_suspended",dlg.DC_BT_TASKS_SUSPENDED);
        SetHtml("task_suspended_user",dlg.DC_BT_TASKS_SUSPENDED_USR);

        SetHtml("gask_suspended",dlg.DC_BT_TASKS_SUSPENDED);
        SetHtml("gask_suspended_user",dlg.DC_BT_TASKS_SUSPENDED_USR);

        SetHtml("trans_messages",dlg.DC_BT_MSG);
        SetHtml("messages_default",dlg.DC_BT_MSG_DEFAULT);
        SetHtml("messages_priority",dlg.DC_BT_MSG_PRIORITY);
        SetHtml("messages_highlight_0",dlg.DC_BT_MSG_HIGHLIGHT + ' A');
        SetHtml("messages_highlight_1",dlg.DC_BT_MSG_HIGHLIGHT + ' B');
        SetHtml("messages_highlight_2",dlg.DC_BT_MSG_HIGHLIGHT + ' C');
        SetHtml("messages_highlight_3",dlg.DC_BT_MSG_HIGHLIGHT + ' D');
        SetHtml("messages_highlight_4",dlg.DC_BT_MSG_HIGHLIGHT + ' E');
        SetHtml("messages_highlight_5",dlg.DC_BT_MSG_HIGHLIGHT + ' F');
        SetHtml("messages_highlight_6",dlg.DC_BT_MSG_HIGHLIGHT + ' G');
        SetHtml("messages_highlight_7",dlg.DC_BT_MSG_HIGHLIGHT + ' H');
        SetHtml("messages_highlight_8",dlg.DC_BT_MSG_HIGHLIGHT + ' I');
        SetHtml("messages_highlight_9",dlg.DC_BT_MSG_HIGHLIGHT + ' J');

        SetHtml("trans_history",dlg.DC_BT_HISTORY);
        SetHtml("history_ok",dlg.DC_BT_HISTORY_OK);
        SetHtml("history_error",dlg.DC_BT_HISTORY_ERROR);
        SetHtml("trans_system",dlg.DC_BT_SYSTEM);
        SetHtml("select_background",dlg.DC_BT_SYSTEM_SEL_BACK);
        SetHtml("select_text",dlg.DC_BT_SYSTEM_SEL_TEXT);
        SetHtml("progress_bar",dlg.DC_BT_SYSTEM_PROGRESS);
    });

});

function setColor(color)
{
    // Warning: Leave the # we no longer use in for compatibility.
    picker('#project_running');
    picker('#project_suspended');    
    picker('#project_nonew');      

    picker('#task_download');     
    picker('#task_ready_report');     
    picker('#task_running');     
    picker('#task_running_hp');     
    picker('#gtask_download');     
    picker('#gtask_ready_report');     
    picker('#gtask_running');     
    picker('#gtask_running_hp');    

    picker('#task_abort');     
    picker('#task_waiting_run');     
    picker('#task_ready_start');     
    picker('#task_error');   
    picker('#gtask_abort');     
    picker('#gtask_waiting_run');     
    picker('#gtask_ready_start');     
    picker('#gtask_error');   

    picker('#task_suspended');
    picker('#task_suspended_user');    
    picker('#gtask_suspended');
    picker('#gtask_suspended_user');

    picker('#messages_default');
    picker('#messages_priority');
    picker('#messages_highlight_0');
    picker('#messages_highlight_1');
    picker('#messages_highlight_2');
    picker('#messages_highlight_3');
    picker('#messages_highlight_4');
    picker('#messages_highlight_5');
    picker('#messages_highlight_6');
    picker('#messages_highlight_7');
    picker('#messages_highlight_8');
    picker('#messages_highlight_9');

    picker('#history_ok');
    picker('#history_error');

    picker('#select_background');  
    picker('#progress_bar');  
    picker('#select_text');  
}

function picker(element)
{
    let elUse = element.replace("#", "");
    let  elP = document.querySelector(elUse);
    let el = document.getElementById(elUse);
    elP = el;
    let setcolor = "#2222";
   
    try {
        setcolor = gSettingsColor[element];
    } catch (error) {
        let err = 1;
    }
    if (setcolor === undefined)
    {
        setcolor = "#ffffff"; 
    }
    el.style.backgroundColor = setcolor;
    new Picker({
        parent: elP,
        color: setcolor,
        alpha: false,
        onDone: function(color){
            let rgb = color.rgbString;
            el.style.backgroundColor = rgb;
            gSettingsColor[element] = rgb;
            ipcRenderer.send('settings_color', "element", element, rgb);         
        },
        onChange: function(color){
            el.style.backgroundColor =color.rgbString;
        },        
    });
}

function SetHtml(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.innerHTML = data; 
  } catch (error) {
    let i = 1;
  }
}