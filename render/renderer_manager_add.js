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


gInfo = null;
gPasswordVisible = false;

'use strict';

const { shell,ipcRenderer } = require('electron')

$(document).ready(function() {
  ipcRenderer.on('add_manager_init', (event, listC, listP, info) => {
    $("#computer_list").html(listC);
    $("#manager_list").html(listP);
    gInfo = info;
    $("#add_manager_url").val(gInfo.url[0]);    
   
    $(".ef_img_input").click(function( event ) {
      $(".ef_img_input").toggleClass("bt_img_input_eye bt_img_input_eye_not");        
      if (gPasswordVisible)
      {
        $("#add_manager_password").attr("type", "password");       
      }
      else
      {
        $("#add_manager_password").attr("type", "text");       
      }
      gPasswordVisible = !gPasswordVisible;    
    });

    try {
      $("#manager_list").on("change", function(event) {
//        let sel = $('option:selected', this).text();
        let sel = $('option:selected', this).val();;
        $("#add_manager_url").val(gInfo.url[sel]);
      }) 
    } catch (error) {
      var ii = 1;
    } 

    $('#add_manager_button').attr("disabled", false);
    $('#sync_manager_button').attr("disabled", false);    
    $('#add_manager_detach').attr("disabled", false);    
  });

  ipcRenderer.on('add_manager_status', (event, msg) => {
    $("#add_manager_status").html(msg);
  });

  ipcRenderer.on('add_manager_enable', (event) => {
    $('#add_manager_button').attr("disabled", false);
    $('#sync_manager_button').attr("disabled", false);    
    $('#add_manager_detach').attr("disabled", false);    
  });

  ipcRenderer.send('add_manager','ready');
  
  $("#add_manager_website").click(function( event ) {
    let url  = $('#add_manager_url').val();
    shell.openExternal(url);     
  });

  $("#add_manager_button").click(function( event ) {
    managerButton(false);
  });

  $("#sync_manager_button").click(function( event ) {
    managerButton(true);
  });

  $("#add_manager_detach").click(function( event ) {
    detachButton()    
  });

  ipcRenderer.on('info_manager_status', (event, msg)=> {
    $("#info_manager_status").html(msg);
  });

});

function managerButton(sync)
{
  let item = new Object() ;
  try {
    $('#add_manager_button').attr("disabled", true);
    $('#sync_manager_button').attr("disabled", true);
    $('#add_manager_detach').attr("disabled", true);

    item.loginName = $('#add_manager_login_name').val();
    item.passWord  = $('#add_manager_password').val();
    item.url  = $('#add_manager_url').val();
   
    let selArray = [];
    $('#computer_list option:selected').each(function() {
      let sel = $(this).val()
      selArray.push(sel);
    });
    item.sel = selArray;
    let msg;
    if (sync) msg = "sync";
    else msg = "ok";
    ipcRenderer.send('add_manager', msg, item);
  } catch (error) {
    var ii = 1;
  }   
}

// detach identical to add with all fields empty
function detachButton()
{
  let item = new Object() ;
  try {
    $('#add_manager_button').attr("disabled", true);
    $('#sync_manager_button').attr("disabled", true);    
    $('#add_manager_detach').attr("disabled", true);
    
    item.loginName = "";
    item.passWord  = "";
    item.url  = "";
    
    let selArray = [];
    $('#computer_list option:selected').each(function() {
      let sel = $(this).val()
      selArray.push(sel);
    });
    item.sel = selArray;
    ipcRenderer.send('add_manager', 'ok', item);
  } catch (error) {
    var ii = 1;
  }   
}