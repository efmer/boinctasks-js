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

const crypto = require('crypto')

const Logging = require('../functions/logging');
const logging = new Logging();
const Functions = require('../functions/functions');
const functions = new Functions();
const btC = require('../functions/btconstants');

const ReadWrite  = require('../functions/readwrite');
const readWrite = new ReadWrite();

gTableNoticesArchive = "";
gbTableNoticesArchiveHidden = true;

const translateArray = ["A new version of BOINC is available.",
                        "Download",
                        "Your settings do not allow fetching tasks for",
                        "To fix this, you can ",
                        "change Project Preferences on the project's web site"
                        ];

//g_tableProjectWidth = [14,18,28,20,10,10,10,10,10,30]; // in %

class BtTableNotices{
  table(gb,cTable,color)
  {
    var tableArray = tableNoticesArray(gb,cTable,color);
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

  click(gb,val,type)
  {
    try {
      if (val === "hidden")
      {
        gbTableNoticesArchiveHidden = !gbTableNoticesArchiveHidden;
        return;
      }

      switch (type)
      {
        case "notice_collapse":
          let posH = gb.notices.colHash.indexOf(val)
          if (posH <0)
          {
            gb.notices.colHash.push(val);
            let time = new Date().getTime()/1000; // seconds
            gb.notices.colHashTime.push(parseInt(time));
          }
          else
          {
            gb.notices.colHash.splice(posH, 1)
            gb.notices.colHashTime.splice(posH, 1)      
          }          
        break;
        case "notice_archive":
          let posA = gb.notices.archHash.indexOf(val)
          if (posA <0)
          {
            gb.notices.archHash.push(val);
            let time = new Date().getTime()/1000; // seconds
            gb.notices.archHashTime.push(parseInt(time));
          }
          else
          {
            gb.notices.archHash.splice(posA, 1)
            gb.notices.archHashTime.splice(posA, 1)      
          }          
        break;
      }
      readWrite.write("settings\\notices","collapse.json",JSON.stringify(gb.notices));
    } catch (error) {
      logging.logError('BtTableNotices,click', error);  
    }
  }
}

module.exports = BtTableNotices;

function tableNotices(tableArray)
{
  let table = "<br><br>";
  try {
    for (let i =0; i<tableArray.length; i++)
    { 
      table += tableArray[i];
    }
    table += "<br><br><br><br>"
    return table;

  } catch (error) {
    logging.logError('BtTableNotices,tableProjects', error);      
    return "";
  }
}

function tableNoticesArray(gb, notices,color)
{
  try {
    if (gb.notices === null)
    {
      gb.notices = JSON.parse(readWrite.read("settings\\notices","collapse.json",));
      if (gb.notices === null)
      {
        gb.notices = new Object;
        gb.notices.colHash = [];
        gb.notices.colHashTime = [];
        gb.notices.archHash = [];
        gb.notices.archHashTime = [];
      }
      else
      {
        let timeNow = new Date().getTime()/1000; // seconds        
        for (let i=0;i<gb.notices.colHash.length;i++)
        {
          let time = timeNow - gb.notices.colHashTime[i];
          if (time > 7776000)
          {
            gb.notices.colHash.splice(i, 1)
            gb.notices.colHashTime.splice(i, 1) 
          }
        }
        for (let i=0;i<gb.notices.archHash.length;i++)
        {
          let time = timeNow - gb.notices.archHashTime[i];
          if (time > 7776000)
          {
            gb.notices.archHash.splice(i, 1)
            gb.notices.archHashTime.splice(i, 1) 
          }
        }        
      }
    }   
  } catch (error) {
    gb.notices = new Object;
    gb.notices.colHash = [];
    gb.notices.colHashTime = [];
    gb.notices.archHash = [];
    gb.notices.archHashTime = [];    
  }

  var tableArray = [];
  try {
    gTableNoticesArchive = "";
    for (var i =0; i<notices.length; i++)
    {
      tableArray.push(tableNoticesItem(gb, i,notices[i],color));
    }
    if (gTableNoticesArchive.length > 0)
    {
      if (!gbTableNoticesArchiveHidden) img = " class='bt_img_notice_minus'";
      else img = " class='bt_img_notice_plus'";

      let id = "notice_collapse" + btC.SEPERATOR_ITEM + "hidden";
      let col = "<hr class='bt_notice_line_archive'><br><span id='" + id + "'" + img + "><span id='" + id + "' class='bt_notice_header_hidden'>" + btC.TL.STATUS.S_NOTICE_HIDDEN + "</span></span><br>";
      if (!gbTableNoticesArchiveHidden) col += "<br>" + gTableNoticesArchive;
      tableArray.push(col);
    }
    return tableArray;

  } catch (error) {
    logging.logError('BtTableNotices,tableNoticesArray', error);      
    return tableArray;
  }
}

function tableNoticesItem(gb, i,notice, color)
{
  let msg = "";
  try {
    let timeS = "";
    if (functions.isDefined(notice.create_time))
    {
      let d = new Date(notice.create_time*1000);
      d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
      let options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      timeS = d.toLocaleDateString(undefined, options);
    }
    let description = notice.description[0].replaceAll("\n", "<br>")
    description = translate(description);
     
    let title = notice.title[0];
    let project = notice.project_name;
    if (functions.isDefined(project))
    {
      project = notice.project_name[0];
    }
    else
    {
      project = "BoincTasks Js";
    }
    let cat = notice.category;
    if (functions.isDefined(cat))
    {
      if (cat[0] === "client")
      {
        project = "Boinc Client";
//        title = description;
      }
    }

    let computer = "";
    if (functions.isDefined(notice.computer))
    {
      computer = notice.computer
    }
 
    let hash = crypto.createHash('md5').update(project+title+description).digest("hex")
    let idC = "notice_collapse" + btC.SEPERATOR_ITEM + hash;
    let idD = "notice_archive" + btC.SEPERATOR_ITEM + hash;
    let posCollapsed = gb.notices.colHash.indexOf(hash);
    let posArchive = gb.notices.archHash.indexOf(hash);    
    if (posCollapsed >= 0) img = " class='bt_img_notice_plus'";
    else img = " class='bt_img_notice_minus'";
    let imgA = " class='bt_img_notice_archive'";

    msg =  "<hr class='bt_notice_line'>";
    msg += "<span id='" + idC + "'" + img + ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class='bt_notice_header'>" + project+ ": " + title + "</span>";
    if (posCollapsed <0)
    {
      msg+= description;      
      url = notice.link[0];
      let link = "";
      if (url.length > 1)
      { 
        link = '  <a href="'+ url + '">' + btC.TL.STATUS.S_NOTICE_MORE + '</a>';
      }
      msg+= computer + " - "  + timeS + link;
    }
    else
    {
      msg += "&nbsp;&nbsp;&nbsp;<span id='" + idD + "'" + imgA + ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
    }

    if (posArchive >= 0) 
    {    
      //msg += "<span id='" + idD + "'" + imgA + ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
      msg += "<br>";
      gTableNoticesArchive += msg;
      msg = "";
    }
  } catch (error) {
    logging.logError('BtTableNotices,tableNoticesItem', error);
  }

  return msg;
}

function translate(msg)
{
  let bTrans = true;
  try {
    while (bTrans)
    {
      bTrans = false;
      let posb = msg.indexOf('_("');
      let pose = msg.indexOf('")');
  
      if (posb >=0)
      {
        if (pose > posb)
        {
          let end = posb + (pose-posb);
          let isolate = msg.substring(posb+3, end);
          let trans = translateIndex(isolate);
          msg = msg.replace('_("' + isolate + '")' , trans);
          bTrans = true;
        }
      }
    }
  } catch (error) {
    logging.logError('BtTableNotices,translate', error);
  }

  return msg;
}

function translateIndex(msg)
{
  try {
    let pos = translateArray.indexOf(msg);
    if (pos >=0)
    {
      let idx = "S_NOTICES_TRANS_"+pos
      msg = btC.TL.STATUS[idx];
    }
    else
    {
      var ii = 1;
    }
  } catch (error) {
    logging.logError('BtTableNotices,translateIndex', error);
  }
  return msg;
}