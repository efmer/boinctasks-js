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
  ipcRenderer.on('properties_text', (event, tableData) => {
    $("#properties_insert_text").html(tableData);
  });

  $("#properties_copy").click(function( event ) {

    let txt = $("#properties_insert_text").html();
    txt = txt.replaceAll("<tr>", "");    
    txt = txt.replaceAll("</tr>", "\n");
    txt = txt.replaceAll("<td>", "");
    txt = txt.replaceAll("</td>", "\t");    
    txt = txt.replaceAll("<table>", "");    
    txt = txt.replaceAll("</table>", "");       
    txt = txt.replaceAll("<tbody>", "");    
    txt = txt.replaceAll("</tbody>", "");    
    txt = txt.replaceAll("<hr>", "");     
    updateClipboard(txt)
  });
});

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
    /* clipboard successfully set */
  }, function() {
    /* clipboard write failed */
  });
}