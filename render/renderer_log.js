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
  ipcRenderer.on('log_text', (event, tableData) => {
    $("#log_insert_text").html(tableData);
  });

  $("#log_copy").click(function( event ) {

    let txt = $("#log_insert_text").html();
    /*
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($("#log_insert_text").text()).select();
    document.execCommand("copy");
    $temp.remove();
    */
    let text = txt.replaceAll("<br>", "\n");
    updateClipboard(text)
  });

  $("#log_clear").click(function( event ) {
    ipcRenderer.send('log', 'button_clear');
  });

  $("#log_log").click(function( event ) {
    ipcRenderer.send('log', 'button_log');
  });
  $("#log_debug").click(function( event ) {
    ipcRenderer.send('log', 'button_debug');
  });
  $("#log_rules").click(function( event ) {
    ipcRenderer.send('log', 'button_rules');
  });
  $("#log_error").click(function( event ) {
    ipcRenderer.send('log', 'button_error');
  });

  ipcRenderer.on('translations', (event, dlg) => {
    g_trans = dlg;
    $("#log_copy").html( dlg.DLG_BUTTON_COPY);
    $("#log_clear").html( dlg.DLG_BUTTON_CLEAR);
    $("#log_log").html( dlg.DLG_BUTTON_LOG);
    $("#log_debug").html( dlg.DLG_BUTTON_DEBUG);
    $("#log_rules").html( dlg.DLG_BUTTON_RULES);
    $("#log_error").html( dlg.DLG_BUTTON_ERROR);

});


});

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
    /* clipboard successfully set */
  }, function() {
    /* clipboard write failed */
  });
}