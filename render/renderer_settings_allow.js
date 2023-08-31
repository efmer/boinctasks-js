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

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.on('settings_allow', (event,cpu,gpu,network) => {
        SetHtml('allow_to_run_cpu',cpu);
        SetHtml('allow_to_run_gpu',gpu);
        SetHtml('allow_network',network);
        document.getElementById('apply').disabled = false;                 
    });
 
    document.getElementById('apply').addEventListener("click", function(event){
        document.getElementById('apply').disabled = true;  
        let combined = new Object();
        combined.selCpu = [];
        combined.selGpu = [];
        combined.selNetwork = [];
        combined.snoozeCpu = [];
        combined.snoozeGpu = [];
        combined.snoozeNetwork = [];        

        readBox('allow_to_run_cpu',combined.selCpu,combined.snoozeCpu);
        readBox('allow_to_run_gpu',combined.selGpu,combined.snoozeGpu);
        readBox('allow_network',combined.selNetwork,combined.snoozeNetwork);        
        ipcRenderer.send('settings_allow',combined);
    });

    ipcRenderer.on('translations', (event, dlg) => {
        SetHtml('trans_allow_cpu',dlg.DSA_ALLOW_TO_RUN_CPU);
        SetHtml('trans_allow_gpu',dlg.DSA_ALLOW_TO_RUN_GPU);
        SetHtml('trans_allow_network',dlg.DSA_ALLOW_NETWORK);
        SetHtml('apply',dlg.DSA_BUTTON_APPLY);
    });

});

function readBox(tag,pushSel,pushSnooze)
{
    let el = document.getElementById(tag);
    let cols = el.querySelectorAll('tr'); 
    for (let ic=0;ic<cols.length;ic++)
    {
        let colq = cols[ic].querySelectorAll('td');  
        for (let i=0;i<colq.length;i+=3)
        {
            let option = colq[i+1].firstElementChild;
            for (let ii=0;ii<option.length;ii++)
            {
                let opIi = option[ii];
                let val = opIi.value;
                if (opIi.selected)
                {
                    pushSel.push(val);
                    break;
                }
            };
            let input = colq[i+2].firstElementChild;
            let snooze = parseInt(input.value);
            pushSnooze.push(snooze);
        };
    };
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
