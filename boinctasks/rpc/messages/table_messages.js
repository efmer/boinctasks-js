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

const btC = require('../functions/btconstants');

const Logging = require('../functions/logging');
const Functions = require('../functions/functions');
const functions = new Functions();
const logging = new Logging();

class BtTableMessages{
  tableHeader(gb,sidebar)
  {
    var table = '<table id="table_header" class="bt_table_header';
    if (sidebar) table += ' sidebar_computer_header">';
    else table += '">';

    table += tableMessagesHeader(gb,true);
    table += '</table>';
    return table;    
  }

  table(gb,cTable)
  {
    if (cTable === void 0) return btC.TL.TAB_MSG.TM_EMPTY_MESSAGES;
    if(cTable.length === 0) return btC.TL.TAB_MSG.TM_EMPTY_MESSAGES;
    var table = tableMessages(gb,cTable, gb.color, gb.settings);
    return table;    
  }

  clickOnRow(id)
  {
    clickRow(id);   
  }

  selectedCount(gb)
  {
    return gb.rowSelect.messages.rowSelected.length;
  }
}

module.exports = BtTableMessages;

function tableMessages(gb,cTable, color, settings)
{
  var table = "";
  try {
    let order = gb.order.messages;

    let selRows = gb.rowSelect.messages;    
    for (let s=0; s< selRows.length;s++)
    {
      selRows.present[s] = false;
    }

    var table = '<table class="bt_table">';   
    table += tableMessagesHeader(gb,false);

    let bProject = gb.projectSelected !== btC.TL.SIDEBAR_COMPUTERS.SBC_PROJECTS;

    var sel = false;
    for (var i =0; i<cTable.length; i++)
    {
      var found = selRows.rowSelected.indexOf(i.toString());
      if (found >= 0) sel = true;
      else sel = false;

      if (bProject)
      {
//        if (cTable[i].project.length > 0)
//        {
          if (gb.projectSelected !== cTable[i].project)
          {
            continue;
          }
//        }
      }

      table += tableMessagesItem(selRows, i, order, cTable[i], color, settings);
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

  } catch (error) {
    logging.logError('BtTableMessages,tableMessages', error);
  }
  return table;
}

function tableMessagesHeader(gb, addText)
{
  let header = "<tr>"  
  let items = [];
  let order = gb.order.messages;
  if (addText)
  {
    items[order.order[0]]  = addRowHeader(true, gb, 0, btC.TL.TAB.T_GENERAL_COMPUTER);
    items[order.order[1]]  = addRowHeader(true, gb, 1, btC.TL.TAB.T_MESSAGES_NR);
    items[order.order[2]]  = addRowHeader(true, gb, 2, btC.TL.TAB.T_GENERAL_PROJECT);  
    items[order.order[3]]  = addRowHeader(true, gb, 3, btC.TL.TAB.T_MESSAGES_TIME);  
    items[order.order[4]]  = addRowHeader(true, gb, 4, btC.TL.TAB.T_MESSAGES_MESSAGE);  
  }
  else
  {
    items[order.order[0]]  = addRowHeader(false, gb, 0, "");
    items[order.order[1]]  = addRowHeader(false, gb, 1, "");
    items[order.order[2]]  = addRowHeader(false, gb, 2, "");  
    items[order.order[3]]  = addRowHeader(false, gb, 3, "");  
    items[order.order[4]]  = addRowHeader(false, gb, 4, ""); 
  }
  for (let i=0;i<items.length;i++)
  {
    header += items[i];
  }

  header +="</tr>"
  return header;
}

function tableMessagesItem(selRows, row, order, message, colorObj, settingsObj)
{
  let items = [];
  var sel = "";
  let seqno = message.seqno;
  let computer = message.computer;
  let selId = seqno + btC.SEPERATOR_SELECT + computer + btC.SEPERATOR_SELECT + "";
  let iSel = selRows.rowSelected.indexOf(selId)
  if (iSel >= 0)
  {
    selRows.present[iSel] = true;
    sel = ' class ="bt_table_selected" ';
  }

  color = getColor(row, colorObj, settingsObj, message);
  var table = "<tr " + sel + color + ">";

//  var id = ' id="row' + row +'"';
 // var table = "<tr " + id + sel + color + ">";

  try {
    items[order.order[0]] = addRow(selId, 0, computer);
    items[order.order[1]] = addRow(selId, 1, seqno);
    items[order.order[2]] = addRow(selId, 2, message.project);
    items[order.order[3]] = addRow(selId, 3, message.timeS); 
    items[order.order[4]] = addRow(selId, 4, message.body); 
   
  } catch (error) {
    logging.logError('BtTableMessages,tableMessagesItem', error);     
    return "";
  }
  for (let i=0;i<items.length;i++)
  {
    table += items[i];
  }

  table += "</tr>";
  return table;
}
//

function addRow(rowId, cell, item)
{
  let id = ' id="r'+ btC.SEPERATOR_ITEM + rowId + btC.SEPERATOR_ITEM + cell +'"';
  let td = "<td " + id + ">" + item + "</td>";
  return td;
}

/*
function addRow(row, cell, item)
{
  var id = ' id="r,' + row + "," + cell +'"';
  return "<td " + id + ">" + item + "</td>";
}
*/

function addRowHeader(showSort, gb, cell, item)
{
  let sort = gb.sortMessages;
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
  let width = gb.widthMessages[cell];
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

function getColor(i, colorObj, settingsObj, message)
{
  var style = "";
  try{
    let color = colorObj['#messages_default']; 
    if (message.pri > 1)
    {
      color = colorObj['#messages_priority'];               
    }

    // match message string in setttings.
    let match = -1;
    let messageHl = settingsObj.messages;
    if (functions.isDefined(messageHl))
    {
      for (let m=0;m<messageHl.length;m++)
      {
        if (messageHl[m][1].length > 0)
        {
          if (message.body.indexOf(messageHl[m][1]) >= 0)
          {
            if (messageHl[m][0].length > 0)
            {
              if (messageHl[m][0] === message.project)
              {
                match = m;
                break;
              }
            }
            else 
            { // message only
              match = m;
              break;
            }
          }
        }
        else
        { // project only
          if (messageHl[m][0].length > 0)
          {
            if (messageHl[m][0] === message.project)
            {
              match = m;
              break;
            } 
          }
        }
      }
      if (match >=0)
      {
        let hl = colorObj["#messages_highlight_"+match];
        if (hl !== undefined)
        {
          color = hl;
        }
      }
    }

    let even = "";
    if (i % 2 == 0)
    {
      even = "filter: brightness(108%);"
    }
    style = 'style="background-color:' + color + ';' + even + '"'

  } catch (error) {
    logging.logError('BtTableMessages,getColor', error);    
  }    
  
  return style;
}