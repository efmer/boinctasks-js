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


let gSettingsColor = null;

class SettingsColor{
    set(callback, type, data1, data2)
    {
      switch(type)
      {
        case "menu":          
          addColorWindow(data1);
        break;
        case "element":
          gSettingsColor[data1] = data2;
          readWrite.write("settings\\color","settings_color.json",JSON.stringify(gSettingsColor));
          callback(gSettingsColor);          
        break;

      }
    }

    get()
    {
      try {
        if (gSettingsColor === null)
        {
          gSettingsColor = JSON.parse(readWrite.read("settings\\color", "settings_color.json"));
          if (gSettingsColor === null)
          {
            gSettingsColor = JSON.parse('{"#project_running":"rgb(200,255,191)","#project_suspended":"rgb(255,145,0)","#project_nonew":"rgb(151,159,157)","#task_error":"rgb(235,147,14)","#task_ready_start":"rgb(202,255,175)","#task_ready_abort":"rgb(248,244,92)","#task_suspended":"rgb(204,204,204)","#task_running_hp":"rgb(255,88,88)","#gtask_ready_start":"rgb(232,255,220)","#gtask_error":"rgb(253,172,49)","#task_running":"rgb(92,224,104)","#gtask_running":"rgb(134,239,143)","#task_ready_report":"rgb(253,241,117)","#task_download":"rgb(255,255,255)","#gtask_download":"rgb(255,255,255)","#gtask_ready_report":"rgb(253,246,166)","#gtask_running_hp":"rgb(255,122,122)","#progress_bar":"rgb(119,236,254)","#messages_priority":"rgb(253,143,143)","#messages_default":"rgb(239,255,255)","#messages_highlight_0":"rgb(107,241,122)","#messages_highlight_1":"rgb(167,238,254)","#messages_highlight_2":"rgb(251,247,128)","#messages_highlight_3":"rgb(252,166,127)"}');
          }      
        }
      } catch (error) {
        gSettingsColor = new Object();
      }      
      return gSettingsColor;
    }
  }
  module.exports = SettingsColor;

gChildSettingsColor = null;

function addColorWindow()
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