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
const btC = require('../functions/btconstants');
const Functions = require('../functions/functions');
const functions = new Functions();

class BtTableComputer{
  tableHeader(gb, sidebar)
  {
    var table = '<table id="table_header" class="bt_table_header';
    if (sidebar) table += ' sidebar_computer_header">';
    else table += '">';

    table += tableComputersHeader(gb,true);
    table += '</table>';
    return table;    
  }

  table(gb,cTable)
  {
    var table = tableComputers(gb);
    return table; 
  }

  clickOnRow(val,id)
  {
    clickRow(val,id);   
  }

  selectedCount(gb)
  {
    return gb.rowSelect.computers.rowSelected.length;
  }
}

module.exports = BtTableComputer;

function tableComputers(gb)
{
  var table = '<table class="bt_table">';   
  try {    
    let con = gb.connections;    
    let order = gb.order.computers;    
    let selRows = gb.rowSelect.computers;    
    for (let s=0; s< selRows.length;s++)
    {
      selRows.present[s] = false;
    }

    let edit = gb.editComputers;

    table += tableComputersHeader(gb,false);    
    for (var i=0; i<con.length;i++)
    {    
      table += tableComputerItem(selRows, i, order, con[i], edit)      
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

    table += '</table>';
    return table;

  } catch (error) {
    logging.logError('BtComputerTable,tableComputers', error);      
    return "";
  }
}

function tableComputersHeader(gb, addText)
{
  let header = "<tr>"
  let items = [];
  let order = gb.order.computers;
  let edit = gb.editComputers;

  if (edit)
  {
    if (addText)
    {
      header += addRowHeader(true,true, gb, 0, "");    
      header += addRowHeader(true,true, gb, 1, btC.TL.TAB.T_COMPUTERS_GROUP);
      header += addRowHeader(true,true, gb, 2, btC.TL.TAB.T_GENERAL_COMPUTER);
      header += addRowHeader(true,true, gb, 3, btC.TL.TAB.T_COMPUTERS_IP);
      header += addRowHeader(true,true, gb, 4, btC.TL.TAB.T_COMPUTERS_CPID);
      header += addRowHeader(true,true, gb, 5, btC.TL.TAB.T_COMPUTERS_PORT);
      header += addRowHeader(true,true, gb, 6, btC.TL.TAB.T_COMPUTERS_PASSWORD);
    }
    else
    {
      header += addRowHeader(true,true, gb, 0, "");    
      header += addRowHeader(true,true, gb, 1, ""); 
      header += addRowHeader(true,true, gb, 2, ""); 
      header += addRowHeader(true,true, gb, 3, ""); 
      header += addRowHeader(true,true, gb, 4, ""); 
      header += addRowHeader(true,true, gb, 5, ""); 
      header += addRowHeader(true,true, gb, 6, "");    
    }
    header +="</tr>"
    return header;
  }

  if (addText)
  {
    items[order.order[0]] = addRowHeader(order.check[0],true, gb, 0, "");    
    items[order.order[1]] = addRowHeader(order.check[1],true, gb, 1, btC.TL.TAB.T_COMPUTERS_GROUP);
    items[order.order[2]] = addRowHeader(order.check[2],true, gb, 2, btC.TL.TAB.T_GENERAL_COMPUTER);
    items[order.order[3]] = addRowHeader(order.check[3],true, gb, 3, btC.TL.TAB.T_COMPUTERS_IP);
    items[order.order[4]] = addRowHeader(order.check[4],true, gb, 4, btC.TL.TAB.T_COMPUTERS_CPID);
    items[order.order[5]] = addRowHeader(order.check[5],true, gb, 5, btC.TL.TAB.T_COMPUTERS_PORT);
    items[order.order[6]] = addRowHeader(order.check[6],true, gb, 6, btC.TL.TAB.T_COMPUTERS_PASSWORD);
    items[order.order[7]] = addRowHeader(order.check[7],true, gb, 7, btC.TL.TAB.T_COMPUTERS_BOINC);
    items[order.order[8]] = addRowHeader(order.check[8],true, gb, 8, btC.TL.TAB.T_COMPUTERS_PLATFORM);    
    items[order.order[9]] = addRowHeader(order.check[9],true, gb, 9, btC.TL.TAB.T_GENERAL_STATUS);    
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
  }
  for (let i=0;i<items.length;i++)
  {
    if (functions.isDefined(items[i]))
    {
      header += items[i];
    }
  }

  header +="</tr>"
  return header;
}

function tableComputerItem(selRows, row, order, con, edit)
{
  let table = "";
  let items = [];
  try {
    let status = "";

    if (con.check == "1")
    {
      if (con.auth)
      {
        status = "Connected";  
      }
      else
      {
        status = "Not connected, ";
        switch (con.mode)
        {
          case "error":
            status += "error";
          break;
          case "failed_auth1":
            status += "password (1)";
          break;        
          case "failed_auth2":
            status += "password (2)";
          break;
          case "failed":
            status += "failed";
          break;
          default:
            status += "(df)";
        }
      }
    }
    else
    {
      status = "Not selected";
    }
 
    if (edit)
    {
      table = "<tr>";
      let checked = false;
      if (con.check == "1") checked = "checked";
      table += addRow(true,0,row, 0, '<input type="checkbox" id="check-' + row+ '"' + checked + '>');
      table += addRow(true,1,row, 1, '<input type="text" id="group-'+ row + '" value="' + con.group + '">');
      table += addRow(true,2,row, 2, '<input type="text" id="computer-'+ row + '" value="' + con.computerName + '">');      
      table += addRow(true,3,row, 3, '<input type="text" id="ip-'+ row+ '" value="' + con.ip + '">');        
      table += addRow(true,4,row, 4, '<input type="text" id="cpid-'+ row + '" value="' + con.cpid + '">');
      let ports = con.port;
      if (con.temp.port > 0) ports += ";" + con.temp.port;
      table += addRow(true,5,row, 5, '<input type="text" id="port-'+ row + '" value="' + ports + '">');       
      table += addRow(true,6,row, 6, '<input type="text" id="pass-'+ row + '" value="' + con.passWord + '">');  
      table += "</tr>";
      return table;                         
    }
    else 
    {
      let selId = con.ip + btC.SEPERATOR_SELECT + con.computerName;
      let sel = "";
      let iSel = selRows.rowSelected.indexOf(selId)      
      if (iSel >= 0)    
      {   
        selRows.present[iSel] = true;        
        sel = ' class ="bt_table_selected" ';
      }

      table = "<tr " + sel + ">";
      let check = "";
      if (con.check == "1") check = "✓";
      items[order.order[0]] = addRow(order.check[0],selId,row, 0, check);
      items[order.order[1]] = addRow(order.check[1],selId,row, 1, con.group);
      items[order.order[2]] = addRow(order.check[2],selId,row, 2, con.computerName);
      items[order.order[3]] = addRow(order.check[3],selId,row, 3, con.ip);
      items[order.order[4]] = addRow(order.check[4],selId,row, 4, con.cpid);
      let port = con.port;
      if (con.temp.port > 0)
      {
        port += ";" + con.temp.port;
      }
      items[order.order[5]] = addRow(order.check[5],selId,row, 5, port);
      items[order.order[6]] = addRow(order.check[6],selId,row, 6, '**');  
      items[order.order[7]] = addRow(order.check[7],selId,row, 7, con.boinc);     
      items[order.order[8]] = addRow(order.check[8],selId,row, 8, con.platform);
      items[order.order[9]] = addRow(order.check[9],selId,row, 9, status);               
    }
  } catch (error) {
    logging.logError('BtComputerTable,tableComputerItem', error);
    return "";
  }
  for (let i=0;i<items.length;i++)
  {
    table += items[i];
  }

  table += "</tr>";
  return table;
}

function addRow(check,selId,row, cell, item)
{
  if (!check) return "";  
  var id = ' id="r'+ btC.SEPERATOR_ITEM + row + btC.SEPERATOR_ITEM + cell +  btC.SEPERATOR_ITEM + selId +'"';
  return "<td " + id + ">" + item + "</td>";
}

function addRowHeader(check,showSort, gb, cell, item)
{
  if (!check) return "";
  let sort = gb.sortComputers;
  var hclass = "";
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
  let width = gb.widthComputers[cell];
  let widthS = ' style="width:' + width + 'px" ';

  let id = ' id="' + cell +'"';
  let idR = ' id="resize,' + cell +'"';

  let th;
  if (showSort)
  {
    th = "<th " + widthS + id + hclass + ">" +  item + '<span class="bt_img_resize"><img ' + idR + ' src="../boinctasks/css/img/resize.png"></span></th>';
  }
  else 
  {
    th = "<th " + widthS + id + hclass + ">" + item + '</th>';
  }
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