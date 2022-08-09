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

$(document).ready(function() {
  ipcRenderer.on('xml_text', (event, xml) => {
    $("#xml_text").html(xml);
  });
  ipcRenderer.on('error_text', (event, txt) => {
    $("#error_text").html(txt);
  });  
});


error_text

$("#app_config_update").click(function( event ) {
  var xml = document.getElementById("xml_text").value;
  ipcRenderer.send('app_config', 'update',xml);
});