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

$(document).ready(function() {
    ipcRenderer.on('settings_color', (event, color) => {
        gSettingsColor = color;
        setColor();
    });
});

function setColor(color)
{
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
    let  elP = document.querySelector(element);
    let el = $(element);
    let setcolor = "#2222";
   
    try {
        setcolor = gSettingsColor[element];
    } catch (error) {
    }
    if (setcolor === undefined)
    {
        setcolor = "#ffffff"; 
    }
    el.css("background-color",setcolor);
    new Picker({
        parent: elP,
        color: setcolor,
        alpha: false,
        onDone: function(color){
            let rgb = color.rgbString;
            el.css("background-color",rgb);
            gSettingsColor[element] = rgb;
            ipcRenderer.send('settings_color', "element", element, rgb);         
        },
        onChange: function(color){
            el.css("background-color",color.rgbString);
        },        
    });
}