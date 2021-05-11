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
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const ReadWrite  = require('../functions/readwrite');
const readWrite = new ReadWrite();

const {BrowserWindow} = require('electron')


// https://www.cssscript.com/color-picker-alpha-selection/
// https://vanilla-picker.js.org/gen/Picker.html

const SETTINGS_COLOR_LIGHT_JSON = "settings_color.json";
const SETTINGS_COLOR_DARK_JSON  = "settings_color_dark.json";

let gSettingsColor = null;
let gSettingsColorDarkMode = false;

gChildSettingsColor = null;
let gCssDarkColor = null;

class SettingsColor{
  set(callback, type, data1, data2,theme,darkmode)
  {
    switch(type)
    {
      case "menu":          
        addColorWindow(theme);
      break;
      case "element":
        try {
          gSettingsColor[data1] = data2;
          let fileJson;
          if (darkmode) fileJson = SETTINGS_COLOR_DARK_JSON;
          else fileJson = SETTINGS_COLOR_LIGHT_JSON;
          readWrite.write("settings\\color",fileJson,JSON.stringify(gSettingsColor));
          callback(gSettingsColor);
        } catch (error) {
          
        }
      break;
    }
  }

  get(darkmode)
  {
    try {
      gSettingsColorDarkMode = darkmode;
      let defaultColor;
      let fileJson;
      if (darkmode)
      {
        defaultColor = JSON.parse('{"#project_running":"rgb(18,125,0)","#project_suspended":"rgb(255,145,0)","#project_nonew":"rgb(151,159,157)","#task_error":"rgb(235,147,14)","#task_ready_start":"rgb(0,6,197)","#task_ready_abort":"rgb(248,244,92)","#task_suspended":"rgb(39,39,39)","#task_running_hp":"rgb(121,2,2)","#gtask_ready_start":"rgb(0,79,149)","#gtask_error":"rgb(253,172,49)","#task_running":"rgb(0,175,17)","#gtask_running":"rgb(1,149,13)","#task_ready_report":"rgb(118,108,0)","#task_download":"rgb(131,129,129)","#gtask_download":"rgb(147,147,147)","#gtask_ready_report":"rgb(163,150,0)","#gtask_running_hp":"rgb(178,0,0)","#progress_bar":"rgb(0,117,136)","#messages_priority":"rgb(255,68,68)","#messages_default":"rgb(79,134,134)","#messages_highlight_0":"rgb(0,191,21)","#messages_highlight_1":"rgb(10,210,254)","#messages_highlight_2":"rgb(199,193,6)","#messages_highlight_3":"rgb(251,107,42)","#history_ok":"rgb(0,120,11)","#history_error":"rgb(207,0,0)","#task_abort":"rgb(135,0,0)","#task_waiting_run":"rgb(54,54,54)","#task_suspended_user":"rgb(137,0,111)","#gtask_suspended":"rgb(0,0,0)","#gtask_suspended_user":"rgb(114,0,92)","#messages_highlight_4":"rgb(178,5,5)","#gtask_waiting_run":"rgb(90,88,88)","#gtask_abort":"rgb(109,0,0)","#messages_highlight_5":"rgb(165,162,162)","#messages_highlight_6":"rgb(165,162,162)","#messages_highlight_7":"rgb(165,162,162)","#messages_highlight_8":"rgb(165,162,162)","#messages_highlight_9":"rgb(165,162,162)","#select_background":"rgb(180,237,255)","#select_text":"rgb(0,0,0)"}');
        fileJson = SETTINGS_COLOR_DARK_JSON;
      }
      else
      {
        defaultColor = JSON.parse('{"#project_running":"rgb(200,255,191)","#project_suspended":"rgb(255,145,0)","#project_nonew":"rgb(151,159,157)","#task_error":"rgb(235,147,14)","#task_ready_start":"rgb(202,255,175)","#task_ready_abort":"rgb(248,244,92)","#task_suspended":"rgb(204,204,204)","#task_running_hp":"rgb(255,88,88)","#gtask_ready_start":"rgb(232,255,220)","#gtask_error":"rgb(253,172,49)","#task_running":"rgb(92,224,104)","#gtask_running":"rgb(134,239,143)","#task_ready_report":"rgb(253,241,117)","#task_download":"rgb(255,255,255)","#gtask_download":"rgb(255,255,255)","#gtask_ready_report":"rgb(253,246,166)","#gtask_running_hp":"rgb(255,122,122)","#progress_bar":"rgb(119,236,254)","#messages_priority":"rgb(253,143,143)","#messages_default":"rgb(239,255,255)","#messages_highlight_0":"rgb(107,241,122)","#messages_highlight_1":"rgb(167,238,254)","#messages_highlight_2":"rgb(251,247,128)","#messages_highlight_3":"rgb(252,166,127)"}');        
        fileJson = SETTINGS_COLOR_LIGHT_JSON;        
      }    

      try {
        gSettingsColor = JSON.parse(readWrite.read("settings\\color", fileJson));       
      } catch (error) {
        gSettingsColor = null;
      }
      if (gSettingsColor === null)
      {
        gSettingsColor = defaultColor;
      }
      if (gSettingsColor['#history_ok'] === void 0) gSettingsColor['#history_ok'] = "rgb(92,224,104)";
      if (gSettingsColor['#history_error'] === void 0) gSettingsColor['#history_error'] = "rgb(253,172,49)"; 
 
      if (gSettingsColor['#select_background'] === void 0) gSettingsColor['#select_background'] = "rgb(5,182,252)"; // blue;
      if (gSettingsColor['#select_text'] === void 0) gSettingsColor['#select_text'] = "rgb(227,227,227";  // light grey

    } catch (error) {
      logging.logError('SettingsColor,addColorWindow', error);       
    }
    return gSettingsColor;
  }

  setTheme(darkmode,theme)
  {    
    gSettingsColorDarkMode = darkmode;
    if (gChildSettingsColor !== null)
    {
      gChildSettingsColor.destroy();
      setTimeout(addColorWindow, 1000,theme)
    }
  }
}

module.exports = SettingsColor;

function addColorWindow(theme)
{
    try {
        let title = "BoincTasks Settings Color";
        if (gChildSettingsColor == null)
        {
          let state = windowsState.get("settings_color",700,800)
      
          gChildSettingsColor = new BrowserWindow({
            'x' : state.x,
            'y' : state.y,
            'width': state.width,
            'height': state.height,
            webPreferences: {
              sandbox : false,
              contextIsolation: false,  
              nodeIntegration: true,
              nodeIntegrationInWorker: true,        
              preload: './preload/preload.js'
            }
          });
          gChildSettingsColor.loadFile('index/index_settings_color.html')
          gChildSettingsColor.once('ready-to-show', () => {    
//              gChildSettingsColor.webContents.openDevTools()
              gChildSettingsColor.show();  
              gChildSettingsColor.setTitle(title);
              gChildSettingsColor.send('settings_color', gSettingsColor); 
          })
          gChildSettingsColor.webContents.on('did-finish-load', () => {
            insertCssDark(theme);
          })          
          gChildSettingsColor.on('close', () => {
            let bounds = gChildSettingsColor.getBounds();
            windowsState.set("settings_color",bounds.x,bounds.y, bounds.width, bounds.height)
          })     
          gChildSettingsColor.on('closed', () => {
              gChildSettingsColor = null
          })    
        }
        else
        {
          gChildSettingsColor.setTitle(title); 
          gChildSettingsColor.hide();
          gChildSettingsColor.show();
          //connections.addProject(gChildAddProject,'ready');    
        }
              
    } catch (error) {
        logging.logError('SettingsColor,addColorWindow', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gChildSettingsColor !== null)
    {
      if (gCssDarkColor !== null)
      {
        gChildSettingsColor.webContents.removeInsertedCSS(gCssDarkColor) 
      }    
      gCssDarkColor = await gChildSettingsColor.webContents.insertCSS(darkCss);
    }
  } catch (error) {
    gCssDarkColor = null;
  }
}