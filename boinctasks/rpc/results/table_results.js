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

const Logging = require('../functions/logging');
const logging = new Logging();
const Functions = require('../functions/functions');
const functions = new Functions();

const btConstants = require('../functions/btconstants');

class BtTableResults{
  tableHeader(gb, sidebar)
  {
    var table = '<table id="table_header" class="bt_table_header';
    if (sidebar) table += ' sidebar_computer_header">';
    else table += '">';

    table += tableResultsHeader(gb, true);
    table += '</table>';
    return table;    
  }
  table(gb,cTable)
  {
    if (cTable.length === 1)
    {
      if (cTable[0].length === 0)
      {
        return btConstants.EMPTY_TABLE;
      }
    }
    let color = gb.color;
    var tableArray = tableResultsArray(gb, cTable, color);
    var table = tableResults(gb,tableArray);
    return table;    
  }
  tableArray(con)
  {
    return tableResultsArray(con);
  }

  /*
  clickOnRow(id)
  {
    clickRow(id);   
  }

  */

  selectedCount(gb)
  {
    return gb.rowSelect.results.rowSelected.length;
  }
}

module.exports = BtTableResults;

function tableResults(gb,tableArray)
{
  var table = "";
  try {
    var table = '<table class="bt_table">';   
    table += tableResultsHeader(gb,false);
    for (var i =0; i<tableArray.length; i++)
    {
      table += tableArray[i];
    }    

    table += '</table>';
    return table;

  } catch (error) {
    logging.logError('BtTableResults,tableResults', error);    
    return "";
  }
}

function tableResultsArray(gb, resultTable, color)
{
  var tableArray = [];
  try {
    let order = gb.order.tasks;

    let selRows = gb.rowSelect.results;
    for (let s=0; s< selRows.length;s++)
    {
      selRows.present[s] = false;
    }

    let filter = resultTable[0]

    for (var i =1; i<resultTable.length; i++) // first is filter
    {
      var bFoundF = false;
      var rt = resultTable[i];
      if (rt.filtered)
      {
        var app = rt.computerName+rt.app+rt.statusS;
        for (var f=0;f<filter.length;f++)
        {
          if (app === filter[f])
          {
            bFoundF = true;
            tableArray.push(tableResultItem(selRows, i, order, resultTable[i],true, color));
            var rtf = rt.resultTable;
            for (var rt=0;rt<rtf.length;rt++)
            { 
              tableArray.push(tableResultItem(selRows, i+rt, order, rtf[rt],false, color));
            }
          }
        }
      }
      if (!bFoundF)
      {
        tableArray.push(tableResultItem(selRows, i, order, resultTable[i],false, color));
      }
    }    

    // check if selected still present.
    for (let s=0; s<selRows.rowSelected.length;s++)
    {
      if(!selRows.present[s])
      {
        selRows.rowSelected.splice(s, 1); 
        selRows.present.splice(s, 1);  
      }
    }

    return tableArray;

  } catch (error) {
    logging.logError('BtTableResults,tableResultsArray', error);    
    return tableArray;
  }
}


function tableResultsHeader(gb, addText)
{
  let header = "<tr>"
  let items = [];
  let order = gb.order.tasks;
  if (addText)
  {
    items[order.order[0]] = addRowHeader(order.check[0],true, gb, 0, btConstants.GENERAL_COMPUTER);
    items[order.order[1]] = addRowHeader(order.check[1],true, gb, 1, btConstants.GENERAL_PROJECT);
    items[order.order[2]] = addRowHeader(order.check[2],true, gb, 2, btConstants.GENERAL_APPLICATION);
    items[order.order[3]] = addRowHeader(order.check[3],true, gb, 3, btConstants.GENERAL_NAME);
    items[order.order[4]] = addRowHeader(order.check[4],true, gb, 4, btConstants.GENERAL_ELAPSED);
    items[order.order[5]] = addRowHeader(order.check[5],true, gb, 5, btConstants.GENERAL_CPU);
    items[order.order[6]] = addRowHeader(order.check[6],true, gb, 6, btConstants.GENERAL_PROGRESS);
    items[order.order[7]] = addRowHeader(order.check[7],true, gb, 7, btConstants.TASK_TIMELEFT);
    items[order.order[8]] = addRowHeader(order.check[8],true, gb, 8, btConstants.TASK_DEADLINE);  
    items[order.order[9]] = addRowHeader(order.check[9],true, gb, 9, btConstants.TASK_USE); 
    items[order.order[10]] = addRowHeader(order.check[10],true, gb, 10, btConstants.GENERAL_STATUS);
    items[order.order[11]] = addRowHeader(order.check[11],true, gb, 11, btConstants.TASK_CHECKPOINT);
    items[order.order[12]] = addRowHeader(order.check[12],true, gb, 12, btConstants.TASK_RECEIVED);
    items[order.order[13]] = addRowHeader(order.check[13],true, gb, 13, btConstants.TASK_MEMORYV);
    items[order.order[14]] = addRowHeader(order.check[14],true, gb, 14, btConstants.TASK_MEMORY);
    items[order.order[15]] = addRowHeader(order.check[15],true, gb, 15, btConstants.TASK_TEMP);
    items[order.order[16]] = addRowHeader(order.check[16],true, gb, 16, btConstants.TASK_TTHROTTLE);        
  }
  else
  {
    items[order.order[0]] = addRowHeader(order.check[0],false, gb, 0, "");
    items[order.order[1]] = addRowHeader(order.check[1],false, gb, 1, "");
    items[order.order[2]] = addRowHeader(order.check[2],false, gb, 2, "");
    items[order.order[3]] = addRowHeader(order.check[3],false, gb, 3, "");
    items[order.order[4]] = addRowHeader(order.check[4],false, gb, 4, "");
    items[order.order[5]] = addRowHeader(order.check[5],false, gb, 5, "");
    items[order.order[6]] = addRowHeader(order.check[6],false, gb, 6, "");
    items[order.order[7]] = addRowHeader(order.check[7],false, gb, 7, "");
    items[order.order[8]] = addRowHeader(order.check[8],false, gb, 8, "");
    items[order.order[9]] = addRowHeader(order.check[9],false, gb, 9, "");
    items[order.order[10]] = addRowHeader(order.check[10],false, gb, 10, "");
    items[order.order[11]] = addRowHeader(order.check[11],false, gb, 11, "");
    items[order.order[12]] = addRowHeader(order.check[12],false, gb, 12, "");
    items[order.order[13]] = addRowHeader(order.check[13],false, gb, 13, "");
    items[order.order[14]] = addRowHeader(order.check[14],false, gb, 14, "");
    items[order.order[15]] = addRowHeader(order.check[15],false, gb, 15, "");
    items[order.order[16]] = addRowHeader(order.check[16],false, gb, 16, "");
  }
  for (let i=0;i<items.length;i++)
  {
    header += items[i];
  }

  header +="</tr>"
  return header;
}

function tableResultItem(selRows, i, order, result, filter, colorObj)
{
  var sel = "";
  let table = "";
  let items = [];
  try {
    let computer =  result.computerName;
    let projectUrl = result.projectUrl;
    let wu = result.wu;
    let wuName = result.wuName;
    let app = result.app;
    let status = result.statusS;
    let selId = wuName + btConstants.SEPERATOR_SELECT + computer + btConstants.SEPERATOR_SELECT + projectUrl;
    if (result.filtered)
    {
      selId += app + btConstants.SEPERATOR_FILTER + computer;
    }
    let iSel = selRows.rowSelected.indexOf(selId)
    if (iSel >= 0)
    {
      selRows.present[iSel] = true;
      sel = ' class ="bt_table_selected" ';
    }

    let cpuGpu = Object;
    cpuGpu.cuda = false;
    if (result.resources.length > 0)
    {
      use = result.resources[0];
      use = getCpuGpu(use, cpuGpu);
    }
    else use = "";

    color = getColor(i, colorObj, result, cpuGpu);
    table = "<tr " + sel + color + ">";

    items[order.order[0]] = addRow(order.check[0],selId, 0, result.computerName);
    items[order.order[1]] = addRow(order.check[1],selId, 1, result.project);

    items[order.order[2]] = addRow(order.check[2],selId, 2, app);

    let item;
    if (result.filtered)
    {
      let sclass = "bt_table_filtered";
      if (filter)
      {
        sclass += " bt_img_arrow_down_left";
      }
      else 
      {
        sclass += " bt_img_arrow_right";
      }
      item = '<div id="filter' + btConstants.SEPERATOR_ITEM + computer+app+status + '" class="' + sclass + '">'+ wu + '</div>'  
      items[order.order[3]] = addRow(order.check[3],selId,3,item);   
    }
    else  items[order.order[3]] = addRow(order.check[3],selId, 3, wuName);  

    let elapsedS = functions.getFormattedTimeInterval(result.elapsed); 
    items[order.order[4]] = addRow(order.check[4],selId, 4, elapsedS); 

    let cpu = parseFloat(result.cpu);
    let style = 'style="background-color:' + colorObj['#progress_bar'] + '!important;' + 'width:'+ cpu + '%;">';
    let cpuS = "";
    if (cpu > 0)
    {             
        cpuS = cpu.toFixed(2) + "%";                     
    }

    item = '<div ' + style + cpuS + '</div>'
    items[order.order[5]] = addRow(order.check[5],selId, 5, item);

    let fraction = parseFloat(result.fraction);
    let fractionS = "";
    if (fraction > 0)   fractionS = fraction.toFixed(3) + "%"; 

    style = 'style="background-color:' + colorObj['#progress_bar'] + '!important;' + 'width:'+ fraction + '%;" >';
    item = '<div ' + style + fractionS + '</div>'    
    items[order.order[6]] = addRow(order.check[6],selId, 6, item);

    let remainingS = functions.getFormattedTimeInterval(result.remaining); 
    items[order.order[7]] = addRow(order.check[7],selId, 7, remainingS);
    let deadlineS = functions.getFormattedTimeDiff(result.deadline)    
    items[order.order[8]] = addRow(order.check[8], selId, 8, deadlineS);  
    items[order.order[9]] = addRow(order.check[9], selId, 9, use);     
    items[order.order[10]] = addRow(order.check[10], selId, 10, status);

    let checkpoint = result.checkpoint;
    let checkpointS = "";
    if (checkpoint> 0)
    {
      checkpointS = functions.getFormattedTimeInterval(checkpoint); 
    }
    items[order.order[11]] = addRow(order.check[11],selId, 11, checkpointS);      

    let recieved = result.received;
    let recievedS = functions.getFormattedTime(recieved);
    items[order.order[12]] = addRow(order.check[12], selId, 12, recievedS);

    let swap = result.swap;
    swap = swap / 1048576; // Mega
    let swapS = "";
    if (swap > 0) swapS = swap.toFixed(2) + " MB";
    items[order.order[13]] = addRow(order.check[13], selId, 13, swapS);

    let memory = result.memory;
    memory = memory / 1048576; // Mega
    let memoryS = "";
    if (memory > 0) memoryS = memory.toFixed(2) + " MB";
    items[order.order[14]] = addRow(order.check[14], selId, 14, memoryS);

    let bGpu = false;
    if (order.check[15] || order.check[16]) 
    {
      let pos = use.indexOf("NV");
      if (pos < 0) pos = use.indexOf("ATI");
      else bGpu  = true;
      if (pos >= 0) bGpu = true;
    }

    let percG = -1;
    if (order.check[15]) // Temperature
    {
      let temp = "";
      if (result.cpuTemp !== void 0 || result.gpuTemp !== void 0)
      {
        if (bGpu)
        {
          if (result.gpuTemp.length > 0)
          {
            temp = result.gpuTemp[0]
            pos = use.indexOf("(d");
            if (pos >=0)
            {
              let nr = parseInt(use.substring(pos+2));
              let pt = result.gpuTemp[nr];
              if (pt !== void 0) temp = pt;
              let pp = result.gpuPerc[nr];
              if (pp !== void 0)
              {
                if (pp < 0) percG = 0;
                else
                {
                   percG = pp;
                }
              }
            }
            temp += " ℃";
          }    
        }
        else
        {
          temp = result.cpuTemp
        }
      }
      items[order.order[15]] = addRow(order.check[15], selId, 15, temp);      
    }
    if (order.check[16]) // TThrottle
    {
      let item = "";
      let tthrottle = -1;
      if (bGpu)
      {
        if (percG >= 0) tthrottle = percG; // take run % instead of TThrottle if present
        else
        {
          if (result.gpuT !== void 0)
          {
            if (result.gpuT > 0) tthrottle = result.gpuT;
          }
        }
      }
      else
      {
        if (result.cpuT !== void 0)
        {
          if (result.cpuT > 0) tthrottle = result.cpuT;
        }
      }
      if (tthrottle > 0)      
      {
        style = 'style="background-color:' + colorObj['#progress_bar'] + '!important;' + 'width:'+ tthrottle + '%;">';
        item = '<div ' + style + tthrottle  + " %" + '</div>'          
      }
      else
      {
        item = '<div></div>'
      }
      items[order.order[16]] = addRow(order.check[16], selId, 16, item);
    }
  } catch (error) {
    logging.logError('BtTableResults,tableResultItem', error);    
  }

  items[order.check[order.order[7]]]


  for (let i=0;i<items.length;i++)
  {
    table += items[i];
  }

  table += "</tr>";
  return table;
}

function addRow(check, rowId, cell, item)
{
  if (!check) return "";
  let id = ' id="r'+ btConstants.SEPERATOR_ITEM + rowId + btConstants.SEPERATOR_ITEM + cell +'"';
  return '<td' + id + ">" + item + "</td>";
}

function addRowHeader(check, showSort ,gb , cell, item)
{
  if (!check) return "";
  let sort = gb.sortResults;
  let hclass = "";
  if (sort !== null && showSort)
  {
    if (sort.pCol === cell)
    {
      hclass = ' class="';
      hclass+= getHeaderArrow(sort.pDir)
      hclass+= '1" ';
    }
    else
    {
      if (sort.sCol === cell)      
      {
        hclass = ' class="';
        hclass+= getHeaderArrow(sort.sDir)
        hclass+= '2" ';   
      } else
      {
        if (sort.tCol === cell)  
        {         
          hclass = ' class="';
          hclass+= getHeaderArrow(sort.tDir)
          hclass+= '3" ';        
        }
      }
    }
  }
  let widthS = "";
  let width = gb.widthTasks[cell];
  widthS = ' style="width:' + width + '%" ';

  if (gb.headerAction === btConstants.HEADER_RESIZE)
  {
    hclass = 'class="resizer"';

    if (gb.widthTasksPX !== null)
    {
      let width = gb.widthTasksPX[cell];
      widthS = ' style="width:' + width + 'px" ';
    }
    else
    {
      let width = gb.widthTasks[cell];
      widthS = ' style="width:' + width + '%" ';
    }
  }

  let id = ' id="' + cell +'"'; 
  let th = "<th " + widthS + id + hclass + ">" + item + '<div class="resizer"></div></th>';
  return th;
}

function getHeaderArrow(dir)
{
  var hclass = "";
  switch (dir)
  {
    case "up":
      hclass = "bt_img_arrow_down";
    break;
    case "down":
      hclass = "bt_img_arrow_up";   
    break;
  }
  return hclass;
}

function getCpuGpu(res, cpuGpu)
{
  cpuGpu.cuda = false;
  var i = res.indexOf("GPU");

  if ((res.indexOf("GPU") >= 0) || (res.indexOf("CUDA") >=0))
  {
    cpuGpu.cuda = true;
    res = res.replace(" CPUs","C");
    res = res.replace(" CPU", "C");
    res = res.replace(".00","");
    res = res.replace(" NVIDIA GPUs","NV");
    res = res.replace(" NVIDIA GPU","NV");
    res = res.replace(" Nvidia GPU", "NV");
    res = res.replace(" ATI GPUs","ATI");
    res = res.replace(" AMD/ATI GPU", "ATI");
    res = res.replace(" AMD / ATI GPU", "ATI");
  
    res = res.replace(" intel GPU", "INT");
    res = res.replace(" intel_gpu GPU","INT");
    res = res.replace(" Intel GPU", "INT");
    res = res.replace("device ","d");
    res = res.replace("Device ", "d");
  }
  return res;
}

function getColor(i, color, result, cpuGpu)
{
  var style = "";
  try{
    var statusN = result.statusN;
    let hp = result.hp; 
    if (cpuGpu.cuda)
    {
      switch(statusN) // GPU
      {
        case btConstants.TASK_STATUS_READY_REPORT_N:
            color = color['#gtask_ready_report'];
        break;
        case btConstants.TASK_STATUS_RUNNING_N:
          if (hp)
          {
            color = color['#gtask_running_hp'];
          }
          else
          {
            color = color['#gtask_running'];
          }
        break;
        case btConstants.TASK_STATUS_WAITING_N:
          color = color['#gtask_waiting_run'];
        break;
        case btConstants.TASK_STATUS_READY_START_N:
          color = color['#gtask_ready_start'];
        break; 
        case btConstants.TASK_STATUS_COMPUTATION_N:
          color = color['#gtask_error'];
        break;  
        case btConstants.TASK_STATUS_SUSPENDED_N: 
          color = color['#gtask_suspended']; 
        break;
        case btConstants.TASK_STATUS_SUSPENDED_USER_N:
          color = color['#gtask_suspended_user'];
        break;        
        case btConstants.TASK_STATUS_ABORT_N: 
          color = color['#gtask_abort'];
        break;   
        case btConstants.TASK_STATUS_DOWNLOADING_N:                  
        case btConstants.TASK_STATUS_UPLOADING_N: 
          color = color['#gtask_download'];
        break;             
      }      
    }
    else
    {
      switch(statusN)
      {
        case btConstants.TASK_STATUS_READY_REPORT_N:
            color = color['#task_ready_report'];
        break;
        case btConstants.TASK_STATUS_RUNNING_N:
          if (hp)
          {
            color = color['#task_running_hp'];
          }
          else
          {
            color = color['#task_running'];
          }
        break;
        case btConstants.TASK_STATUS_WAITING_N:
          color = color['#task_waiting_run'];
        break;
        case btConstants.TASK_STATUS_READY_START_N:
          color = color['#task_ready_start'];
        break; 
        case btConstants.TASK_STATUS_COMPUTATION_N:
          color = color['#task_error'];
        break;  
        case btConstants.TASK_STATUS_SUSPENDED_N: 
          color = color['#task_suspended']; 
        break;
        case btConstants.TASK_STATUS_SUSPENDED_USER_N:
          color = color['#task_suspended_user'];
        break;        
        case btConstants.TASK_STATUS_ABORT_N: 
          color = color['#task_abort'];
        break;   
        case btConstants.TASK_STATUS_DOWNLOADING_N:                  
        case btConstants.TASK_STATUS_UPLOADING_N: 
          color = color['#task_download'];
        break;             
      }      
    }

    let even = "";
    if (i % 2 == 0)
    {
      even = "filter: brightness(108%);"
    }
    style = 'style="background-color:' + color + ';' + even + '"'

  } catch (error) {
    logging.logError('BtTableResults,tableResultItem', error);    
  }    
  
  return style;
}