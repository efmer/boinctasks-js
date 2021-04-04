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
  ipcRenderer.on('add_project_init', (event, listC, listP, info) => {
    $("#computer_list").html(listC);
    $("#project_list").html(listP);

    $("#project_description").html(info.description);
    $("#add_project_url").val(info.url);
    $("#add_project_login_name").val(info.email);
    $("#add_project_password").val(info.password);  

    gInfo = info;

    $("#add_project_website").click(function( event ) {
      let url = gInfo.web_url
      shell.openExternal(url);     
    });

    $("#add_project_button").click(function( event ) {
      projectButton()    
    });

    $(".ef_img_input").click(function( event ) {
      $(".ef_img_input").toggleClass("bt_img_input_eye bt_img_input_eye_not");        
      if (gPasswordVisible)
      {
        $("#add_project_password").attr("type", "password");       
      }
      else
      {
        $("#add_project_password").attr("type", "text");       
      }
      gPasswordVisible = !gPasswordVisible;    
    });

    try {
      $("#project_list").on("change", function(event) {
        let sel = $('option:selected', this).text();
        ipcRenderer.send('add_project','project_changed', sel) 
      }) 
    } catch (error) {
      var ii = 1;
    } 

    $('#add_project_button').attr("disabled", false);
  });

  ipcRenderer.on('add_project_description', (event, info) => {
    $("#project_description").html(info.description);
    $("#add_project_url").val(info.url);
    gInfo = info;
  });

  ipcRenderer.on('add_project_status', (event, msg) => {
    $("#add_project_status").html(msg);
  });

  ipcRenderer.on('add_project_enable', (event) => {
    $('#add_project_button').attr("disabled", false);
  });

  ipcRenderer.send('add_project','ready');
});


function projectButton()
{
  let item = new Object() ;
  try {
    $('#add_project_button').attr("disabled", true);

    item.loginName = $('#add_project_login_name').val();
    item.passWord  = $('#add_project_password').val();
    item.url  = $('#add_project_url').val();
    
    let selArray = [];
    $('#computer_list option:selected').each(function() {
      let sel = $(this).val()
      selArray.push(sel);
    });
    item.sel = selArray;
    ipcRenderer.send('add_project', 'ok', item);
  } catch (error) {
    var ii = 1;
  }   
}