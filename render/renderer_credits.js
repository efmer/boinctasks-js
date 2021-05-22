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

$(document).ready(function() {

  ipcRenderer.on('about', (event, txt) => {
    $("#about_system_text").html(txt);
  });

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
    $("#trans_intro").html( dlg.DAB_THE_EASY_WAY);
    $("#trans_GNU").html( dlg.DAB_LICENCE);
    $("#trans_BOINC").html( dlg.DAB_BOINC);
    $("#trans_software_used").html( dlg.DAB_FOLLOWING_SOFTWARE);

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

});
