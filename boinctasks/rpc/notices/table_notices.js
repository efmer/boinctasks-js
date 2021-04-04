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

g_tableNoticesSelected = [];
g_tableNoticesSelectedP = [];
//g_tableProjectWidth = [14,18,28,20,10,10,10,10,10,30]; // in %

class BtTableNotices{
  table(cTable,color)
  {
    var tableArray = tableNoticesArray(cTable,color);
    var table = tableNotices(tableArray);
    return table;    
  }
  tableArray(con)
  {
    return null;
  }

  clickOnRow(id)
  {
    return;  
  }

  selectedCount()
  {
    return 0;
  }
  getSelected()
  {
    return null;
  }
}

module.exports = BtTableNotices;

function tableNotices(tableArray)
{
  let table = "<br><br>";
  try {
//    var table = '<table class="bt_table">';   
//    table += tableProjectsHeader(null, false);

//    var sel = false;
    for (let i =0; i<tableArray.length; i++)
    {
//      var found = g_tableProjectSelected.indexOf(i.toString());
//      if (found >= 0) sel = true;
//      else sel = false;
      
      table += tableArray[i];
    }    

//    table += '</table>';
    table += "<br><br><br><br>"
    return table;

  } catch (error) {
    logging.logError('BtTableNotices,tableProjects', error);      
    return "";
  }
}

function tableNoticesArray(notices,color)
{
  var tableArray = [];
  try {
    for (var i =0; i<notices.length; i++)
    {
      tableArray.push(tableNoticesItem(i,notices[i],color));
    }    
    return tableArray;

  } catch (error) {
    logging.logError('BtTableNotices,tableNoticesArray', error);      
    return tableArray;
  }
}

function tableNoticesItem(i,notice, color)
{
  let msg = "";
  try {
    let timeS = "";
    if (functions.isDefined(notice.create_time))
    {
      let d = new Date(notice.create_time*1000);
      d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
      let options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      timeS = d.toLocaleDateString("en-US", options);
    }
    let description = notice.description[0].replaceAll("\n", "<br>")  
    let project = notice.project_name;
    if (functions.isDefined(project))
    {
      project = notice.project_name[0];
    }
    else
    {
      project = "BoincTasks Js";
    }
    let computer = "";
    if (functions.isDefined(notice.computer))
    {
      computer = notice.computer
    }


    // we must do something with these translations.
    description = description.replaceAll('_("',"");
    description = description.replaceAll('")',"");    

    msg = "<hr><b>" + project+ ": " + notice.title[0] + "</b><br>";
    msg+= description;
    url = notice.link[0];
    let link = "";
    if (url.length > 1)
    {
      link = '  <a href="'+ url + '">More....</a>';
    }
    msg+= computer + " - "  + timeS + link;
  } catch (error) {
    logging.logError('BtTableNotices,tableNoticesItem', error);
  }
  return msg;
}
