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

g_tableTransferSelected = [];
g_tableTransferSelectedP = [];
//g_tableTransferWidth = [8,8,20,5,10,10,10,20]; // in %

class BttableTransfers{
  tableHeader(gb,sidebar)
  {
    var table = '<table id="table_header" class="bt_table_header';
    if (sidebar) table += ' sidebar_computer_header">';
    else table += '">';

    table += tableTransfersHeader(gb,true);
    table += '</table>';
    return table;    
  }
  table(gb,cTable)
  {
    let color = gb.color;    
    var tableArray = tableTransfersArray(gb,cTable,color);
    var table = tableTransfers(gb,tableArray);
    return table;    
  }
  tableArray(con)
  {
    return tableTransfersArray(con);
  }

  clickOnRow(id)
  {
    clickRow(id);   
  }

  selectedCount(gb)
  {
    return gb.rowSelect.transfers.rowSelected.length;
  }
}

module.exports = BttableTransfers;

function tableTransfers(gb,tableArray)
{
  var table = "";
  try {
    var table = '<table class="bt_table">';   
    table += tableTransfersHeader(gb, false);

    for (var i =0; i<tableArray.length; i++)
    {     
      table += tableArray[i];
    }    

    table += '</table>';
    return table;

  } catch (error) {
    logging.logError('BttableTransfers,tableTransfers', error);      
    return "";
  }
}

function tableTransfersArray(gb,transferTable,color)
{
  var tableArray = [];
  try {
    let order = gb.order.transfers;
    let selRows = gb.rowSelect.transfers;    
    for (let s=0; s< selRows.length;s++)
    {
      selRows.present[s] = false;
    }

    for (var i =0; i<transferTable.length; i++)
    {
      tableArray.push(tableTransferItem(selRows,i,order,transferTable[i],color));
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
    logging.logError('BttableTransfers,tableTransfersArray', error);      
    return tableArray;
  }
}


function tableTransfersHeader(gb, addText)
{
  let header = "<tr>"
  let items = [];
  let order = gb.order.transfers;
  if (addText)
  {
    items[order.order[0]] = addRowHeader(order.check[0],true, gb, 0, btConstants.GENERAL_COMPUTER);
    items[order.order[1]] = addRowHeader(order.check[1],true, gb, 1, btConstants.GENERAL_PROJECT);    
    items[order.order[2]] = addRowHeader(order.check[2],true, gb, 2, btConstants.TRANSFERS_FILE);
    items[order.order[3]] = addRowHeader(order.check[3],true, gb, 3, btConstants.GENERAL_PROGRESS);
    items[order.order[4]] = addRowHeader(order.check[4],true, gb, 4, btConstants.TRANSFERS_SIZE);
    items[order.order[5]] = addRowHeader(order.check[5],true, gb, 5, btConstants.GENERAL_ELAPSED);
    items[order.order[6]] = addRowHeader(order.check[6],true, gb, 6, btConstants.TRANSFERS_SPEED);
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

function tableTransferItem(selRows,i,order,transfer,colorObj)
{
  let sel = "";
  let table = "";
  let items = [];
  try {
    let computer = transfer.computerName;
    let projectUrl = transfer.project_url;
    let wu = transfer.name;

    let selId = wu + btConstants.SEPERATOR_SELECT + computer + btConstants.SEPERATOR_SELECT + projectUrl;
    let iSel = selRows.rowSelected.indexOf(selId)
    if (iSel >= 0)
    {
      selRows.present[iSel] = true;
      sel = ' class ="bt_table_selected" ';
    }

    table = "<tr " + sel + ">";
    items[order.order[0]] = addRow(order.check[0],selId, 0, computer);
    items[order.order[1]] = addRow(order.check[1],selId, 1, transfer.project_name);
    items[order.order[2]] = addRow(order.check[2],selId, 2, wu);

    let first_request_time = 0;
    let is_upload = -1;
    let last_bytes_xferred = 0;
    let next_request_time = 0;
    let num_retries = 0;
    let time_so_far = 0;
    let xfer_speed = 0;

    if (functions.isDefined(transfer.persistent_file_xfer))
    {
      let persistant = transfer.persistent_file_xfer[0];
      first_request_time = persistant.first_request_time[0];
      is_upload = persistant.is_upload[0];
      last_bytes_xferred = persistant.last_bytes_xferred[0];
      next_request_time = persistant.next_request_time[0];
      num_retries = persistant.num_retries[0];
      time_so_far = persistant.time_so_far[0];
    }

    if (functions.isDefined(transfer.file_xfer))
    {
      let fileTransfer = transfer.file_xfer[0];
      xfer_speed = fileTransfer.xfer_speed[0]; 
    }

    let item = "";
    if (last_bytes_xferred > 0)
    {
      let perc = last_bytes_xferred * 100;
      perc/= transfer.nbytes;
      if (perc > 100) perc = 100;
      let percS = perc.toFixed(3);   
      let style = 'style="background-color:' + colorObj['#progress_bar'] + '!important;' + 'width:'+ perc + '%;">';    
      item = '<div ' + style + percS + '</div>'    
    }
  
    items[order.order[3]] = addRow(order.check[3],selId, 3, item);

    let bytes = transfer.nbytes/1024;
    let bytesS = bytes.toFixed(2) + " K";
    items[order.order[4]] = addRow(order.check[4],selId, 4, bytesS);

    let soFarS = "";
    if (time_so_far > 0)
    {
        soFarS = functions.getFormattedTimeInterval(time_so_far);        
    }

    let elapsedS = "";
    elapsed = next_request_time - first_request_time;
    elapsedS = functions.getFormattedTimeInterval(elapsed); 
    items[order.order[5]] = addRow(order.check[5],selId, 5, soFarS + " - " + elapsedS);    

    let speedS = ""
    let speed = xfer_speed/1024;
    speedS = speed.toFixed(3) + " KBps";
    items[order.order[6]] = addRow(order.check[6],selId, 6, speedS);

    let uploadDownload  = false;
    if (is_upload == '1') uploadDownload = true; 

    let statusS = "";
    if (functions.isDefined(transfer.file_xfer))
    {
      if (uploadDownload) statusS += "Uploading";
      else statusS += "Downloading";
    }
    else
    {
      if (transfer.project_backoff <= 0)
      {
        if (uploadDownload) statusS += "Uploading";
        else statusS += "Downloading";

        if (next_request_time > 0)
        {
          let nextS = getFormattedTimeDiff(next_request_time);
          status += "Retry in: " + nextS;
        }
        else
        {
          if (uploadDownload) statusS += "Upload pending ";
          else statusS += "Download pending ";
        }
      }
      else
      {
        if (uploadDownload) statusS += "Upload pending ";
        else statusS += "Download pending ";
        if (transfer.project_backoff > 0)
        {
          statusS += "Project backoff: ";
          statusS += functions.getFormattedTimeInterval(transfer.project_backoff);
        }
      }
    }
    if (num_retries > 0)
    {
      statusS += ",retried: " + num_retries;
    }

    items[order.order[7]] = addRow(order.check[7],selId, 7, statusS);
   
  } catch (error) {
    logging.logError('BttableTransfers,tableTransferItem', error);      
  }

  for (let i=0;i<items.length;i++)
  {
    table += items[i];
  }

  table += "</tr>";
  return table;

  return table;
}

function addRow(check,rowId, cell, item)
{
  if (!check) return "";    
  var id = ' id="r' + btConstants.SEPERATOR_ITEM + rowId + btConstants.SEPERATOR_ITEM + cell +'"';
  return "<td " + id + ">" + item + "</td>";
}

function addRowHeader(check,showSort,gb, cell, item)
{
  if (!check) return "";    
  let sort = gb.sortTransfers;
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
//  var width = ' width="' + gb.widthTransfers[cell] + '%" ';
//  var id = ' id="' + cell +'"'; 
//  return "<th " + width + id + hclass + ">" + item + "</th>";
  let widthS = "";
  let width = gb.widthTransfers[cell];
  widthS = ' style="width:' + width + '%" ';

  if (gb.headerAction === btConstants.HEADER_RESIZE)
  {
    hclass = 'class="resizer"';

    if (gb.widthTransfersPX !== null)
    {
      let width = gb.widthTransfersPX[cell];
      widthS = ' style="width:' + width + 'px" ';
    }
    else
    {
      let width = gb.widthTransfers[cell];
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