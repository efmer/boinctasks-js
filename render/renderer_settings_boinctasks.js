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

$(document).ready(function() {
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

    ipcRenderer.on('settings_boinctasks', (event, item) => {
        set(item);
    });

    $( "#apply" ).on( "click", function(event) {
        let item = new Object();
        get();
    });
});

// items must be identical in settings_bt
function set(item)
{
    //    $("#start_at_login").prop("checked", item.startLogin==='1');
    $("#hide_at_login").prop("checked", item.hideLogin==='1');

    $("#extra_css").val(item.css);

    $("#refresh_rate").val( item.refreshRate );
    $("#history_refresh_rate").val( item.historyRefreshRate );    
    $("#history_delete").val( item.historyDelete ); 
    $("#socket_timeout").val( item.socketTimeout ); 
    socket_timeout

    setMessages(item.messages);
}

function get()
{
    let item = new Object();
//    item.startLogin = getBool($("#start_at_login").is(":checked"));    
    item.hideLogin = getBool($("#hide_at_login").is(":checked")); 
    item.css = $("#extra_css").val();

    let refreshRate = $("#refresh_rate").val();
    if (isNaN(refreshRate )) refreshRate = 2;
    if (refreshRate < 1) refreshRate = 2;
    $("#refresh_rate").val(refreshRate);        
    item.refreshRate = refreshRate;


    let historyRefreshRate = $("#history_refresh_rate").val();
    if (isNaN(historyRefreshRate )) historyRefreshRate = 60;
    $("#history_refresh_rate").val(historyRefreshRate);        
    item.historyRefreshRate = historyRefreshRate;

    let historyDelete = $("#history_delete").val();
    if (isNaN(historyDelete )) historyDelete = 7;
    $("#history_delete").val(historyDelete);        
    item.historyDelete = historyDelete;

    let socketTimeout = $("#socket_timeout").val();
    if (isNaN(socketTimeout )) socketTimeout = 8;
    if (socketTimeout < 4) socketTimeout = 4;
    $("#socket_timeout").val(socketTimeout);        
    item.socketTimeout = socketTimeout;

    item.messages =  getMessages();
    ipcRenderer.send('settings_boinctasks', item);    
}

function getMessages()
{
    let msgArray = [];
    for(let i=0;i<10;i++)
    {
        let id = "#highlight_project_" + i;
        let project = $(id).val();        
        id = "#highlight_msg_" + i;        
        let msg =  $(id).val();
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
            let id = "#highlight_project_" + i;
            $(id).val(msgArray[i][0]);      
            id = "#highlight_msg_" + i;        
            $(id).val(msgArray[i][1]); 
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