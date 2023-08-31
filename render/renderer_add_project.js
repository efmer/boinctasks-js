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
  ipcRenderer.on('add_project_init', (event, listC, listP, info) => {
    SetHtml('computer_list',listC);
    SetHtml('project_list',listP);
    SetHtml('project_description',info.description);
    SetValue('add_project_url',info.url);
    SetValue('add_project_login_name',info.email);
    SetValue('add_project_password',info.password);

    gInfo = info;

    document.getElementById('add_project_website').addEventListener("click", function(event){  
      let url = gInfo.web_url
      shell.openExternal(url);     
    });

    document.getElementById('add_project_button').addEventListener("click", function(event){      
      projectButton()    
    });

    document.getElementById('password_eye').addEventListener("click", function(event){         
      if (gPasswordVisible)
      {
        document.getElementById('password_eye').classList.add("bt_img_input_eye_not");  
        document.getElementById('password_eye').classList.remove("bt_img_input_eye");          
        document.getElementById('add_project_password').setAttribute('type', 'password');   
      }
      else
      {
        document.getElementById('password_eye').classList.remove("bt_img_input_eye_not");  
        document.getElementById('password_eye').classList.add("bt_img_input_eye");           
        document.getElementById('add_project_password').setAttribute('type', 'text');              
      }
      gPasswordVisible = !gPasswordVisible;    
    });

    try {
      let sel = -1;
      document.getElementById('project_list').addEventListener("click", function(event){ 
        for (var option of document.getElementById('project_list').options)
        {
            if (option.selected) {
                sel = option.text;
            }
        } 
        ipcRenderer.send('add_project','project_changed', sel) 
      }) 
    } catch (error) {
      var ii = 1;
    } 

    document.getElementById('add_project_button').disabled = false;  
  });

  ipcRenderer.on('add_project_description', (event, info) => {
    SetHtml('project_description',info.description);
    SetValue('add_project_url',info.url);
    gInfo = info;
  });

  ipcRenderer.on('add_project_status', (event, msg) => {
    SetHtml('add_project_status',msg);
  });

  ipcRenderer.on('add_project_enable', (event) => {
    document.getElementById('add_project_button').disabled = false;      
  });

  ipcRenderer.send('add_project','ready');

  ipcRenderer.on('translations', (event, dlg) => {
    SetHtml('add_project_website',dlg.DAP_WEBSITE);
    SetHtml('trans_password',dlg.DAP_PASSWORD);
    SetHtml('trans_login',dlg.DAP_LOGIN);
    SetHtml('trans_project_url',dlg.DAP_PROJECT_URL);
    SetHtml('trans_add_project',dlg.DAP_ADD_PROJECT);
    SetHtml('trans_add_project_computers',dlg.DAP_ADD_TO_COMPUTERS);
    SetHtml('add_project_button',dlg.DAP_ADD_PROJECT_BUTTON); 
  });

});

function projectButton()
{
  let item = new Object() ;
  try {
    document.getElementById('add_project_button').disabled = true;   
    item.loginName = document.getElementById('add_project_login_name').value;
    item.passWord  = document.getElementById('add_project_password').value;
    item.url  = document.getElementById('add_project_url').value;
    
    let selArray = [];
    for (var option of document.getElementById('computer_list').options)
    {
        if (option.selected) {
            sel = option.text;
            selArray.push(sel);            
        }
    } 
    item.sel = selArray;
    ipcRenderer.send('add_project', 'ok', item);
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