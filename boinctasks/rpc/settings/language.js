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
const btC = require('../functions/btconstants');

let gChildLanguage = null;
let gCssDarkLanguage = null;

class Language{
  showLanguage(settings,theme)
  {
    selectLanguage(settings,theme);
          
  } 
  
  close()
  {
    if (gChildLanguage !== null) gChildLanguage.hide();
  }
}
module.exports = Language;

function selectLanguage(settings,theme)
{
    try {
        let title = "BoincTasks Js";
        if (gChildLanguage == null)
        {
          let state = windowsState.get("language",500,800)
      
          gChildLanguage = new BrowserWindow({
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
          gChildLanguage.loadFile('index/index_language.html')
          gChildLanguage.once('ready-to-show', () => {    
            if (btC.DEBUG_WINDOW)
            {                    
              gChildLanguage.webContents.openDevTools();
            }  
            gChildLanguage.show();  
            gChildLanguage.setTitle(title);
          })
          gChildLanguage.webContents.on('did-finish-load', () => {
            insertCssDark(theme);
            gChildLanguage.webContents.send("translations",btC.TL.DIALOG_ABOUT);                  
            gChildLanguage.webContents.send('settings_language', settings);             
          })
          gChildLanguage.on('close', () => {
            let bounds = gChildLanguage.getBounds();
            windowsState.set("language",bounds.x,bounds.y, bounds.width, bounds.height)
          })     
          gChildLanguage.on('closed', () => {
            gChildLanguage = null
          })    
        }
        else
        {
          if (btC.DEBUG_WINDOW)
          {                    
            gChildLanguage.webContents.openDevTools();
          }  
          gChildLanguage.setTitle(title); 
          gChildLanguage.hide();
          gChildLanguage.show();  
          gChildLanguage.webContents.send('settings_language', settings);             
        }
              
    } catch (error) {
        logging.logError('Language,selectLanguage', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkLanguage !== null)
    {
      gChildLanguage.webContents.removeInsertedCSS(gCssDarkLanguage) 
    }    
    gCssDarkLanguage = await gChildLanguage.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkLanguage = null;
  }
}