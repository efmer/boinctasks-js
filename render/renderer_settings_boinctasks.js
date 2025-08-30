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
const shell = require('electron').shell

document.addEventListener("DOMContentLoaded", () => {
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

    ipcRenderer.on('translations', (event, dlg) => {
        SetHtml("trans_login",dlg.DS_BT_LOGIN);
        SetHtml("trans_hide",dlg.DS_BT_HIDE_START);
        SetHtml("trans_restart_check",dlg.DS_BT_RESTART);

        SetHtml("trans_styling",dlg.DS_BT_STYLING);
        SetHtml("trans_styling_def",dlg.DS_BT_STYLING_DEF);

        SetHtml("trans_region",dlg.DS_BT_REGION);
        SetHtml("trans_locale",dlg.DS_BT_LOCALE);

        SetHtml("trans_timing",dlg.DS_BT_TIMING);
        SetHtml("trans_timing_refresh",dlg.DS_BT_TIMING_REFRESH);
        SetHtml("trans_timing_history_refresh",dlg.DS_BT_HISTORY_REFRESH);
        SetHtml("trans_history",dlg.DS_BT_HISTORY);
        SetHtml("trans_history_delete",dlg.DS_BT_HISTORY_DELETE);
        SetHtml("trans_messages",dlg.DS_BT_MESSAGES);
        SetHtml("trans_messages_exp",dlg.DS_BT_MESSAGES_EXP);

        SetHtml("highlight_project0",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project1",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project2",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project3",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project4",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project5",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project6",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project7",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project8",dlg.DS_BT_MESSAGES_PROJECT);
        SetHtml("highlight_project9",dlg.DS_BT_MESSAGES_PROJECT);        

        SetHtml("highlight_message0",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message1",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message2",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message3",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message4",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message5",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message6",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message7",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message8",dlg.DS_BT_MESSAGES_MESSAGE);
        SetHtml("highlight_message9",dlg.DS_BT_MESSAGES_MESSAGE);
 
        SetHtml("trans_advanced",dlg.DS_BT_ADVANCED);
        SetHtml("trans_deadline",dlg.DS_BT_DEADLINED);        
        SetHtml("trans_socket",dlg.DS_BT_SOCKET_TO);
        SetHtml("apply",dlg.DS_BT_BUTTON_APPLY);
    });

    ipcRenderer.on('settings_boinctasks', (event, item) => {
        set(item);
    });

    document.getElementById('apply').addEventListener("click", function(event){     
        get();
    });
});

// items must be identical in settings_bt
function set(item)
{
    item.language;
    document.getElementById(item.language).selected=true;

    SetCheck("hide_at_login",item.hideLogin==='1');
    SetCheck("restart_time_check",item.restartTimeCheck==='1');
    SetValue("restart_time",item.restartTime );  

    SetValue("extra_css",item.css);

    SetValue("refresh_rate",item.refreshRate );

    SetValue("locale",item.locale );
    SetValue("history_refresh_rate",item.historyRefreshRate );    
    SetValue("history_delete",item.historyDelete );
    
    SetCheck("deadline_day",item.deadlineDay==='1');
    SetValue("socket_timeout",item.socketTimeout ); 
    setMessages(item.messages);
}

function get()
{
    let item = new Object();

    try {
        for (var option of document.getElementById('language_list').options)
        {
            if (option.selected) {
                item.language = option.id;
                //item.language = $('#language_list option:selected').attr('id');  
            }
        }     
    } catch (error) {}

    try {
        item.hideLogin = getBool(document.getElementById('hide_at_login').checked); 
        let id = document.getElementById("extra_css");
        item.css = id.value;     
    } catch (error) {
        item.css = "";
    }

    try {
        item.restartTimeCheck = getBool(document.getElementById("restart_time_check").checked); 
        item.restartTime = document.getElementById("restart_time").value;  
    } catch (error) {
        item.restartTime = "error";
    }

    try {
        let locale = document.getElementById("locale").value;
        item.locale = locale;
    } catch (error) {
        item.locale = "";
    }

    try {
        let refreshRate = document.getElementById("refresh_rate").value;
        if (isNaN(refreshRate )) refreshRate = 2;
        if (refreshRate < 1) refreshRate = 2;
        SetValue("refresh_rate",refreshRate);
        item.refreshRate = refreshRate;        
    } catch (error) {
        item.refreshRate = 2;
    }

    try {
        let historyRefreshRate = document.getElementById("history_refresh_rate").value;
        if (isNaN(historyRefreshRate )) historyRefreshRate = 60;
        SetValue("history_refresh_rate",historyRefreshRate);        
        item.historyRefreshRate = historyRefreshRate;        
    } catch (error) {
        item.historyRefreshRate = 60;
    }

    try {
        let historyDelete = document.getElementById("history_delete").value;
        if (isNaN(historyDelete )) historyDelete = 7;
        SetValue("history_delete",historyDelete);        
        item.historyDelete = historyDelete;        
    } catch (error) {
        item.historyDelete = 7;
    }

    try {
        let socketTimeout = document.getElementById("socket_timeout").value;
        if (isNaN(socketTimeout )) socketTimeout = 8;
        if (socketTimeout < 4) socketTimeout = 4;
        SetValue("socket_timeout",socketTimeout);
        item.socketTimeout = socketTimeout;        
    } catch (error) {
        item.socketTimeout = 8 
    }

    try {
        item.deadlineDay = getBool(document.getElementById('deadline_day').checked);      
    } catch (error) {
        item.deadlineDay = false 
    }

    try {
        item.messages =  getMessages();        
    } catch (error) {        
    }

    ipcRenderer.send('settings_boinctasks', item);    
}

function getMessages()
{
    let msgArray = [];
    for(let i=0;i<10;i++)
    {
        let id = "highlight_project_" + i;
        let project = document.getElementById(id).value;        
        id = "highlight_msg_" + i;
        let msg = document.getElementById(id).value;
        let item = []
        item.push(project);
        item.push(msg);
        msgArray.push(item);
    }
    return msgArray;
}

function setMessages(msgArray)
{
    try {
        for(let i=0;i<10;i++)
        {
            let id = "highlight_project_" + i;
            SetValue(id,msgArray[i][0]);      
            id = "highlight_msg_" + i;        
            SetValue(id,msgArray[i][1]); 
        }
        return msgArray;        
    } catch (error) {
        
    }
}

function getBool(val)
{
    if (val) return "1";
    return "0";
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

function SetValue(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.value = data;     
  } catch (error) {
    let i = 1;
  }
}

function SetCheck(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.checked = data; 
  } catch (error) {
    let i = 1;
  }
}