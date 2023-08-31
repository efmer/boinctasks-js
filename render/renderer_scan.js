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
  try {    
    document.getElementById("start_scan").onclick = function(e)
    {
      let password = document.getElementById('password_scan').value;
      let port = document.getElementById('port_scan').value;
      ipcRenderer.send('scan_computers_start', password, port);
      document.getElementById('start_scan').disabled = true;     
    } 
  } catch (error) {
    
  }

  ipcRenderer.on('trans_scan_explain', (event, msg) => {
    SetHtml('trans_scan_explain',msg)

    try {
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
    } catch (error) {
      
    }

    ipcRenderer.on('translations', (event, dlg) => {
      SetHtml('trans_password',dlg.DCS_PASSWORD)
      SetHtml('trans_port',dlg.DCS_PORT)
      SetHtml('start_scan',dlg.DCS_START)     
    });

  });

  ipcRenderer.on('computer_scan_show', (event, show) => {
    document.getElementById('start_scan').disabled = false;     
  });

  ipcRenderer.on('computer_scan_text', (event, tableData) => {
    SetHtml('computer_scan_insert_text',tableData) 
    try {    
      document.getElementById("addSelectedButton").onclick = function(e)
      {
        selectedComputers();
      }  
    } catch (error) {
      var ii = 1;
    } 
  });


});

function selectedComputers()
{
  let toAdd = [];
  let idName = 0;
  let password = "";    
  let port = "";   
  try {
    while (1)
    {
      let item = new Object()
      let id = "scan-check-"+ idName;
      let el = document.getElementById(id);
      if (el == null)
      {
        break;
      }
      item.check = el.checked;
      id = "scan-ip-"+ idName;
      item.ip = document.getElementById(id).innerText;
      if (item.ip === '')
      {
        break;
      }
      if (item.ip == "127.0.0.1")
      {
        item.ip = "localhost";
      }

      id = "scan-cpid-"+ idName;
      item.cpid =  document.getElementById(id).innerText;

      id = "scan-name-"+ idName;
      item.computerName =  document.getElementById(id).innerText;

      idName++;
      toAdd.push(item)
      if (idName > 100) break;
      password = document.getElementById('password_scan').value;  
      port = document.getElementById('port_scan').value;
      var ii = 1;
    }
  } catch (error) {
    var ii = 1;
  }   
  ipcRenderer.send('scan_computers_found', toAdd, port, password) 
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