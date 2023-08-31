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
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const constants = require('./rules_constants');
const btConstants = require('../functions/btconstants');
const State = require('../misc/state');
const conState = new State();

const {BrowserWindow} = require('electron');

let gChildSettingsRules = null;
let gCssDarkRules = null;
let gEditItem = -1;

class RulesList{
  rules(gb,type,data,data2)
  {
    try {
      switch(type)
      {
        case "menu":
          editRulesWindow(gb);   
        break;
        case "add_rule":
          addRule();
        break;
        case "edit_rule":
          editRule(gb,data);
        break;
        case "delete_rule":
          deleteRuleItem(gb,data)
        break;
        case "add_rule_item":
          case "edit_rule_item":          
          addRuleItem(gb,data);
        break;
        case "cancel_rule":
          editRulesWindow(gb);  
        break;
        case "check":
          checkRule(gb,data,data2);  
        break;        
      }      
    } catch (error) {
      logging.logError('RulesList,send', error);     
    }
  }
  
  toolbarTasks(selected,gb)
  {
    toolbarTasks(selected,gb);
  }

  setTheme(css)
  {
      insertCssDark(css);
  }  

}
module.exports = RulesList;

function editRulesWindow(gb,ruleItem = null)
{
  try {
      gEditItem = -1;
      let title = "Rules";
      if (gChildSettingsRules === null)
      {
        let state = windowsState.get("settings_rules",700,800)
    
        gChildSettingsRules = new BrowserWindow({
          'x' : state.x,
          'y' : state.y,
          'width': state.width,
          'height': state.height,
          webPreferences: {
            sandbox : false,
            contextIsolation: false,  
            nodeIntegration: true,
            nodeIntegrationInWorker: true,        
       //     preload:'${__dirname}/preload/preload.js',
          }
        });
        gChildSettingsRules.loadFile('index/index_rules_list.html')
        gChildSettingsRules.once('ready-to-show', () => {    
          if (btC.DEBUG_WINDOW)
          {                    
            gChildSettingsRules.webContents.openDevTools();
          } 
        gChildSettingsRules.show();  
        gChildSettingsRules.setTitle(title);
        })
        gChildSettingsRules.webContents.on('did-finish-load', () => {
          insertCssDark(gb.theme);
          if (ruleItem === null)
          {
            editRules(gb);
          }
          else
          {
            addRule(ruleItem);
          }          
        })        
        gChildSettingsRules.on('close', () => {
          let bounds = gChildSettingsRules.getBounds();
          windowsState.set("settings_rules",bounds.x,bounds.y, bounds.width, bounds.height)
        })     
        gChildSettingsRules.on('closed', () => {
          gChildSettingsRules = null
        })    
      }
      else
      {
        if (btC.DEBUG_WINDOW)
        {                    
          gChildSettingsRules.webContents.openDevTools();
        }         
        gChildSettingsRules.setTitle(title); 
        gChildSettingsRules.hide();
        gChildSettingsRules.show();
        if (ruleItem === null)
        {
          editRules(gb);
        }
        else
        {
          addRule(ruleItem);
        }        
      }            
  } catch (error) {
      logging.logError('Rules,editRulesWindow', error);        
  }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkRules !== null)
    {
      gChildSettingsRules.webContents.removeInsertedCSS(gCssDarkRules) 
    }    
    gCssDarkRules = await gChildSettingsRules.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkRules = null;
  }
}

function checkRule(gb,id,check)
{
  try {
    gb.rules.list[id].enabled = check; 
    writeRules(gb.rules.list);
    gb.rules.compiled = false;
  } catch (error) {
    logging.logError('Rules,checkRule', error);    
  }
}

function editRules(gb)
{
  try {
    let table = getTable(gb);
    buttons = "<br><button id='edit_rule'>Edit selected rule</button><br><br><br><br><button id='delete_rule'>Delete selected rule</button>"
    buttons+= '<br><br>Read the <a href="https://efmer.com/boinctasks-js/boinctasks-js-rules/">Manual</a> before using the add button <br>'; 
    buttons+= "<br><button id='add_rule'>Add rule</button>"
    gChildSettingsRules.webContents.send('settings_rules_list', table);
    gChildSettingsRules.webContents.send('settings_rules_buttons', buttons);      
  } catch (error) {
    logging.logError('Rules,editRules', error);   
  }
}

function getTable(gb)
{
  let table = "";
  try {
    let table = '<table id="rules_table" class="bt_table">';
    table += header();

    for (let i=0;i<gb.rules.list.length;i++)
    {
      table += getRow(i,gb.rules.list[i]);
    }          
    table += "</table>";
    return table;        
  } catch (error) {
    logging.logError('Rules,getTable', error); 
  }
  return table; 
}

  function header()
  {
    return "<tr><th></th><th>Computer</th><th>Project</th><th>App</th><th>Rule</th><th></th></tr>"
  }

function getRow(rowId,ruleItem)
{
  let row = '';
  try {
    row = '<tr id="' + rowId + '">';
    let checked = "";
    if (ruleItem.enabled) checked = "checked";
    let box = '<input type="checkbox" id="' + rowId + '" '  + checked + '></input>';
    row += addRow(rowId, box);
    row += addRow(rowId, ruleItem.computer);
    row += addRow(rowId, ruleItem.project);      
    row += addRow(rowId, ruleItem.version + "&nbsp;" + ruleItem.app);      
    row += addRow(rowId, ruleItem.name);   
    row += "<td></td></tr>"
  } catch (error) {
    logging.logError('Rules,getRow', error);         
  }

  return row;
}

function addRow(nr,txt)
{
  return '<td id="' + nr + '">' + txt + '</td>'
}

// Rules editor

function editRule(gb,nr)
{
  try {
    if (nr >=0)
    {
      gEditItem = nr;
      let ruleItem = gb.rules.list[nr];
      addRule(ruleItem);
    }
  } catch (error) {
    logging.logError('Rules,editRule', error);  
  }
}

function addRule(item = null)
{
  gChildSettingsRules.webContents.send('settings_rules_buttons', ""); 
  gChildSettingsRules.webContents.send('settings_rules_list', "");
  let ruleItem;
  if (item === null)
  {
    gEditItem = -1;
    ruleItem = new Object;
    ruleItem.enabled = true;
    ruleItem.name = "";    
    ruleItem.computer = "";
    ruleItem.project = "";
    ruleItem.version = "";
    ruleItem.app = "";
    ruleItem.value = "";
    ruleItem.time = "1";
    ruleItem.ruleType = 0;
    ruleItem.ruleStatus = 0;
    ruleItem.ruleAction = -1;
    ruleItem.ruleAction2 = -1;
    ruleItem.extra = "";
  }
  else
  {
    ruleItem = item;
  }
  editRuleItem(ruleItem)
}

function editRuleItem(item)
{
  try {
    let txt = "";
    txt += '<input type="text" size="50" id="edit_rule_name" value="' + item.name + '"> Rule name<br>';
    txt += '<input type="text" size="50" id="edit_rule_computer"' + '" value="' + item.computer + '"> Computer<br>';
    txt += '<input type="text" size="50" id="edit_rule_project" value="' + item.project + '"> Project<br>';
    txt += '<input type="text" size="50" id="edit_rule_version" value="' + item.version + '"> App version<br>';
    txt += '<input type="text" size="50" id="edit_rule_app" value="' + item.app + '"> Application<br>';
    txt += "<br><br>Status: ";    
    txt += getSelectRulesStatus(item.ruleStatus); 
    txt += "<br><br>Event: ";    
    txt += getSelectRulesType(item.ruleType);       
    txt += " Action: ";
    txt += getSelectRulesAction(item.ruleAction, "rules_action");
    txt += getSelectRulesAction(item.ruleAction2, "rules_action2");
    txt += "<br><br>";

    let value = item.value;
    if ( item.type === constants.RULE_TYPE_TIME)
    {
      value = functions.getFormattedTimeInterval(item.value); 
    }

    txt += '<input type="text" id="edit_value" value="' + value + '"> Value<br>';
    txt += '<input type="text" id="edit_time" value="' + item.time + '"> Time (active in minutes)<br>';
    txt += "<br><br>";
    if (gEditItem < 0)
    {
      txt += '<button id="add_rule_item"> Add rule</button>';
    }
    else
    {
      txt += '<button id="edit_rule_item"> Update rule</button>'
    }

    gChildSettingsRules.webContents.send('select_rule_edit', txt);      
  } catch (error) {
    logging.logError('Rules,addRule', error); 
  }
}

function getSelectRulesStatus(nr, id)
{
  let txt = '<select id="rules_status">';
  txt += getSelectItem(constants.RULE_STATUS_RUNNING_NR,constants.RULE_STATUS_RUNNING, nr);    
  txt += '</select>';
  return txt;
}

function getSelectRulesAction(nr, id)
{
  let txt = '<select id="'+ id + '">';
  txt += getSelectItem(constants.RULE_ACTION_NO_NR,constants.RULE_ACTION_NO, nr);    
//  txt += getSelectItem(constants.RULE_ACTION_ALLOW_WORK_NR,constants.RULE_ACTION_ALLOW_WORK, nr);
//  txt += getSelectItem(constants.RULE_ACTION_NO_WORK_NR,constants.RULE_ACTION_NO_WORK, nr);
//  txt += getSelectItem(constants.RULE_ACTION_RESUME_NETWORK_NR,constants.RULE_ACTION_RESUME_NETWORK, nr);
//  txt += getSelectItem(constants.RULE_ACTION_NO_NETWORK_NR,constants.RULE_ACTION_NO_NETWORK, nr);
//  txt += getSelectItem(constants.RULE_ACTION_ALLOW_PROJECT_NR,constants.RULE_ACTION_ALLOW_PROJECT, nr);
//  txt += getSelectItem(constants.RULE_ACTION_SUSPEND_PROJECT_NR,constants.RULE_ACTION_SUSPEND_PROJECT, nr);
    txt += getSelectItem(constants.RULE_ACTION_SUSPEND_TASK_NR,constants.RULE_ACTION_SUSPEND_TASK, nr);
//  txt += getSelectItem(constants.RULE_ACTION_RUN_EXE_NR,constants.RULE_ACTION_RUN_EXE, nr);
//  txt += getSelectItem(constants.RULE_ACTION_SNOOZE_NR,constants.RULE_ACTION_SNOOZE, nr);
//  txt += getSelectItem(constants.RULE_ACTION_SNOOZE_GPU_NR,constants.RULE_ACTION_SNOOZE_GPU, nr);
  txt += getSelectItem(constants.RULE_ACTION_EMAIL_NR,constants.RULE_ACTION_EMAIL, nr);    
  txt += getSelectItem(constants.RULE_ACTION_ALERT_NR,constants.RULE_ACTION_ALERT, nr);
  txt += '</select>';
  return txt;
}

function getSelectRulesType(nr)
{
  let txt = '<select id="rules_type">';
  if (nr === 0) sel = true;
//  txt += getSelectItem(constants.RULE_CPU_PERC_NR,constants.RULE_CPU_PERC, nr);
//  txt += getSelectItem(constants.RULE_DEADLINE_NR,constants.RULE_DEADLINE, nr);
  txt += getSelectItem(constants.RULE_ELAPSED_TIME_NR,constants.RULE_ELAPSED_TIME, nr);
  txt += getSelectItem(constants.RULE_ELAPSED_TIME_DELTA_NR,constants.RULE_ELAPSED_TIME_DELTA, nr);
//  txt += getSelectItem(constants.RULE_PROGRESS_PERC_NR,constants.RULE_PROGRESS_PERC, nr);
  txt += getSelectItem(constants.RULE_TIME_LEFT_NR,constants.RULE_TIME_LEFT, nr);
//  txt += getSelectItem(constants.RULE_TIME_NR,constants.RULE_TIME, nr);
//  txt += getSelectItem(constants.RULE_USE_NR,constants.RULE_USE, nr);  
  txt += getSelectItem(constants.RULE_CONNECTION_NR,constants.RULE_CONNECTION, nr);
  txt += '</select>';
  return txt;
}

function getSelectItem(id,txt,sel)
{
  let selTxt = "";
  if (id == sel) selTxt = "selected";
  let select = '<option id="' + id + '" ' + selTxt + ' value ="' + txt + '"> ' + txt + '</option>';
  return select;
}

function deleteRuleItem(gb,nr)
{
  if (nr < 0) return;
  gb.rules.list.splice(nr,1);
  writeRules(gb.rules.list);
  gb.rules.compiled = false;
  editRulesWindow(gb);
}

function addRuleItem(gb,data)
{
  try {
    let ok;
    let error = "";

    if (data.name.length < 2)
    {
      error += "<br>Rule name must be at least 2 characters long.";
    }
    let bTime = false;
    let bPerc = false;
    switch(data.ruleType)
    {
      case constants.RULE_CONNECTION_NR:
        ok = (data.value === 'lost' || data.value === 'change')
        if (!ok)
        {
          error += "<br>Value must be: change, lost";
        }
        ok = (data.ruleAction === constants.RULE_ACTION_RUN_EXE_NR || data.ruleAction === constants.RULE_ACTION_EMAIL_NR || data.ruleAction === constants.RULE_ACTION_ALERT_NR)
        if (ok)
        {
          ok = (data.ruleAction2 === constants.RULE_ACTION_RUN_EXE_NR || data.ruleAction2 === constants.RULE_ACTION_EMAIL_NR || data.ruleAction2 === constants.RULE_ACTION_ALERT_NR || data.ruleAction2 === constants.RULE_ACTION_NO_NR)
        }
        if (!ok)
        {
          error += "<br>Action must be: " + constants.RULE_ACTION_RUN_EXE + ", " + constants.RULE_ACTION_EMAIL + ", " + constants.RULE_ACTION_ALERT;
        }
      break;
      case constants.RULE_CPU_PERC_NR:
      case constants.RULE_PROGRESS_PERC_NR:
        bPerc = true;
      break;
      case constants.RULE_DEADLINE_NR:
      case constants.RULE_ELAPSED_TIME_NR:
      case constants.RULE_ELAPSED_TIME_DELTA_NR:
      case constants.RULE_TIME_LEFT_NR:
      case constants.RULE_TIME_NR:
        bTime = true;
      break;
      case constants.RULE_USE_NR:
      break;
    }
    let value = 0;
    if (bPerc)
    {
      let bValid = true;
      value = data.value;
      if (isNaN(value))
      {
        bValid = false;
      }
      else
      {
        if (value < 0 || value > 100)
        {
          bValid = false;
        }
      }
      if (!bValid)
      {
        error += "<br>Value is NOT a valid percentage"
      }
    }
    let time = 0;
    if (bTime)
    {
      time = getTime(data.value);
      if (time <= 0)
      {
        error += "<br>Value is NOT a valid time interval e.g. 1d,12:01:00 or 10:20:30 or 1:20 or 19"
      }
      else
      {
        data.value = time;
        data.type = constants.RULE_TYPE_TIME;
      }
    }
    else
    {
      data.type = constants.RULE_TYPE_TEXT;
    }
    
    if ((data.ruleAction === constants.RULE_ACTION_NO_NR) && (data.ruleAction2 === constants.RULE_ACTION_NO_NR))
    {
      error += "<br>No Action found";
    }

    if (error.length)
    {
      let msg = '<div class="error_text"><br>Error: ' + error + '</div>'
      gChildSettingsRules.webContents.send('settings_rules_error', msg);
      return;
    }

    addOrUpdate(gb,data);
    gb.rules.compiled = false;
    editRulesWindow(gb);
  } catch (error) {
    logging.logError('Rules,addRuleItem', error)
  }
}

function getTime(time)
{
  let error = "";
  let tStamp = -1;
  try {
    let days = 0;
    let hoursS = time;
    let dayss = time.split("d,");
    if (dayss.length === 2) 
    {      
      days = dayss[0];
      hoursS = dayss[1];
    }
    let hourss = hoursS.split(":");
    if (hourss > 0) 
    {      
      if (tStamp < 0)
      {
        tStamp = 0;
      }
    }
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    switch (hourss.length)
    {
      case 2:
        seconds = hourss[1]*1;
        minutes = hourss[0]*1;
      break;
      case 3:
        seconds = hourss[2]*1;
        minutes = hourss[1]*1;
        hours = hourss[0]*1;
      break;
      default:
        seconds = hourss[0]*1;
    }
    if (days < 0)
    {
      error += "Time: days must be >= 0";
    }
    if (hours > 24 || hours < 0)
    {
      error += "Time: hours must be between 0-24";
    }
    if (minutes > 60 || minutes < 0)
    {
      error += "Time: minutes must be between 0-60";
    }
    if (seconds > 60 || seconds < 0)
    {
      error += "Time: seconds must be between 0-60";
    }
    if (error.length > 0)
    {
      error = "<br>Value (time): " + error;
      gChildSettingsRules.webContents.send('settings_rules_error', error);
    }
    else
    {
      tStamp = days * 86400;
      tStamp+= hours * 3600;
      tStamp+= minutes * 60;
      tStamp+= seconds;
    }
  } catch (error) {
    tStamp = -1
  }
  return tStamp;
}

function addOrUpdate(gb,data)
{
  try {
    let len = gb.rules.list.length;
    if (len > 0)
    {
      if (gEditItem >= 0)
      {
        let ruleItem = gb.rules.list[gEditItem];
        ruleItem.name = data.name;
        ruleItem.enabled = true;
        ruleItem.computer = data.computer;
        ruleItem.project = data.project;
        ruleItem.version = data.version;
        ruleItem.app = data.app;
        ruleItem.value = data.value;
        ruleItem.time = data.time; 
        ruleItem.type = data.type;  
        ruleItem.ruleStatus = data.ruleStatus;        
        ruleItem.ruleType = data.ruleType;
        ruleItem.ruleAction = data.ruleAction;
        ruleItem.ruleAction2 = data.ruleAction2; 
        ruleItem.extra = "";   
      }
    }
    if (gEditItem < 0)
    {
      let ruleItem = new Object;
      ruleItem.name = data.name;
      ruleItem.enabled = true;      
      ruleItem.computer = data.computer;
      ruleItem.project = data.project;
      ruleItem.version = data.version;
      ruleItem.app = data.app;
      ruleItem.value = data.value;
      ruleItem.type = data.type;
      ruleItem.time = data.time;
      ruleItem.ruleStatus = data.ruleStatus;      
      ruleItem.ruleType = data.ruleType;
      ruleItem.ruleAction = data.ruleAction;
      ruleItem.ruleAction2 = data.ruleAction2; 
      ruleItem.extra = "";   
      gb.rules.list.push(ruleItem);
    }
    writeRules(gb.rules.list);
  } catch (error) {
    logging.logError('Rules,addOrUpdate', error)
  }
}

function writeRules(rules)
{
  try {
    const ReadWrite  = require('../functions/readwrite');
    const readWrite = new ReadWrite();
  
    readWrite.write("settings\\rules","rules.json",JSON.stringify(rules));
    readWrite.write("settings\\rules","rules_backup1.json",JSON.stringify(rules));
  } catch (error) {
    logging.logError('Rules,writeRules', error)
  }
}

function toolbarTasks(selected,gb)
{
  try {
    for (let i=0;i<selected.length;i++ )
    {
      let res = selected[i].split(btConstants.SEPERATOR_SELECT);
      if (res.length !== 3) break;
      let wuName = res[0];
      let computer = res[1];

      for (let c=0; c<connections.length;c++)
      {
          if (connections[c].computerName === computer)
          {
              let con = connections[c];
              let results = con.results.resultTable;
              for(let r=0; r<results.length;r++)
              {
                let resultF = null;
                let result = results[r];
                if (result.filtered)
                {
                    for (let rt=0;rt<result.resultTable.length;rt++)
                    {
                      if (wuName == result.resultTable[rt].wuName) 
                      {
                        resultF = result.resultTable[rt];
                        break;
                      }
                    }
                }
                else 
                {
                  if (wuName == result.wuName)
                  {
                    resultF = result;
                  }
                }
                if (resultF !== null)
                {
                    let wu = resultF.wu;
                    gEditItem = -1;
                    let ruleItem = new Object;
                    ruleItem.name = "";    
                    ruleItem.computer = con.computerName;
                    ruleItem.project = resultF.project;
                    ruleItem.version = resultF.version;
                    ruleItem.app = conState.getApp(con, wu);
                    ruleItem.value = "";
                    ruleItem.time = "1";    
                    ruleItem.ruleType = 0;
                    ruleItem.ruleAction = -1;
                    ruleItem.ruleAction2 = -1;  
                    editRulesWindow(gb,ruleItem);
                }                
              }
          }
      }    
    }
  } catch (error) {
    logging.logError('Rules,toolbarTasks', error);    
  }
}