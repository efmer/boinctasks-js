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

'use strict';

const { ipcRenderer } = require('electron')

let gType = null;

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('set', (event, type, items) => {
        gType = type;
        let str = JSON.parse(items)
        SetHtml('order_list',str);
        Sortable.create(sort_items, {
            animation: 150
        });             
    });

    document.getElementById('apply').addEventListener("click", function(event){  
        try {
            let selArray = [];
            var el = document.getElementsByClassName("list-group-item");
            for (var i = 0; i < el.length; i++) 
            {
                let item = el[i];
                let idFound = item.id;
                let id = 'check_' + idFound;
                let input = document.getElementById(id);
                let checked = input.checked;
                selArray.push(idFound);
                selArray.push(checked);
            }
            ipcRenderer.send('colomn_order',gType,selArray);
        } catch (error)
        {
            var ii = 1;    
        }        
    });

    ipcRenderer.on('translations', (event, dlg) => {
        SetHtml('trans_info',dlg.DCO_INFO);
        SetHtml('apply',dlg.DCO_APPLY);
    });

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