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
    document.getElementById("start_ping").onclick = function(e)
    {
      let ip = $("#ip_ping").val();       
      let password = $("#password_ping").val();    
      let port = $("#port_ping").val(); 

      let data = new Object();
      data.ip = ip;
      data.password = password;
      data.port = port;

      ipcRenderer.send('ping_start', data);      
      $("#start_ping").hide();
    } 

    ipcRenderer.on('init', (event, data) => {
      if (data !== null)
      {
        $("#ip_ping").val(data.ip);  
        $("#password_ping").val(data.password);
        $("#port_ping").val(data.port);
      }
    });

    ipcRenderer.on('ping_end', (event, status) => {
      $("#start_ping").show(); 
    })

    ipcRenderer.on('status', (event, status) => {
      $("#ping_insert_text").html(status);  
    })
  } catch (error) {    
  }
});