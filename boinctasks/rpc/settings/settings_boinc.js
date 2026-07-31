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

const {BrowserWindow, dialog} = require('electron');
const btC = require('../functions/btconstants');
const { getTestMessageUrl } = require('nodemailer');

let gSettingsBoincCon = null;
let gChildSettingsBoinc = null;
let gCssDarkBoinc = null;
let gSettingsUseGlobalPref = false;

class SettingsBoinc{
    settingsBoinc(type,gb,settings)
    {
      switch (type)
      {
        case "menu":
          settingsOk(gb)          
        break;
        case "settings":
          sendSettings(settings);
          sendLocalPref();
        break;
        case "button_pref":
          if (!gSettingsUseGlobalPref)
          {
            dialogYesNo(btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SWITCHING_WEB_WARNING, btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SWITCHING_WEB_WARNING , 'global');            
          }
          else
          {
            dialogYesNo(btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SWITCHING_WEB_WARNING, btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SWITCHING_LOCAL_WARNING , 'local');             
          }
        break;
      }
    }

    setTheme(css)
    {
        insertCssDark(css);
    }    
  }
  module.exports = SettingsBoinc;

function dialogYesNo(title, msg, todoYesNo)
{
  dialog.showMessageBox(gChildSettingsBoinc,
  {
      title: btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SWITCHING_WARNING_TITLE,
      message: msg,
      buttons: [btC.TL.BOX_GENERAL.BX_YES, btC.TL.BOX_GENERAL.BX_CANCEL],
      defaultId: 0, // bound to buttons array
      cancelId: 1 // bound to buttons array
  })
  .then(result => {
      if (result.response === 0) {
        if (todoYesNo == 'global')
        {
          sendGlobalPref();
        }
        if (todoYesNo == 'local')
        {
            gChildSettingsBoinc.webContents.send("enable_apply");             
        }
      }
  });
}

function getSelected(gb)
{
  try{    
    let ret = Object;
    let authCount = 0;
    let selCount = 0;  
    let selected = null;
    let len = gb.connections.length;
    let localhost = "127.0.0.1";

    for (let i=0; i<len;i++ )
    {
      let con = gb.connections[i];
      if (con.auth)
      {
        authCount++;      
        if (con.sidebar)
        {
          selCount++;
          selected = con;
        }
        if (con.ip.toLowerCase() === 'localhost')
        {
          localhost = con;
        }
      } 
    }       
    ret.selected = selected;
    ret.authCount = authCount;
    ret.selCount = selCount;
    return ret;
  } catch (error) {
    logging.logError('SettingsBoinc,getSelected', error);
  }  
}

function settingsOk(gb)
{
  try {
    let ret= getSelected(gb);
    let selected = ret.selected;
    let selCount = ret.selCount;
    let authCount = ret.authCount;
    if (selected === null)
    {
      if (authCount === 1) selected = localhost;
      else
      {
        let one =  btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SELECT_ONE;        
        showDialog(gb.mainWindow,one);
        return;
      }
    }
    if (selCount > 1)
    {
      showDialog(gb.mainWindow, btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SELECTED_MORE_ONE + "\n\n" + one);
      return;   
    }
    gSettingsBoincCon = selected;
    settingsStart(gb,selected);
  } catch (error) {
    logging.logError('SettingsBoinc,settingsOk', error);        
  }  
}

function useGlobalPref()
{
              useGlobalPref();
  dialogYesNo(btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SWITCHING_WEB_WARNING, btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_SWITCHING_LOCAL_WARNING , 'web');
}

function showDialog(mainWindow,msg)
{
  dialog.showMessageBox(mainWindow,
    {
      title: btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_UNABLE_SHOW,
      message: btC.TL.DIALOG_BOINC_SETTINGS.DBO_BOX_INVALID,
      detail: msg
    })
    return;
}

function settingsStart(gb,selected)
{
  try {
      let title = "BoincTasks Js = " + btC.TL.DIALOG_BOINC_SETTINGS.DBO_TITLE;
      if (gChildSettingsBoinc === null)
      {
        let state = windowsState.get("settings_boinc",700,800)
    
        gChildSettingsBoinc = new BrowserWindow({
          'x' : state.x,
          'y' : state.y,
          'width': state.width,
          'height': state.height,
          show: true, 
          webPreferences: {
            sandbox : false,
            contextIsolation: false,  
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
    //        preload:'${__dirname}/preload/preload.js',
          }
        });

        gChildSettingsBoinc.loadFile('index/index_settings_boinc.html')
        gChildSettingsBoinc.once('ready-to-show', () => {
          if (btC.DEBUG_WINDOW)
          {
            gChildSettingsBoinc.webContents.openDevTools()
          }
          gChildSettingsBoinc.setTitle(title);              
          getData(selected);
        })
      
        gChildSettingsBoinc.webContents.on('did-finish-load', () => {
          insertCssDark(gb.theme);
          gChildSettingsBoinc.webContents.send("translations",btC.TL.DIALOG_BOINC_SETTINGS);              
          let status = '<h2><b>';
          status += btC.TL.DIALOG_BOINC_SETTINGS.DBO_LOADING_SETTINGS;
          status += '</b></h2>'
          gChildSettingsBoinc.webContents.send("header_status",status);               
        })
        gChildSettingsBoinc.on('close', () => {
          let bounds = gChildSettingsBoinc.getBounds();
          windowsState.set("settings_boinc",bounds.x,bounds.y, bounds.width, bounds.height)
        })     
        gChildSettingsBoinc.on('closed', () => {
          gChildSettingsBoinc = null
        })    
      }
      else
      {
        gChildSettingsBoinc.setTitle(title); 
        let status = '<h2><b>';
        status += btC.TL.DIALOG_BOINC_SETTINGS.DBO_LOADING_SETTINGS;
        status += '</b></h2>'
        gChildSettingsBoinc.webContents.send("header_status",status);        
        gChildSettingsBoinc.hide();
        gChildSettingsBoinc.show();
        getData(selected)
      }
            
  } catch (error) {
      logging.logError('SettingsBoinc,settingsStart', error);        
  }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkBoinc !== null)
    {
      gChildSettingsBoinc.webContents.removeInsertedCSS(gCssDarkBoinc) 
    }    
    gCssDarkBoinc = await gChildSettingsBoinc.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkBoinc = null;
  }
}

function sendGlobalPref()
{
  try {
    let send = "<set_global_prefs_override>\n\n</set_global_prefs_override>\n";
    const sendArray = new SendArray();
    sendArray.send(gSettingsBoincCon,send, dataReady);
  } catch (error) {
    logging.logError('SettingsBoinc,getData', error);  
  }
}

function getData(con)
{
  try {
    let send = "<get_global_prefs_override/>";
    const sendArray = new SendArray();
    sendArray.send(con,send, dataReady);
  } catch (error) {
    logging.logError('SettingsBoinc,getData', error);  
  }
}

function dataReady(data)
{
  try {
    // add a time out because the window or javascript is not always ready at this point.
    setTimeout(() => {
    let result = parse(this,this.client_completeData);
      if (result !== null)
      {
        result = validate(result);
        let title = "BoincTasks Js - " + btC.TL.DIALOG_BOINC_SETTINGS.DBO_TITLE + " " +  this.computerName
        gChildSettingsBoinc.setTitle(title);
        gChildSettingsBoinc.webContents.send('settings', result);
        gChildSettingsBoinc.show();
        gChildSettingsBoinc.webContents.send("header_status","");  

        gChildSettingsBoinc.webContents.send('global_pref', gSettingsUseGlobalPref);
        let buttonText = "";
        if (gSettingsUseGlobalPref)
        {
          let project = "??";
          if (result.source_project != void 0)
          {
            project = result.source_project;
          }
          sendWebPref(project);
        }
        else
        {
          sendLocalPref();
        }     
      }
      else
      {
    //    gChildSettingsBoinc.hide();
      }    
    }, 500);
    
  } catch (error) {
    logging.logError('SettingsBoinc,dataReady', error);      
  }
}

function sendLocalPref()
{
  let status = '';
  buttonText =  btC.TL.DIALOG_BOINC_SETTINGS.DBO_BUTTON_WEB_PREF;
  status+= "<h3><b>" + btC.TL.DIALOG_BOINC_SETTINGS.DBO_STATUS_NOW_USING_LOCAL_PREF + "</b></h3>";  
  gChildSettingsBoinc.webContents.send("header_status_pref",status, buttonText);            
}

function sendWebPref(project)
{
  let status = "<h3><b>" + btC.TL.DIALOG_BOINC_SETTINGS.DBO_STATUS_NOW_USING_WEB_PREF + "</b></h3>";  
  buttonText = btC.TL.DIALOG_BOINC_SETTINGS.DBO_BUTTON_LOCAL_PREF;       
  status = status.replace("%s",project);
  gChildSettingsBoinc.webContents.send("header_status_pref",status, buttonText);            
}

function parse(con,xml)
{
    var statusReturn = null;
    try {
      var parseString = require('xml2js').parseString;
      parseString(xml, function (err, result) {
        if (functions.isDefined(result))
        {
          let reply = result.boinc_gui_rpc_reply;
          let error = reply.error;
          let success = reply.success;
          bNoPrefsOverrideFile = false;
          if (functions.isDefined(success))
          {
              bNoPrefsOverrideFile = true;
          } 
          if (functions.isDefined(error))
          {
            let errorTxt = error[0];
            if (errorTxt === "no prefs override file")
            {
              bNoPrefsOverrideFile = true;
            }
            else
            {
              loggging.logError('SettingsBoinc,parse',errorTxt)
              return statusReturn;
            }            
          }
          if (bNoPrefsOverrideFile)
          {
            gSettingsUseGlobalPref = true;
            gChildSettingsBoinc.webContents.send("using_global_pref",btC.TL.DIALOG_BOINC_SETTINGS);     
            logging.logDebug(con.computer + ": no prefs override file");  
            const sendArray = new SendArray();                
            sendArray.send(con,"<get_global_prefs_working/>", dataReady); 
            return statusReturn;
          }
          else
          {
            var statusArray = result['boinc_gui_rpc_reply']['global_preferences'];
            if (functions.isDefined(statusArray))
            {
                statusReturn = statusArray[0];
            }
          }
        }
      });
      } catch (error) {
          logging.logError('SettingsBoinc,parse', error);           
          return null;
      }
    return statusReturn
}

function validate(result)
{
  let typeis = typeof result;
  if (typeis != 'object')
  {
    result = new Object()
  }

  valid(result,'run_on_batteries',true);
  valid(result,'run_if_user_active',false);
  valid(result,'run_gpu_if_user_active',false);  

  valid(result,'start_hour',0);
  valid(result,'end_hour',0);
  valid(result,'net_start_hour',0);
  valid(result,'net_end_hour',0);

  valid(result,'idle_time_to_run',3);
  valid(result,'suspend_cpu_usage',0);
  valid(result,'leave_apps_in_memory',false);
  valid(result,'confirm_before_connecting',true);
  valid(result,'hangup_if_dialed',false);
  valid(result,'dont_verify_images',false);
  valid(result,'work_buf_min_days',0.1);
  valid(result,'work_buf_additional_days',0.25);
  valid(result,'max_ncpus_pct',0);
  valid(result,'cpu_scheduling_period_minutes',60);
  valid(result,'disk_interval',60);
  valid(result,'disk_max_used_gb',10);
  valid(result,'disk_max_used_pct',50);
  valid(result,'disk_min_free_gb',1);
  valid(result,'vm_max_used_pct',75);
  valid(result,'ram_max_used_busy_pct',50);
  valid(result,'ram_max_used_idle_pct',90);
  valid(result,'max_bytes_sec_up',0);
  valid(result,'max_bytes_sec_down',0);
  valid(result,'cpu_usage_limit',100);
  valid(result,'daily_xfer_limit_mb',0);
  valid(result,'daily_xfer_period_days',0);
  return result;
}

function valid(result,item,value)
{
  try {
    if (result[item] === void 0)
    {
      let newItem = [value];
      result[item] = newItem;
    }   
  } catch (error) {
    logging.logError('SettingsBoinc,valid', error);
  }

}

// Apply button.

function sendSettings(settings)
{
  try {
    let send = "<set_global_prefs_override><global_preferences>\n";
    send += getTag("  ","run_on_batteries",settings);
    send += getTag("  ","run_if_user_active",settings);
    send += getTag("  ","run_gpu_if_user_active",settings);
    send += getTag("  ","start_hour",settings);
    send += getTag("  ","end_hour",settings);
    send += getTag("  ","net_start_hour",settings);
    send += getTag("  ","net_end_hour",settings);
    send += getTag("  ","leave_apps_in_memory",settings);
    send += getTag("  ","work_buf_min_days",settings);
    send += getTag("  ","work_buf_additional_days",settings);
    send += getTag("  ","max_ncpus_pct",settings);
    send += getTag("  ","cpu_scheduling_period_minutes",settings);
    send += getTag("  ","disk_interval",settings);
    send += getTag("  ","disk_max_used_gb",settings);
    send += getTag("  ","disk_max_used_pct",settings);
    send += getTag("  ","disk_min_free_gb",settings);
    send += getTag("  ","vm_max_used_pct",settings);
    send += getTag("  ","ram_max_used_busy_pct",settings);
    send += getTag("  ","ram_max_used_idle_pct",settings);
    send += getTag("  ","idle_time_to_run",settings);
    send += getTag("  ","suspend_cpu_usage",settings);   
    send += getTag("  ","max_bytes_sec_up",settings);
    send += getTag("  ","max_bytes_sec_down",settings);
    send += getTag("  ","cpu_usage_limit",settings);
    send += getTag("  ","daily_xfer_limit_mb",settings);
    send += getTag("  ","daily_xfer_period_days",settings);
    send += addDayPrefs(settings)
    send += "</global_preferences>\n</set_global_prefs_override>"

    const sendArray = new SendArray();      
    sendArray.send(gSettingsBoincCon,send, dataSendReady);
    gSettingsUseGlobalPref = false;

  } catch (error) {
    logging.logError('SettingsBoinc,gotSettings', error);     
  }
}

function dataSendReady(even)
{
  let data = this.client_completeData;
  if (data.indexOf("success") < 0)
  {
    let msg = this.computerName + ": " + data;
    logging.logErrorMsg("SettingsBoinc,dataSendReady",msg);
    return;
  }
  const sendArray = new SendArray();      
  sendArray.send(gSettingsBoincCon,"<read_global_prefs_override/>", dataSendReadReady);
}

function dataSendReadReady(even)
{
  let data = this.client_completeData;
  if (data.indexOf("success") < 0)
  {
    let msg = this.computerName + ": " + data;
    logging.logErrorMsg("SettingsBoinc,dataSendReadReady",msg);
    return;
  }
  gChildSettingsBoinc.webContents.send('settings_ok');
}

function addDayPrefs(settings)
{
  let send = "";
  try {
    let prefs = settings.day_prefs;
    let len = prefs.length;
    for (let i=0;i < len;i++)
    {
      let item = prefs[i];
      send += "  <day_prefs>\n";
      send += "    <day_of_week>" + item.day + "</day_of_week>\n";
      if (!item.net)
      {
        send += getTag("    ","start_hour",item);
        send += getTag("    ","end_hour",item);
      }
      else
      {
        send += getTag("    ","net_start_hour",item);
        send += getTag("    ","net_end_hour",item);
      }
      send += "  </day_prefs>\n";
    }
  } catch (error) {
    logging.logError('SettingsBoinc,addDaysPrefs', error);  
  }
  return send;
}

function getTag(ls,tag,settings)
{
  let send = ls + "<" + tag + ">" + settings[tag] + "</" + tag + ">\n";
  return send;
}