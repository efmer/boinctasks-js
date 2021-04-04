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

$(document).ready(function() {
    ipcRenderer.on('settings_allow', (event,cpu,gpu,network) => {
        $("#allow_to_run_cpu").html(cpu);
        $("#allow_to_run_gpu").html(gpu);
        $("#allow_network").html(network); 
        $('#apply').attr("disabled", false);                
    });
 
    $( "#apply" ).on( "click", function(event) {

        $('#apply').attr("disabled", true);
        let combined = new Object();
        combined.selCpu = [];
        combined.selGpu = [];
        combined.selNetwork = [];
        combined.snoozeCpu = [];
        combined.snoozeGpu = [];
        combined.snoozeNetwork = [];        

        $('#allow_to_run_cpu option:selected').each(function() {
            let sel = $(this).val()
            combined.selCpu.push(sel);
        });
        $('#allow_to_run_gpu option:selected').each(function() {
            let sel = $(this).val()
            combined.selGpu.push(sel);
        });
        $('#allow_network option:selected').each(function() {
            let sel = $(this).val()
            combined.selNetwork.push(sel);
        });

        $('#allow_to_run_cpu input').each(function() {
            let sel = $(this).val()
            combined.snoozeCpu.push(sel);
        });
        $('#allow_to_run_gpu input').each(function() {
            let sel = $(this).val()
            combined.snoozeGpu.push(sel);
        });
        $('#allow_network input').each(function() {
            let sel = $(this).val()
            combined.snoozeNetwork.push(sel);
        });

        ipcRenderer.send('settings_allow',combined);
    });    
});

