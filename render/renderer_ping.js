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
    document.getElementById("start_ping").onclick = function(e)
    {
      let ip = document.getElementById("ip_ping").value; 
      let password = document.getElementById("password_ping").value;
      let port = document.getElementById("port_ping").value;

      let data = new Object();
      data.ip = ip;
      data.password = password;
      data.port = port;

      ipcRenderer.send('ping_start', data);      
      document.getElementById('start_ping').disabled = true;  
    } 

    ipcRenderer.on('init', (event, data) => {
      if (data !== null)
      {
        SetValue('ip_ping',data.ip)
        SetValue('password_ping',data.password)
        SetValue('port_ping',data.port)
      }
    });

    ipcRenderer.on('ping_end', (event, status) => {
      document.getElementById('start_ping').disabled = false;  
    })

    ipcRenderer.on('status', (event, status) => {
      SetHtml('ping_insert_text',status)
    })
  } catch (error) {    
  }
});

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
    data = null;
  } catch (error) {
    let i = 1;
  }
}