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
const {BrowserWindow} = require('electron');

let gChildWww = null;
let gCssDarkWww = null;

class Www{
  show(gb,projectName,html)
  {
    showWww(gb,projectName,html);
          
  } catch (error) {    
  } 
  setTheme(css)
  {
    insertCssDark(css);
  }           
}
module.exports = Www;

function showWww(gb,projectName,html)
{
    try {
        let theme = gb.theme;
        let title = "BoincTasks Js - WWW - " + projectName;
        if (gChildWww == null)
        {
          let state = windowsState.get("www",600,500)
      
          gChildWww = new BrowserWindow({
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
          gChildWww.loadFile('index/index_www.html')
          gChildWww.once('ready-to-show', () => {    
//            gChildAbout.webContents.openDevTools()
            gChildWww.show();  
            gChildWww.setTitle(title);             
            gChildWww.webContents.send('www', html); 
          })
          gChildWww.webContents.on('did-finish-load', () => {
            insertCssDark(theme);
          })
          gChildWww.on('close', () => {
            let bounds = gChildWww.getBounds();
            windowsState.set("www",bounds.x,bounds.y, bounds.width, bounds.height)
          })     
          gChildWww.on('closed', () => {
            gChildWww = null
          })    
        }
        else
        {
            gChildWww.setTitle(title); 
            gChildWww.hide();
            gChildWww.show();  
            gChildWww.webContents.send('www', html);             
        }
              
    } catch (error) {
        logging.logError('Www,showWww', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkWww !== null)
    {
        gCssDarkWww.webContents.removeInsertedCSS(gCssDarkAbout) 
    }    
    gCssDarkWww = await gChildAbout.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkWww = null;
  }
}
