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
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const SendArray = require('../misc/send_array');
const btC = require('../functions/btconstants');

const {BrowserWindow} = require('electron');

const RUN_MODE_ALWAYS = 1;
const RUN_MODE_AUTO = 2;
const RUN_MODE_NEVER = 3;
const RUN_MODE_RESTORE = 4;

let gChildSettingsAllow = null;
let gCssDarkAllow = null;

let gAllowResults = [];
let gAllowCpu = [];
let gAllowGpu = [];
let gAllowNetwork = [];
let gAllowSend = 0;
let gBcopy = null;
let gAllowCallback = null;

class SettingsAllow{
  allow(type,gb,combined,callback)
  {
    switch (type)
    {
      case "menu":
        settings(gb)          
      break;
      case "set":
        gAllowCallback = callback;
        set(gb,combined)
      break;
    }
  }

  setTheme(css)
  {
      insertCssDark(css);
  }    
}
module.exports = SettingsAllow;

function settings(gb)
{
    try {
        let title = "BoincTasks Js - " + btC.TL.DIALOG_BOINC_ALLOW.DSA_TITLE;
        if (gChildSettingsAllow == null)
        {
          let state = windowsState.get("settings_allow",700,800)
      
          gChildSettingsAllow = new BrowserWindow({
            'x' : state.x,
            'y' : state.y,
            'width': state.width,
            'height': state.height,
            webPreferences: {
              sandbox : false,
              contextIsolation: false,  
              nodeIntegration: true,
              nodeIntegrationInWorker: true,        
              preload:'${__dirname}/preload/preload.js',
            }
          });
          gChildSettingsAllow.loadFile('index/index_settings_allow.html')
          gChildSettingsAllow.once('ready-to-show', () => {    
//            gChildSettingsAllow.webContents.openDevTools()
            gChildSettingsAllow.show();  
            gChildSettingsAllow.setTitle(title);
            gChildSettingsAllow.webContents.send("translations",btC.TL.DIALOG_BOINC_ALLOW);              
            getData(gb);
          })
          gChildSettingsAllow.webContents.on('did-finish-load', () => {
            insertCssDark(gb.theme);
          })            
          gChildSettingsAllow.on('close', () => {
            let bounds = gChildSettingsAllow.getBounds();
            windowsState.set("settings_allow",bounds.x,bounds.y, bounds.width, bounds.height)
          })     
          gChildSettingsAllow.on('closed', () => {
            gChildSettingsAllow = null
          })    
        }
        else
        {
          gChildSettingsAllow.setTitle(title); 
          gChildSettingsAllow.hide();
          gChildSettingsAllow.show();
          getData(gb)
        }
              
    } catch (error) {
        logging.logError('SettingsAllow,settings', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkAllow !== null)
    {
      gChildSettingsAllow.webContents.removeInsertedCSS(gCssDarkAllow) 
    }    
    gCssDarkAllow = await gChildSettingsAllow.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkAllow = null;
  }
}

function getData(gb)
{
  try {
    gAllowResults = [];
    let send = "<get_cc_status/>";
    for (let i=0; i<gb.connections.length;i++ )
    {
      const sendArray = new SendArray();      
      sendArray.send(gb.connections[i],send, dataReady);
    } 
  } catch (error) {
    logging.logError('SettingsAllow,getData', error);  
  }
}

function dataReady(data)
{
  let result = parseAllow(this.client_completeData);
  if (result != null)
  {
    let item = new Object();
    item.result = result;
    item.computerName = this.computerName;
    gAllowResults.push(item);
    showAllow()
  }
}

function parseAllow(xml)
{
    var statusReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (functions.isDefined(result))
            {
                var statusArray = result['boinc_gui_rpc_reply']['cc_status'];
                if (functions.isDefined(statusArray))
                {
                    statusReturn = statusArray[0];
                }
            }
        });
        } catch (error) {
            logging.logError('SettingsAllow,parseAllow', error);           
            return null;
        }
    return statusReturn
}

function showAllow()
{
  try {
    gAllowResults.sort(compare);

    let len = gAllowResults.length;
    let tableCpu = "<table><tr><th></th><th></th><th>" + btC.TL.DIALOG_BOINC_ALLOW.DSA_SNOOZE_MIN + "<th></tr>";
    let tableGpu = "<table><tr><th></th><th></th><th>" + btC.TL.DIALOG_BOINC_ALLOW.DSA_SNOOZE_MIN + "<th></tr>";
    let tableNetwork = "<table><tr><th></th><th></th><th>" + btC.TL.DIALOG_BOINC_ALLOW.DSA_SNOOZE_MIN + "<th></tr>";
  
    gAllowCpu = [];
    gAllowGpu = [];
    gAllowNetwork = [];

    for (let i=0;i<len;i++)
    {
      var item = gAllowResults[i];
      let computer = item.computerName;
      let result = item.result;
  
      gAllowCpu.push(result.task_mode[0]);
      gAllowGpu.push(result.gpu_mode[0]);
      gAllowNetwork.push( result.network_mode[0]);

      tableCpu += getMode(computer, "C", result.task_mode[0], result.task_mode_delay[0], result.task_mode_perm[0]); 
      tableGpu += getMode(computer, "G", result.gpu_mode[0], result.gpu_mode_delay[0], result.gpu_mode_perm[0]);      
      tableNetwork += getMode(computer, "N", result.network_mode[0], result.network_mode_delay[0], result.network_mode_perm[0]);        
    }

    tableCpu += "</table>";
    tableGpu += "</table>";
    tableNetwork += "</table>";    
    gChildSettingsAllow.webContents.send('settings_allow', tableCpu, tableGpu, tableNetwork);

  } catch (error) {
    logging.logError('SettingsAllow,showAllow', error);     
  }
}

function compare(a,b)
{
  if (a.computerName > b.computerName) return 1;
  if (a.computerName < b.computerName) return -1;
  return 0;
}

function getMode(computer, id, mode, delay, perm)
{
  let table = "<tr>";  
  try {
    table += "<td>" + computer + "</td>";
  
    table += "<td>";
    table += getSelect(computer, id, mode, delay);
    table += "</td>";
    
    /*
    let delayI = parseInt(delay);
    let delayS = "";
    if (delayI > 0) delayS = 'Delay: ' + delayI;
    table += "<td>" + delayS + "</td>";
*/

    let delayM = Math.round(delay/60);
    if (delayM == 0) delayM = "";

    table += '<td><input type="text" id="' + computer + '" value="' + delayM + '"></td>';

//    let permS = "";
//    if (perm != RUN_MODE_AUTO) permS = "Permanent: " +  getModeDescription(perm);
//    table += "<td>" + permS + "</td>";
    
  } catch (error) {
    logging.logError('SettingsAllow,getMode', error);   
  }
  table +="</tr>"
  return table; 
}

function getSelect(computer, id,mode, delay)
{
  const SELECTED = "selected";
  let idc = id + btC.SEPERATOR_ITEM + computer + btC.SEPERATOR_ITEM;
  let select = '<select>'
  if (mode == 2) {sel = SELECTED; sels = "✓"} else {sel = ""; sels = "";}
  select += '<option ' + sel + ' value ="' + idc + RUN_MODE_AUTO + '">' + btC.TL.DIALOG_BOINC_ALLOW.DSA_RUN_AUTO +  ' ' + sels + '</option>';
  if (mode == 1) {sel = SELECTED; sels = "✓"} else {sel = ""; sels = "";}
  select += '<option ' + sel + ' value ="' + idc + RUN_MODE_ALWAYS + '">' + btC.TL.DIALOG_BOINC_ALLOW.DSA_RUN_ALWAYS + ' ' + sels + '</option>';
  if (mode == 3) {sel = SELECTED; sels = "✓"} else {sel = ""; sels = "";} 
  select += '<option ' + sel + ' value ="' + idc + RUN_MODE_NEVER + '">' + btC.TL.DIALOG_BOINC_ALLOW.DSA_RUN_SNOOZE + ' ' + sels + '</option>'; 
  select += '</select>';
  return select;
}

// Apply button

function set(gb,combined)
{
  try {
    gAllowSend = 0;

    let cpuObj = parse(combined.selCpu,combined.snoozeCpu);
    let gpuObj = parse(combined.selGpu,combined.snoozeGpu);
    let networkObj = parse(combined.selNetwork,combined.snoozeNetwork)
  
    for(let i=0;i<cpuObj.length;i++)
    {
      let con = findComputer(gb,cpuObj[i]);
      updateChangeCpu(con,cpuObj[i],gAllowCpu[i]);
      updateChangeGpu(con,gpuObj[i],gAllowGpu[i]);
      updateChangeNetwork(con,networkObj[i],gAllowNetwork[i]);            
    } 

    if ( gAllowSend === 0)
    {
      gAllowCallback();
    }

  } catch (error) {
    logging.logError('SettingsAllow,set', error); 
  }
}

function parse(array,snooze)
{
  let items = [];
  try {
    for (let i=0; i<array.length; i++)
    {
      let item = array[i];
      let itemSlit = item.split(btC.SEPERATOR_ITEM);
      if (itemSlit.length === 3)
      {
        let obj = new Object();
        obj.computerName = itemSlit[1]
        obj.mode = parseInt(itemSlit[2]);
        obj.snooze = snooze[i]
        items.push(obj);
      }
    }
  
  } catch (error) {
    logging.logError('SettingsAllow,parse', error); 
  }
  return items;
}

function findComputer(gb,item)
{
  let con = null;
  try {
    for (let i=0;i<gb.connections.length;i++)
    {
      con = gb.connections[i];
      if (con.computerName === item.computerName)
      {
        return con;
      }
    }  
  } catch (error) {
    logging.logError('SettingsAllow,findComputer', error);    
  }
  return con;
}

function updateChangeCpu(con,cpuObj,allowCpu)
{
  if (cpuObj.mode != allowCpu)
  {
    setMode(con,cpuObj.mode,cpuObj.snooze,"<set_run_mode>\n","</set_run_mode>\n");
  }
}
function updateChangeGpu(con,gpuObj,allowGpu)
{
  if (gpuObj.mode != allowGpu)
  {
    setMode(con,gpuObj.mode,gpuObj.snooze,"<set_gpu_mode>\n","</set_gpu_mode>\n");
  }
}
function updateChangeNetwork(con,networkObj,allowNetwork)
{
  if (networkObj.mode != allowNetwork)
  {
    setMode(con,networkObj.mode,networkObj.snooze,"<set_network_mode>\n","</set_network_mode>\n");
  }
} 

function setMode(con,mode,snooze,begin,end)
{
  gAllowSend++;

  let send = begin;
  send += modeText(mode);
  let snoozeI = 0;
  try {
    if (mode == RUN_MODE_NEVER)
    {
      snoozeI = parseInt(snooze);
      snoozeI *= 60;
    }
  } catch (error) {
  }
  send += "<duration>" + snoozeI + "</duration>\n";
  send += end;

  const sendArray = new SendArray();
  sendArray.send(con,send, setModeReady);

}

function setModeReady(event)
{
  let data = this.client_completeData;
  if (data.indexOf("success") < 0)
  {
    let msg = this.computerName + ": " + data;
    logging.logErrorMsg("SettingsAllow,setModeReady",msg);
  }
  gAllowSend--;
  if ( gAllowSend === 0)
  {
    gAllowCallback();
  }
}

function modeText(mode)
{
  let modeS = "<auto/>";
  switch (mode)
  {
    case RUN_MODE_ALWAYS:
      modeS = "<always/>";
    break;
    case RUN_MODE_NEVER:
      modeS = "<never/>";
    break;
  }
  modeS += "\n";
  return modeS;
}