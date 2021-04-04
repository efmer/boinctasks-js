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
const btConstants = require('../functions/btconstants');

class BtTableProjects{
  tableHeader(gb,sidebar)
  {
    var table = '<table id="table_header" class="bt_table_header';
    if (sidebar) table += ' sidebar_computer_header">';
    else table += '">';

    table += tableProjectsHeader(gb,true);
    table += '</table>';
    return table;    
  }
  table(gb, cTable)
  {
    let bEmpty = false;
    if (cTable.length === 0) bEmpty = true;
    if (cTable.length === 1 )
    {
      if (cTable[0].length === 0)
      {
        bEmpty = true;
      }
    }    
    if (bEmpty) return btConstants.EMPTY_TABLE;

    let color = gb.color;
    var tableArray = tableProjectsArray(gb,cTable,color);
    var table = tableProjects(gb,tableArray);
    return table;    
  }
  tableArray(con)
  {
    return tableProjectsArray(con);
  }

  clickOnRow(id)
  {
    clickRow(id);   
  }

  selectedCount(gb)
  {
    return gb.rowSelect.projects.rowSelected.length;
  }
}

module.exports = BtTableProjects;

function tableProjects(gb, tableArray)
{
  var table = "";
  try {
    var table = '<table class="bt_table">';   
    table += tableProjectsHeader(gb, false);

    for (var i =0; i<tableArray.length; i++)
    {   
      table += tableArray[i];
    }    

    table += '</table>';
    return table;

  } catch (error) {
    logging.logError('BtTableProjects,tableProjects', error);      
    return "";
  }
}

function tableProjectsArray(gb,projectTable,color)
{
  var tableArray = [];
  try {
    let order = gb.order.projects;    
    let selRows = gb.rowSelect.projects;    
    for (let s=0; s< selRows.length;s++)
    {
      selRows.present[s] = false;
    }

    for (var i =0; i<projectTable.length; i++)
    {
      tableArray.push(tableProjectItem(selRows,i, order, projectTable[i],color));
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
    logging.logError('BtTableProjects,tableProjectsArray', error);      
    return tableArray;
  }
}


function tableProjectsHeader(gb, addText)
{
  let header = "<tr>"
  let items = [];
  let order = gb.order.projects;
  if (addText)
  {
    items[order.order[0]] = addRowHeader(order.check[0],true, gb, 0, btConstants.GENERAL_COMPUTER);
    items[order.order[1]] = addRowHeader(order.check[1],true, gb, 1, btConstants.GENERAL_PROJECT);    
    items[order.order[2]] = addRowHeader(order.check[2],true, gb, 2, btConstants.PROJECTS_ACCOUNT);
    items[order.order[3]] = addRowHeader(order.check[3],true, gb, 3, btConstants.PROJECTS_TEAM);
    items[order.order[4]] = addRowHeader(order.check[4],true, gb, 4, btConstants.PROJECTS_CREDITS);
    items[order.order[5]] = addRowHeader(order.check[5],true, gb, 5, btConstants.PROJECTS_CREDITS_AVG);
    items[order.order[6]] = addRowHeader(order.check[6],true, gb, 6, btConstants.PROJECTS_CREDITS_HOST);
    items[order.order[7]] = addRowHeader(order.check[7],true, gb, 7, btConstants.PROJECTS_CREDITS_HOST_AVG);
    items[order.order[8]] = addRowHeader(order.check[8],true, gb, 8, btConstants.PROJECTS_SHARE);
    items[order.order[9]] = addRowHeader(order.check[9],true, gb, 9, btConstants.GENERAL_STATUS);     
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
    header += items[i];
  }

  header +="</tr>"
  return header;
}

function tableProjectItem(selRows,i, order, project, color)
{
  let table = "";
  let items = [];
  let sel = "";

  try {
    let computer = project.computerName;
    let projectUrl = project.projectUrl;

    let selId = "" + btConstants.SEPERATOR_SELECT + computer + btConstants.SEPERATOR_SELECT + projectUrl;
    let iSel = selRows.rowSelected.indexOf(selId)
    if (iSel >= 0)
    {
      selRows.present[iSel] = true;
      sel = ' class ="bt_table_selected" ';
    }

    let even = "";
    if (i % 2 == 0)
    {
      even = "filter: brightness(108%);"
    }

    let style = "";
    switch(project.statusN)
    {
      case btConstants.PROJECT_RUNNING_N:
        style = ' style="background-color:' + color['#project_running'] + ';' + even + '"'
      break; 
    }

    table = "<tr " + sel + style + even + ">";

    items[order.order[0]] = addRow(order.check[0],selId, 0, computer);
    items[order.order[1]] = addRow(order.check[1],selId, 1, project.project);    
    items[order.order[2]] = addRow(order.check[2],selId, 2, project.account);
    items[order.order[3]] = addRow(order.check[3],selId, 3, project.team);
    items[order.order[4]] = addRow(order.check[4],selId, 4, project.credits.toLocaleString(undefined,{ minimumFractionDigits: 1 }));
    items[order.order[5]] = addRow(order.check[5],selId, 5, project.creditsAvg.toLocaleString(undefined,{ minimumFractionDigits: 1 }));
    items[order.order[6]] = addRow(order.check[6],selId, 6, project.creditsHost.toLocaleString(undefined,{ minimumFractionDigits: 1 }));
    items[order.order[7]] = addRow(order.check[7],selId, 7, project.creditsHostAvg.toLocaleString(undefined,{ minimumFractionDigits: 1 }));
    items[order.order[8]] = addRow(order.check[8],selId, 8, project.share.toLocaleString(undefined,{ minimumFractionDigits: 2 }));
    items[order.order[9]] = addRow(order.check[9],selId, 9, project.status);   
  } catch (error) {
    logging.logError('BtTableProjects,tableProjectItem', error);      
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

function addRowHeader(check,showSort,gb, cell, item)
{
  if (!check) return "";  
  let sort = gb.sortProjects;
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
  //var width = ' width="' + gb.widthProjects[cell] + '%" ';
  //var id = ' id="' + cell +'"'; 
  //return "<th " + width + id + hclass + ">" + item + "</th>";
  let widthS = "";
  let width = gb.widthProjects[cell];
  widthS = ' style="width:' + width + '%" ';

  if (gb.headerAction === btConstants.HEADER_RESIZE)
  {
    hclass = 'class="resizer"';

    if (gb.widthProjectsPX !== null)
    {
      let width = gb.widthProjectsPX[cell];
      widthS = ' style="width:' + width + 'px" ';
    }
    else
    {
      let width = gb.widthProjects[cell];
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