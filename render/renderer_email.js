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

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.on('set', (event, item) => {

    SetValue('email_email',item.email);
    SetValue('email_password',item.passWord);
    SetValue('email_send',item.send);
    SetHtml('email_status','');
  });

  ipcRenderer.on('status', (event, status) => {
    SetHtml('email_status',status);   
  });

  document.getElementById('password_eye').addEventListener("click", function(event){    
    if (gPasswordVisible)
    {
      document.getElementById('password_eye').classList.add("bt_img_input_eye_not");  
      document.getElementById('password_eye').classList.remove("bt_img_input_eye");          
      document.getElementById('email_password').setAttribute('type', 'password');    
    }
    else
    {
      document.getElementById('password_eye').classList.remove("bt_img_input_eye_not");  
      document.getElementById('password_eye').classList.add("bt_img_input_eye");           
      document.getElementById('email_password').setAttribute('type', 'text');      
    }
    gPasswordVisible = !gPasswordVisible;    
  });

  document.getElementById('email_apply').addEventListener("click", function(event){ 
    let item = new Object() ;
    try {
      getValues(item);
      ipcRenderer.send('email', 'apply', item);
    } catch (error) {
      var ii = 1;
    }      
  });

  document.getElementById('email_test').addEventListener("click", function(event){ 
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
    item.email = document.getElementById('email_email').value;
    item.passWord = document.getElementById('email_password').value;
    item.send = document.getElementById('email_send').value;   
  }
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