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

const { ipcRenderer } = require('electron')

'use strict';

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.on('log_text', (event, tableData) => {    
    SetHtml('log_insert_text',tableData);
  });

  document.getElementById('log_copy').addEventListener("click", function(event){ 
    let txt = GetHtml('log_insert_text')
    /*
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($("#log_insert_text").text()).select();
    document.execCommand("copy");
    $temp.remove();
    */
    let text = txt.replaceAll("<br>", "\n");
    updateClipboard(text)
  });

  document.getElementById('log_clear').addEventListener("click", function(event){ 
    ipcRenderer.send('log', 'button_clear');
  });
  document.getElementById('log_log').addEventListener("click", function(event){ 
    ipcRenderer.send('log', 'button_log');
  });
  document.getElementById('log_debug').addEventListener("click", function(event){  
    ipcRenderer.send('log', 'button_debug');
  });
  document.getElementById('log_rules').addEventListener("click", function(event){  
    ipcRenderer.send('log', 'button_rules');
  });
  document.getElementById('log_error').addEventListener("click", function(event){  
    ipcRenderer.send('log', 'button_error');
  });

  ipcRenderer.on('translations', (event, dlg) => {
    SetHtml('log_copy',dlg.DLG_BUTTON_COPY)
    SetHtml('log_clear',dlg.DLG_BUTTON_CLEAR)
    SetHtml('log_log',dlg.DLG_BUTTON_LOG)
    SetHtml('log_debug',dlg.DLG_BUTTON_DEBUG)
    SetHtml('log_rules',dlg.DLG_BUTTON_RULES)
    SetHtml('log_error',dlg.DLG_BUTTON_ERROR)
  });
});

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
    let ok = true;
  }, function(error) {
    let failed = true;
  });
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

function GetHtml(tag)
{
  value = -1;
  try {
    let el = document.getElementById(tag);
    value = el.innerHTML; 
    return value;
  } catch (error) {
    let i = 1;
  }
}