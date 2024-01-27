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
  try {
    ipcRenderer.on('memory_first', (event, data) => {
      process(true,data);
      document.getElementById('heapSnapShot').addEventListener("click", function(event){     
        ipcRenderer.send('memory_heap');
      });
    })

    ipcRenderer.on('memory', (event, data) => {
      process(false,data);          
    })

    ipcRenderer.on('memory_file', (event, msg) => {
      SetHtml('memoryFile',msg);
    })

  } catch (error) {
    let ii = 1;
  }
});

function process(bFirst,data)
{
  let nl = "\r\n";
  let txt = "";
  if (bFirst)
  {
    txt = "time,heapSize,totalHeapSize,usedHeapSize,totalPhysicalSize,totalAvailSize,limitHeapSize,mallocSize,mallocPeakSize,chromeHeapSizeLimit,chromeHeapSize,chromeHeapSizeUsed" + nl;
  }

  if (data !== null)
  {
    let kb = 1;
    let mb = 1024;

    SetHtml('heapSize',data.totalHeapSize/kb + ' KB');
    SetHtml('totalHeapSize',data.totalHeapSizeExecutable/kb + ' KB');
    SetHtml('usedHeapSize',data.usedHeapSize/kb + ' KB');
    SetHtml('totalPhysicalSize',data.totalPhysicalSize/kb + ' KB');
    SetHtml('totalAvailSize',data.totalAvailableSize/kb + ' KB');
    SetHtml('limitHeapSize',data.heapSizeLimit/kb + ' KB');
    SetHtml('mallocSize',data.mallocedMemory/kb + ' KB');
    SetHtml('mallocPeakSize',data.peakMallocedMemory/kb + ' KB');
    SetHtml('zapGarbage',data.doesZapGarbage);
           
    txt += getTime() + ",";
    txt += data.totalHeapSize/kb + ','
    txt += data.totalHeapSizeExecutable/kb + ','
    txt += data.usedHeapSize/kb + ','
    txt += data.totalPhysicalSize/kb + ','
    txt += data.totalAvailableSize/kb + ','
    txt += data.heapSizeLimit/kb + ','
    txt += data.mallocedMemory/kb + ','
    txt += data.peakMallocedMemory/kb + ','

    try {
      let perf = window.performance.memory;      
      txt += perf.jsHeapSizeLimit + ',';
      txt += perf.totalJSHeapSize + ',';
      txt += perf.usedJSHeapSize;
      SetHtml('chromeHeapSizeLimit',perf.jsHeapSizeLimit);
      SetHtml('chromeHeapSize',perf.totalJSHeapSize);
      SetHtml('chromeHeapSizeUsed',perf.usedJSHeapSize);
    } catch (error) {
      let i = 1;
    }
  
    txt += nl;

    const obj = Object.create(null);
    obj.txt = txt;
    obj.first = bFirst;
    ipcRenderer.send('memory', obj);
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

function getTime()
{
    try {

        let date = new Date();
        let txt = date.toLocaleDateString() + " - ";
        txt += date.toLocaleTimeString();
        return txt;
    } catch (error) {
        let ii  = 1;
    }
}