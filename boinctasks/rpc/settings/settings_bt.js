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

const ReadWrite  = require('../functions/readwrite');
const readWrite = new ReadWrite();

const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();

const {BrowserWindow, app} = require('electron');
const Functions = require('../functions/functions');
const functions = new Functions();
const btC = require('../functions/btconstants');

let gSettingsBt = null;
let gChildSettings = null;
let gCssDarkSettings = null;

class SettingsBt{
  start(set,theme)
  {
    settings(set,theme)
  }

  get()
  {
    try {
      getSettings();
    } catch (error) {
      logging.logError('SettingsBt,get', error);         
    }
      return gSettingsBt; 
  }

  set(settings)
  {
    let json = null;
    try {
      settings.languageIsSelected = btC.LANG_NUMBER;
      gSettingsBt = settings;
      isValid();
      json = JSON.stringify(settings);
      readWrite.write("settings", "settings_boinctasks.json",json);
    } catch (error) {
      logging.logError('SettingsBt,set', error);         
    }
  }

  send()
  {
    gChildSettings.send('settings_boinctasks', gSettingsBt);    
  }

  setTheme(css)
  {
      insertCssDark(css);
  }

  close()
  {
    if (gChildSettings !== null)
    {
      gChildSettings.close();
    }
  }
}
module.exports = SettingsBt;

function settings(settings,theme)
{
    try {
        let title = "BoincTasks Js " + btC.TL.DIALOG_SETTINGS_BT.DS_BT_TITLE;
        if (gChildSettings == null)
        {
          let state = windowsState.get("settings_boinctasks",700,800)
      
          gChildSettings = new BrowserWindow({
            'x' : state.x,
            'y' : state.y,
            'width': state.width,
            'height': state.height,
            webPreferences: {
              sandbox : false,
              contextIsolation: false,  
              nodeIntegration: true,
              nodeIntegrationInWorker: true,        
     //         preload:'${__dirname}/preload/preload.js',
            }
          });
            gChildSettings.loadFile('index/index_settings_boinctasks.html')
            gChildSettings.once('ready-to-show', () => {    
              if (btC.DEBUG_WINDOW)
              {
                gChildSettings.webContents.openDevTools()
              }
              gChildSettings.show();  
              gChildSettings.setTitle(title);
          })

          gChildSettings.webContents.on('did-finish-load', () => {
            insertCssDark(theme);
            gChildSettings.webContents.send("translations",btC.TL.DIALOG_SETTINGS_BT);                
            setTimeout(timerSettings,200,settings); // delay to make sure the windows is ready.            
          })  

          gChildSettings.on('close', () => {
            let bounds = gChildSettings.getBounds();
            windowsState.set("settings_boinctasks",bounds.x,bounds.y, bounds.width, bounds.height)
          })  
             
          gChildSettings.on('closed', () => {
            gChildSettings = null
          })    
        }
        else
        {
          if (btC.DEBUG_WINDOW)
          {
            gChildSettings.webContents.openDevTools()
          }          
          gChildSettings.setTitle(title); 
          gChildSettings.hide();
          gChildSettings.show();
          gChildSettings.send('settings_boinctasks', settings);
        }
              
    } catch (error) {
        logging.logError('SettingsBt,settings', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkSettings !== null)
    {
      gChildSettings.webContents.removeInsertedCSS(gCssDarkSettings) 
    }    
    gCssDarkSettings = await gChildSettings.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkSettings = null;
  }
}


function timerSettings(settings)
{
  gChildSettings.send('settings_boinctasks', settings);
}

function getSettings()
{
  try {
    if (gSettingsBt === null)
    {
      gSettingsBt = JSON.parse(readWrite.read("settings", "settings_boinctasks.json"));
      if (gSettingsBt === null)
      {
        // settings must be identical to renderer_settings_boinctasks.js
        gSettingsBt = new Object();
      }
      isValid();      
    }
   
  } catch (error) {
    logging.logError('SettingsBt,getSettings', error);
    gSettingsBt = new Object();
    isValid();
  }
}

function isValid()
{
  try {
    let defaultCss = ".bt_table { font-family: system; font-size: 1.0em;} "
    if (!functions.isDefined(gSettingsBt.css)) gSettingsBt.css = defaultCss;
    if (!functions.isDefined(gSettingsBt.dateCountry)) gSettingsBt.dateCountry = "";
    if (!functions.isDefined(gSettingsBt.refreshRate)) gSettingsBt.refreshRate = 2;
    if (!functions.isDefined(gSettingsBt.historyRefreshRate)) gSettingsBt.historyRefreshRate = 60;
    if (!functions.isDefined(gSettingsBt.historyDelete)) gSettingsBt.historyDelete = 7;
    if (!functions.isDefined(gSettingsBt.socketTimeout)) gSettingsBt.socketTimeout = 10;

    // restart at a certain time of day
    let restartTime = gSettingsBt.restartTime;
    if (restartTime == '')
    {
      gSettingsBt.restartTimeCheck = false;
    }
    else
    {
      let timeSplit = restartTime.split(":");
      if (timeSplit.length == 2)
      {
        gSettingsBt.restartTimeHours = timeSplit[0];
        gSettingsBt.restartTimeMinutes = timeSplit[1];
      }
      else
      {
        gSettingsBt.restartTimeCheck = false; 
      }
    }

    if (gSettingsBt.css.length === 0)
    {
      gSettingsBt.css = defaultCss;
    }

    if (isNaN(gSettingsBt.fontSize) || gSettingsBt.fontSize === 0)
    {
      gSettingsBt.fontSize = 1;
    }

    if (isNaN(gSettingsBt.refreshRate) || gSettingsBt.refreshRate < 1 || gSettingsBt.refreshRate.length === 0) 
    {
      gSettingsBt.refreshRate = 2;
    }

    if (gSettingsBt.historyRefreshRate.length === 0)
    {
      gSettingsBt.historyRefreshRate = 0;
    }

    if (gSettingsBt.historyDelete == 0)
    {
      gSettingsBt.historyRefreshRate = 0; // disable
    }

    if (gSettingsBt.historyRefreshRate != 0)  // 0 is disabled.
    {
      if (isNaN(gSettingsBt.historyRefreshRate) || gSettingsBt.historyRefreshRate < 20) 
      {
        gSettingsBt.historyRefreshRate = 60;
      }
    }  
    if (isNaN(gSettingsBt.historyDelete) || gSettingsBt.historyDelete > 30 || gSettingsBt.historyDelete.length === 0) 
    {
      gSettingsBt.historyDelete = 7;
    }

    if (isNaN(gSettingsBt.socketTimeout) || gSettingsBt.socketTimeout < 4) 
    {
      gSettingsBt.socketTimeout = 4;
    }
    btC.CONNECTION_TIMEOUT = parseInt(gSettingsBt.socketTimeout);
  } catch (error) {
    logging.logError('SettingsBt,isValid', error);  
  }
  

  /* Doesn't work in Windows Store
  if (gSettingsBt.startLogin === '1')
  {
    startAtLogin(true);
  }
  else
  {
    startAtLogin(false);
  }
  */
}

/* Doesn't work in Windows Store

function startAtLogin(bRun)
{
  try {
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment)
    {
      bRun = false;
    }
    let pathExe =  app.getPath('exe');

    if (bRun)
    {
      app.setLoginItemSettings({openAtLogin: bRun, path: pathExe})
    }
    else
    {
      app.setLoginItemSettings({openAtLogin: false}); 
    }
    let state = app.getLoginItemSettings({
      //..xx: bRun,
      //path: pathExe
    })
    let login = "NO";
    if (state.executableWillLaunchAtLogin)
    {
      login = "Yes";
    }
    if (isDevelopment)
    {
      login += " ,development";
    }

    let enabledFound = "?";
    let nameFound = "?";
    let exeFound = "?";

    let li = state.launchItems;
    if (li.length > 0)
    {
      nameFound = li[0].name;
      exeFound = li[0].path;
      if (li[0].enabled)
      {
        enabledFound = "Yes";
      }
    }

    logging.logDebug("Start at login: " + login + " exe: " + exeFound + " key: " + nameFound + " Enabled: " + enabledFound);    
  } catch (error) {
    logging.logError('SettingsBt,startAtLogin', error);      
  }
}
  */
