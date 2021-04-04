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
const os = require('os');
const {app,BrowserWindow} = require('electron')

// !!!!!!!!!!!!!!!!!!!!!!! DO NOT USE ABOUT as it it's removed by the packager

class Credits{
    about(version)
    {
        addAboutWindow(version);
            
    } catch (error) {    
    }        
}
module.exports = Credits;

gChildAbout = null;
function addAboutWindow(version)
{
    try {
        let info = infoMsg(version);
        let title = "BoincTasks About";
        if (gChildAbout == null)
        {
          let state = windowsState.get("about",700,800)
      
          gChildAbout = new BrowserWindow({
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
          gChildAbout.loadFile('index/index_credits.html')
          gChildAbout.once('ready-to-show', () => {    
//            gChildAbout.webContents.openDevTools()
            gChildAbout.show();  
            gChildAbout.setTitle(title);
            gChildAbout.webContents.send('about', info); 
          }) 
          gChildAbout.on('close', () => {
            let bounds = gChildAbout.getBounds();
            windowsState.set("about",bounds.x,bounds.y, bounds.width, bounds.height)
          })     
          gChildAbout.on('closed', () => {
            gChildAbout = null
          })    
        }
        else
        {
            gChildAbout.setTitle(title); 
            gChildAbout.hide();
            gChildAbout.show();  
            gChildAbout.webContents.send('about', info);             
        }
              
    } catch (error) {
        logging.logError('About,addAboutWindow', error);        
    }  
}

function infoMsg(version)
{
  let msg = "Version: " + version;
  msg += "<br>";
  msg += "System running on platform: " + os.platform() + " ,architecture: " + os.arch();
  msg += "<br>";
  msg += "Locale: " + app.getLocale();  
  return msg;
}