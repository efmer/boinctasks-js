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

const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const btConstants = require('../functions/btconstants');

class BtTableHistory{
  tableHeader(gb,sidebar)
  {
    var table = '<table id="table_header" class="bt_table_header';
    if (sidebar) table += ' sidebar_computer_header">';
    else table += '">';

    table += tableHistoryHeader(gb,true);
    table += '</table>';
    return table;    
  }
  table(gb,cTable)
  {
    let color = gb.color;
    var tableArray = tableHistoryArray(gb,cTable,color);
    var table = tableHistory(gb,tableArray);
    return table;    
  }
  tableArray(con)
  {
    return tableHistoryArray(con);
  }

  clickOnRow(id)
  {
    clickRow(id);   
  }

  selectedCount(gb)
  {
    return gb.rowSelect.history.rowSelected.length;
  }
}

module.exports = BtTableHistory;

function tableHistory(gb, tableArray)
{
  var table = "";
  try {
    var table = '<table class="bt_table">';   
    table += tableHistoryHeader(gb, false);

//    var sel = false;
    for (var i =0; i<tableArray.length; i++)
    {
//      var found = g_tableHistorySelected.indexOf(i.toString());
//      if (found >= 0) sel = true;
//      else sel = false;
      
      table += tableArray[i];
    }    

    table += '</table>';
    return table;

  } catch (error) {
    logging.logError('BtTableHistory,tableHistory', error);      
    return "";
  }
}

function tableHistoryArray(gb, historyTable,color)
{
  var tableArray = [];
  try {
    let order = gb.order.history;    
    let selRows = gb.rowSelect.history;    
    for (let s=0; s< selRows.length;s++)
    {
      selRows.present[s] = false;
    }

    for (var i =0; i<historyTable.length; i++)
    {
      tableArray.push(tableHistoryItem(selRows,i,order,historyTable[i],color));
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
    logging.logError('BtTableHistory,tableHistoryArray', error);      
    return tableArray;
  }
}


function tableHistoryHeader(gb, addText)
{
  let header = "<tr>"

  let items = [];
  let order = gb.order.history;
  if (addText)
  {
    items[order.order[0]] = addRowHeader(order.check[0],true, gb, 0, btConstants.GENERAL_COMPUTER);
    items[order.order[1]] = addRowHeader(order.check[1],true, gb, 1, btConstants.GENERAL_PROJECT);
    items[order.order[2]] = addRowHeader(order.check[2],true, gb, 2, btConstants.GENERAL_APPLICATION);
    items[order.order[3]] = addRowHeader(order.check[3],true, gb, 3, btConstants.GENERAL_NAME);
    items[order.order[4]] = addRowHeader(order.check[4],true, gb, 4, btConstants.GENERAL_ELAPSED);
    items[order.order[5]] = addRowHeader(order.check[5],true, gb, 5, btConstants.GENERAL_CPU);
    items[order.order[6]] = addRowHeader(order.check[6],true, gb, 6, btConstants.HISTORY_COMPLETED);
    items[order.order[7]] = addRowHeader(order.check[7],true, gb, 7, btConstants.GENERAL_STATUS); 
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
  }
  for (let i=0;i<items.length;i++)
  {
    header += items[i];
  }

  header +="</tr>"
  return header;
}

function tableHistoryItem(selRows, i, order, history, colorObj)
{
  var sel = "";
  let table = "";
  let items = [];
  try {
    let computer = history.computerName;
    let projectUrl = history.projectUrl;
    let result =  history.result;

    let selId = result + btConstants.SEPERATOR_SELECT + computer + btConstants.SEPERATOR_SELECT + projectUrl;
    let iSel = selRows.rowSelected.indexOf(selId)
    if (iSel >= 0)    
    {
      selRows.present[iSel] = true;      
      sel = ' class ="bt_table_selected" ';
    }

    color = getColor(i, colorObj, history);
    table = "<tr " + sel + color + ">";

    items[order.order[0]] = addRow(order.check[0],selId, 0, computer);
    items[order.order[1]] = addRow(order.check[1],selId, 1, history.projectName);    
    items[order.order[2]] = addRow(order.check[2],selId, 2, history.appNameUF);
    items[order.order[3]] = addRow(order.check[3],selId, 3, result);   
    let elapsedS = functions.getFormattedTimeInterval(history.elapsed);
    items[order.order[4]] = addRow(order.check[4],selId, 4, elapsedS);
    let cpu = (history.cpuTime/history.elapsed) * 100;
    if (isNaN(cpu)) cpu = 0;
    if (cpu > 100) cpu = 100;
    let cpuS = cpu.toFixed(2) + "%";
    let style = 'style="background-color:' + colorObj['#progress_bar'] + '!important;' + 'width:'+ cpu + '%;">';
    item = '<div ' + style + cpuS + '</div>'
    items[order.order[5]] = addRow(order.check[5],selId, 5, item);

    let d = new Date(history.completedTime*1000);
    d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
    let options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    let timeS = d.toLocaleDateString("en-US", options);
    items[order.order[6]] = addRow(order.check[6],selId, 6, timeS);

    let status = "";
    switch (history.exit)
    {
      case 0:
        status = "OK";
      break;
      case -221:
        status = "Aborted by project";
      break;
      default:
        status = "Exit code: " + history.exit;
    }
    items[order.order[7]] = addRow(order.check[7],selId, 7, status);

  } catch (error) {
    logging.logError('BtTableHistory,tableProjectItem', error);      
    return "";
  }
  for (let i=0;i<items.length;i++)
  {
    table += items[i];
  }

  table += "</tr>";
  return table;
}

function addRow(check,rowId, cell, item)
{
  if (!check) return "";    
  var id = ' id="r' + btConstants.SEPERATOR_ITEM + rowId + btConstants.SEPERATOR_ITEM + cell +'"';
  return "<td " + id + ">" + item + "</td>";
}

function addRowHeader(check,showSort, gb, cell, item)
{
  if (!check) return "";  
  let sort = gb.sortHistory;
  let hclass = "";
  if (sort !== null && showSort)
  {
    if (sort.pCol === cell)
    {
      hclass = ' class="';
      hclass+= getHeaderArrow(sort.pDir)
      hclass+= '1" ';
    }
    else{
      if (sort.sCol === cell)      
      {
        hclass = ' class="';
        hclass+= getHeaderArrow(sort.sDir)
        hclass+= '2" ';   
      } else{
        if (sort.tCol === cell)           
        hclass = ' class="';
        hclass+= getHeaderArrow(sort.tDir)
        hclass+= '3" ';        
      }
    }
  }
//  var width = ' width="' + gb.widthHistory[cell] + '%" ';
//  var id = ' id="' + cell +'"'; 
//  return "<th " + width + id + hclass + ">" + item + "</th>";
  let widthS = "";
  let width = gb.widthHistory[cell];
  widthS = ' style="width:' + width + '%" ';

  if (gb.headerAction === btConstants.HEADER_RESIZE)
  {
    hclass = 'class="resizer"';

    if (gb.widthHistoryPX !== null)
    {
      let width = gb.widthHistoryPX[cell];
      widthS = ' style="width:' + width + 'px" ';
    }
    else
    {
      let width = gb.widthHistory[cell];
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

function getColor(i, color, history)
{
  var style = "";
  try{
    if (history.exit === 0)
    {
      color = color['#task_running'];
    }

    let even = "";
    if (i % 2 == 0)
    {
      even = "filter: brightness(108%);"
    }
    style = 'style="background-color:' + color + ';' + even + '"'

  } catch (error) {
    logging.logError('BtTableHistory,getColor', error);    
  }    
  
  return style;
}