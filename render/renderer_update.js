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
const shell = require('electron').shell

'use strict';

document.addEventListener("DOMContentLoaded", () => {

  ipcRenderer.on('update_msg', (event, msg) => {
    SetHtml("update_msg",msg);

    try{
      document.getElementById('button_release').addEventListener("click", function(event){       
        ipcRenderer.send("update", "release");
      });
    } catch (error) {}

    try{
      document.getElementById('button_beta').addEventListener("click", function(event){       
        ipcRenderer.send("update","beta");
      });
    } catch (error) {}

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

  });

  ipcRenderer.on('update_download', (event, msg) => {
    SetHtml("update_download",msg);
  });
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