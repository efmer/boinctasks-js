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

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.on('add_manager_init', (event, listC, listP, info) => {
    SetHtml('computer_list',listC)
    SetHtml('manager_list',listP)
    gInfo = info;
    document.getElementById('add_manager_url').value = gInfo.url[0]
 
    document.getElementById('password_eye').addEventListener("click", function(event){         
      if (gPasswordVisible)
      {
        document.getElementById('password_eye').classList.add("bt_img_input_eye_not");  
        document.getElementById('password_eye').classList.remove("bt_img_input_eye");          
        document.getElementById('add_manager_password').setAttribute('type', 'password');   
      }
      else
      {
        document.getElementById('password_eye').classList.remove("bt_img_input_eye_not");  
        document.getElementById('password_eye').classList.add("bt_img_input_eye");           
        document.getElementById('add_manager_password').setAttribute('type', 'text');              
      }
      gPasswordVisible = !gPasswordVisible;    
    });

    try {
      let sel = -1;
      document.getElementById('manager_list').addEventListener("click", function(event){ 
        let i = 0;
        for (var option of document.getElementById('manager_list').options)
        {
            if (option.selected) {              
                document.getElementById('add_manager_url').value = gInfo.url[i];
            }
            i++
        } 
      }) 
    } catch (error) {
      var ii = 1;
    } 

    /*
    try {
      $("#").on("change", function(event) {
        let sel = $('option:selected', this).val();
        document.getElementById('add_manager_url').value;
        $("#add_manager_url").val(gInfo.url[sel]);
      }) 
    } catch (error) {
      var ii = 1;
    } 
    */

    document.getElementById('add_manager_button').disabled = false;  
    document.getElementById('sync_manager_button').disabled = false;  
    document.getElementById('add_manager_detach').disabled = false;     
  });

  ipcRenderer.on('add_manager_status', (event, msg) => {
    SetHtml('add_manager_status',msg);
  });

  ipcRenderer.on('add_manager_enable', (event) => {
    document.getElementById('add_manager_button').disabled = false;  
    document.getElementById('sync_manager_button').disabled = false;  
    document.getElementById('add_manager_detach').disabled = false;  
  });

  ipcRenderer.send('add_manager','ready');
  
  document.getElementById('add_manager_website').addEventListener("click", function(event){ 
    let url  =  document.getElementById('add_manager_url').value;
    shell.openExternal(url);     
  });

  document.getElementById('add_manager_button').addEventListener("click", function(event){ 
    managerButton(false);
  });

  document.getElementById('sync_manager_button').addEventListener("click", function(event){ 
    managerButton(true);
  });

  document.getElementById('add_manager_detach').addEventListener("click", function(event){ 
    detachButton();
  });

  ipcRenderer.on('info_manager_status', (event, msg)=> {
    SetHtml('info_manager_status',msg)
  });

  ipcRenderer.on('translations', (event, dlg) => {
    SetHtml('trans_selected_computers',dlg.DAM_SELECTED_COMPUTERS);
    SetHtml('trans_add_manager',dlg.DAM_ADD_MANAGER);
    SetHtml('trans_url',dlg.DAM_URL);
    SetHtml('trans_login',dlg.DAM_LOGIN);
    SetHtml('trans_password',dlg.DAM_PASSWORD);
    SetHtml('add_manager_button',dlg.DAM_BUTTON_ADD_MANAGER);
    SetHtml('sync_manager_button',dlg.DAM_BUTTON_SYNC);
    SetHtml('add_manager_website',dlg.DAM_BUTTON_WEBSITE);
    SetHtml('add_manager_detach',dlg.DAM_BUTTON_DETACH);   
  });

});

function managerButton(sync)
{
  let item = new Object() ;
  try {
    document.getElementById('add_manager_button').disabled = true;  
    document.getElementById('sync_manager_button').disabled = true;  
    document.getElementById('add_manager_detach').disabled = true;       

    item.loginName = document.getElementById('add_manager_login_name').value;
    item.passWord  = document.getElementById('add_manager_password').value;
    item.url  = document.getElementById('add_manager_url').value;
   
    let selArray = [];
    for (var option of document.getElementById('computer_list').options)
    {
        if (option.selected) {
            sel = option.text;
            selArray.push(sel);
        }
    } 

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
    document.getElementById('add_manager_button').disabled = true;  
    document.getElementById('sync_manager_button').disabled = true;  
    document.getElementById('add_manager_detach').disabled = true; 
    
    item.loginName = "";
    item.passWord  = "";
    item.url  = "";
    
    let selArray = [];
    for (var option of document.getElementById('computer_list').options)
    {
        if (option.selected) {
            sel = option.text;
            selArray.push(sel);
        }
    } 
    item.sel = selArray;
    ipcRenderer.send('add_manager', 'ok', item);
  } catch (error) {
    var ii = 1;
  }   
}

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