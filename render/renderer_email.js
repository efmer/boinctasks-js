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

gPasswordVisible = false;

$(document).ready(function() {
  ipcRenderer.on('set', (event, item) => {

    $("#email_email").val(item.email);
    $("#email_password").val(item.passWord);
    $("#email_send").val(item.send);
    $("#email_status").html("");
  });

  ipcRenderer.on('status', (event, status) => {

    $("#email_status").html(status)    
  });

  $(".ef_img_input").click(function( event ) {
    $(".ef_img_input").toggleClass("bt_img_input_eye bt_img_input_eye_not");        
    if (gPasswordVisible)
    {
      $("#email_password").attr("type", "password");       
    }
    else
    {
      $("#email_password").attr("type", "text");       
    }
    gPasswordVisible = !gPasswordVisible;    
  });

  $("#email_apply").click(function( event ) {
    let item = new Object() ;
    try {
      getValues(item);
      ipcRenderer.send('email', 'apply', item);
    } catch (error) {
      var ii = 1;
    }      
  });

  $("#email_test").click(function( event ) {
    let item = new Object() ;
    try {
      getValues(item);
      ipcRenderer.send('email', 'test', item);
    } catch (error) {
      var ii = 1;
    }      
  });

  function getValues(item)
  {
    item.email = $('#email_email').val();
    item.passWord  = $('#email_password').val();
    item.send  = $('#email_send').val();    
  }
});