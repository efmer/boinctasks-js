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

$(document).ready(function() {
    ipcRenderer.on('set', (event, type, items) => {
        gType = type;
        let str = JSON.parse(items)
        $('#order_list').html(str);
        Sortable.create(sort_items, {
            animation: 150
            });             
    });

    $("#apply").click(function( event ) {
        try {
            let selArray = [];
            $('.list-group-item').each(function() {
                let idFound = $(this).attr("id");
                let id = '#check_' + idFound;
                let checked = $(id).is(":checked")
                selArray.push(idFound);
                selArray.push(checked);
              }); 
              ipcRenderer.send('colomn_order',gType,selArray);
        } catch (error) {
            var ii = 1;    
        }        
    }); 
});