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
const {app,BrowserWindow} = require('electron');
const btC = require('../functions/btconstants');

// !!!!!!!!!!!!!!!!!!!!!!! DO NOT USE ABOUT it will be auto removed by the packager

let gChildAbout = null;
let gCssDarkAbout = null;

class Credits{
  about(version,theme)
  {
    addAboutWindow(version,theme);
          
  } catch (error) {    
  } 
  setTheme(css)
  {
    insertCssDark(css);
  }           
}
module.exports = Credits;

function addAboutWindow(version,theme)
{
    try {
        let info = infoMsg(version);
        let title = "BoincTasks Js - " + btC.TL.DIALOG_ABOUT.DAB_TITLE;
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
            gChildAbout.webContents.send("translations",btC.TL.DIALOG_ABOUT);              
            gChildAbout.webContents.send('about', info); 
          })
          gChildAbout.webContents.on('did-finish-load', () => {
            insertCssDark(theme);
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
            gChildAbout.webContents.send("translations",btC.TL.DIALOG_ABOUT);               
            gChildAbout.webContents.send('about', info);             
        }
              
    } catch (error) {
        logging.logError('About,addAboutWindow', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkAbout !== null)
    {
      gChildAbout.webContents.removeInsertedCSS(gCssDarkAbout) 
    }    
    gCssDarkAbout = await gChildAbout.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkAbout = null;
  }
}

function infoMsg(version)
{
  let msg = btC.TL.DIALOG_ABOUT.DAB_VERSION +  " " + version;
  msg += "<br>";
  msg += btC.TL.DIALOG_ABOUT.DAB_SYSTEM_RUNNING + " " + os.platform() + " , " + btC.TL.DIALOG_ABOUT.DAB_ARCH + " " + os.arch();
  if (process.windowsStore)
  {
    msg += " - Windows Store";
  }
  msg += "<br>";
  msg += btC.TL.DIALOG_ABOUT.DAB_LOCALE + " " + app.getLocale();
  msg += "<br>";
  msg += btC.TL.DIALOG_ABOUT.DAB_REGION + " " + app.getLocaleCountryCode();
  return msg;
}