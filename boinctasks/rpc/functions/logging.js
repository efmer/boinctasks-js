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

const WindowsState = require('./window_state');
const windowsState = new WindowsState();

const btC = require('./btconstants');

const os = require('os');
const { app, BrowserWindow } = require('electron')

let g_logMsg = "";
let g_logDebugMsg = "";
let g_logRulesMsg = "";
let g_logErrorMsg = "";

let gLogging = new Object();
gLogging.type = 0;
gLogging.len = 0;

let gTimerLog = null;
let gChildWindowLog = null;
let gCssDarkLog = null;

class Logging{
    setVersion(versionIn)
    {
        try {
            let version = "BoincTasks Js, " + versionIn;
            this.log(version);
            this.logDebug(version); 
            this.logRules(version);
            g_logErrorMsg = version;
    
            let sys = btC.TL.DIALOG_LOGGING.DLG_MSG_PLATFORM + " " + os.platform() + " ," + btC.TL.DIALOG_LOGGING.DLG_MSG_ARCH + " " + os.arch();
            this.log(sys);
            this.logDebug(sys);
    
            let path = btC.TL.DIALOG_LOGGING.DLG_MSG_FOLDER_APP + " " + app.getPath("home");
            this.logDebug(path);        
            path = btC.TL.DIALOG_LOGGING.DLG_MSG_FOLDER_DATA + " " + app.getPath("appData");
            this.logDebug(path);
            let loc = app.getLocale();
            let ccode = app.getLocaleCountryCode();
            let locale = btC.TL.DIALOG_LOGGING.DLG_MSG_LOCALE + " " + loc + " , " + ccode;
            this.logDebug(locale);
        } catch (error) {
            let ii = 1;
        }
    }

    showLog(type,theme)
    {
        showLog(type,theme);
    }

    log(msg)
    {
        try {
            let time = getTime();            
            g_logMsg += time + " " + msg + ".</br>";
        } catch (error) {
            let ii = 1;
        }   
    }

    logClear()
    {
        switch(gLogging.type)
        {
            case btC.LOGGING_NORMAL:
                g_logMsg = "";
            break;
            case btC.LOGGING_DEBUG:
                g_logDebugMsg = "";
            break;
            case btC.LOGGING_RULES:
                g_logRulesMsg = "";
            break;            
            case btC.LOGGING_ERROR:
                g_logErrorMsg = "";
            break;            
        }      
    }

    logDebug(msg)
    {
        try {
            let time = getTime();            
            g_logDebugMsg += time + " " + msg + ".</br>";    
        } catch (error) {
            let  ii =1;
        }        
    }

    logRules(msg)
    {
        try {
            let time = getTime();            
            g_logRulesMsg += time + " " + msg + ".</br>";    
        } catch (error) {
            let  ii =1;
        }        
    }

    logError(from,error)
    {
        try {
            let time = getTime();
            let msg = error.message;
            msg += "<br>" + error.stack;
            g_logErrorMsg += time + " " + btC.TL.DIALOG_LOGGING.DLG_TITLE_ERROR + " [" + from + "] " + msg + ".</br>"; 
        } catch (error) {
            let  ii =1;            
        }        
    }   

    logErrorMsg(from,msg)
    {
        msg = msg.replaceAll("<","&#60;")        
        msg = msg.replaceAll(">","&#62;")
        let time = getTime();
        g_logErrorMsg += time + " " + btC.TL.DIALOG_LOGGING.DLG_TITLE_ERROR + " [" + from + "] " + msg + ".</br>";     
    }

    setTheme(css)
    {
        insertCssDark(css);
    }
}

module.exports = Logging;

function getTime()
{
    try {

        let date = new Date();
        let txt = date.toLocaleTimeString();
        return txt;
    } catch (error) {
        let ii  = 1;
    }
}

function showLog(logType,theme)
{
  try {
    clearTimeout(gTimerLog);
    gTimerLog =  setInterval(btTimerLog, 2000);

    let title = "BoincTasks Js - " + logTitle(logType)

    let log = logGet(logType)
    
    if (gLogging.type !== logType)
    {
      gLogging.len = -1;
    }
    gLogging.type = logType;

    if (gChildWindowLog === null)
    {
      let state = windowsState.get("log",500,800)
      gChildWindowLog = new BrowserWindow({
        'x': state.x,
        'y': state.y,
        'width': state.width,
        'height': state.height,      
        webPreferences: {
          sandbox : false,
          contextIsolation: false,  
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
//          preload: path.join(__dirname, './preload/preload_log.js')
        }
      });
      gChildWindowLog.loadFile('index/index_log.html')
      gChildWindowLog.once('ready-to-show', () => {    
        gChildWindowLog.show();  
        gChildWindowLog.webContents.send('log_text', log); 
        gChildWindowLog.setTitle(title);
        gChildWindowLog.webContents.send("translations",btC.TL.DIALOG_LOGGING);            
//        gChildWindowLog.webContents.openDevTools()    
      })
      gChildWindowLog.webContents.on('did-finish-load', () => {
        insertCssDark(theme);
      })  
      gChildWindowLog.on('close', () => {
        let bounds = gChildWindowLog.getBounds();
        windowsState.set("log",bounds.x,bounds.y, bounds.width, bounds.height)
      })
      gChildWindowLog.on('closed', () => {
        gChildWindowLog = null
      }) 
    }
    else
    {
      gChildWindowLog.setTitle(title); 
      gChildWindowLog.webContents.send('log_text', log); 
      gChildWindowLog.hide()
      gChildWindowLog.show()    
    }
  } catch (error) {
      var ii = 1;
  }
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkLog !== null)
    {
        gChildWindowLog.webContents.removeInsertedCSS(gCssDarkLog) 
    }    
    gCssDarkLog = await gChildWindowLog.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkLog = null;
  }
}

function logTitle(type)
{
    switch(type)
    {
        case btC.LOGGING_NORMAL:
            return btC.TL.DIALOG_LOGGING.DLG_TITLE;
        case btC.LOGGING_DEBUG:
            return btC.TL.DIALOG_LOGGING.DLG_TITLE_DEBUG;
        case btC.LOGGING_RULES:
            return btC.TL.DIALOG_LOGGING.DLG_TITLE_RULES;
        case btC.LOGGING_ERROR:
            return btC.TL.DIALOG_LOGGING.DLG_TITLE_ERROR;
    }
    return "??";
}

function logGet(type)
{
    switch(type)
    {
        case btC.LOGGING_NORMAL:
            return g_logMsg;
        case btC.LOGGING_DEBUG:
            return g_logDebugMsg;
        case btC.LOGGING_RULES:
            return g_logRulesMsg;
        case btC.LOGGING_ERROR:
            return g_logErrorMsg;
        break;
    }
}
  
function btTimerLog()
{
  try {
    if (gChildWindowLog != null) 
    {
      let log = logGet(gLogging.type)
      
      if (log.length !== gLogging.len)
      {
        gLogging.len = log.length;
        gChildWindowLog.webContents.send('log_text', log);
      }
    }
    else
    {
      clearTimeout(gTimerLog);      
    }
  } catch (error) {
    var ii = 1;
  }
}