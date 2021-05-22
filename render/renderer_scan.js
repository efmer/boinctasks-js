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
  try {    
    document.getElementById("start_scan").onclick = function(e)
    {
      let password = $("#password_scan").val();    
      let port = $("#port_scan").val(); 
      ipcRenderer.send('scan_computers_start', password, port);      
      $("#start_scan").hide();    
    } 
  } catch (error) {
    
  }

  ipcRenderer.on('trans_scan_explain', (event, msg) => {
    $("#trans_scan_explain").html(msg);

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
      $("#trans_password").html( dlg.DCS_PASSWORD);
      $("#trans_port").html( dlg.DCS_PORT);
      $("#start_scan").html( dlg.DCS_START);      
  });

  });

  ipcRenderer.on('computer_scan_show', (event, show) => {
    $("#start_scan").show();
  });

  ipcRenderer.on('computer_scan_text', (event, tableData) => {
    $("#computer_scan_insert_text").html(tableData);

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
      let id = "#scan-check-"+ idName;
      let check = $(id).is(":checked");
      if (check) item.check = true;
      else item.check = false;

      id = "#scan-ip-"+ idName;
      item.ip = $(id).text();
      if (item.ip === '')
      {
        break;
      }      

      id = "#scan-cpid-"+ idName;
      item.cpid = $(id).text();

      id = "#scan-name-"+ idName;
      item.computerName = $(id).text();

      idName++;
      toAdd.push(item)
      if (idName > 100) break;
      password = $("#password_scan").val();    
      port = $("#port_scan").val(); 
    }
  } catch (error) {
    var ii = 1;
  }   
  ipcRenderer.send('scan_computers_found', toAdd, port, password) 
}