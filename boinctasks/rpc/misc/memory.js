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

const fs = require('fs');

const Logging = require('../functions/logging');
const logging = new Logging();

const btC = require('../functions/btconstants');

//const ReadWrite  = require('../functions/readwrite');
//const readWrite = new ReadWrite();

const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();

const {app,BrowserWindow } = require('electron');

let gChildWindowMemory = null;
let gCssDarkMemory = null;

let gMemoryTimer = null;

require("v8").setFlagsFromString("--expose_gc");
global.gc = require("vm").runInNewContext("gc");
const v8 = require('node:v8');

class MemoryUsage{
    file = "";
    fs = require('fs')
    showMemory(theme)
    {
        try {
            showMemory(theme); 
        } catch (error) {
            logging.logError('MemoryUsage,showMemory', error);            
        }
    }
    logging(data)
    {
        if (data.first)
        {
            this.initFileLogging();
            gChildWindowMemory.webContents.send('memory_file', this.file);

        }
        this.writeFile(data.txt);
    }

    initFileLogging()
    {
        try {
            const loggingFolder = app.getPath("userData") + "/logging";
            if (!fs.existsSync(loggingFolder))
            {
                fs.mkdirSync(loggingFolder, {recursive: true});
            }
            const logFileDebug = loggingFolder + "/boinctasks_js_memory_debug";  
    
            try {
                fs.renameSync(logFileDebug + '1.csv',logFileDebug + '2.csv');
            } catch (error) {}
       
            try {
                fs.renameSync(logFileDebug + ".csv",logFileDebug + '1.csv');
            } catch (error) {}
       
           this.file = logFileDebug + ".csv";

           logging.logDebug("Memory logging in file: " + this.file);

        } catch (error) {
            var ii = 1;
        }
    }

    writeFile(msg)
    {
        try 
            {
                this.fs.writeFileSync(this.file,msg, { flag: 'a+', flush:true});
            } catch (error)
            {
                var ii = 1;
            }
    }

    getCallBack()
    {
        return this.callback();
    }

    getHeap()
    {
        try 
            {
                const folder = app.getPath("userData") + "/heap"
                if (!fs.existsSync(folder)){
                  fs.mkdirSync(folder);
                }
                v8.writeHeapSnapshot(folder+'/btjs_heap');
            } catch (error)
            {
                var ii = 1;
            }        
    }


}
module.exports = MemoryUsage;

function showMemory(theme)
{
  var title = "BoincTasks Js - Memory Usage";

  if (gChildWindowMemory == null)
  {
    let state = windowsState.get("memory",800,800)

    gChildWindowMemory = new BrowserWindow({
      'x' : state.x,
      'y' : state.y,
      'width': state.width,
      'height': state.height,
      webPreferences: {
        sandbox : false,
        contextIsolation: false,  
        nodeIntegration: true,
        nodeIntegrationInWorker: true,        
    //    preload:'${__dirname}/preload/preload.js',
      }
    });

    gChildWindowMemory.loadFile('index/index_memory.html')
    gChildWindowMemory.once('ready-to-show', () => {    
        gChildWindowMemory.setTitle(title);
        if (btC.DEBUG_WINDOW)
        {                    
            gChildWindowMemory.webContents.openDevTools();
        } 

    }) 
    gChildWindowMemory.webContents.on('did-finish-load', () => {
        insertCssDark(theme);
        startTimer();
        getMemory(true);
      })  
      gChildWindowMemory.on('close', () => {
        let bounds = gChildWindowMemory.getBounds();
        windowsState.set("memory",bounds.x,bounds.y, bounds.width, bounds.height)
      })     
      gChildWindowMemory.on('closed', () => {
        gChildWindowMemory = null
        stopTimer();
      })  
  }
  else
  {
    if (btC.DEBUG_WINDOW)
    {                    
        gChildWindowMemory.webContents.openDevTools();
    } 
    gChildWindowMemory.hide();    
    gChildWindowMemory.show();
  }
}

function startTimer()
{
    try {
        gMemoryTimer = setInterval(memoryTimer, 5000);    // 5 second
    } catch (error) {
        logging.logError('MemoryUsage,startTimer', error);            
    } 
}

function stopTimer()
{
    try {
        clearTimeout(gMemoryTimer);
    } catch (error) {
        logging.logError('MemoryUsage,stopTimers', error);            
    } 
}

function memoryTimer()
{
    getMemory(false);
}

// npm run start -- --inspect-electron

function getMemory(bFirst)
{
    try {
        // note  process.memoryUsage() gives the same data as getHeapStatistics()
        let heap = process.getHeapStatistics();
        if (bFirst)
        {
            gChildWindowMemory.webContents.send('memory_first', heap);
            return;
        }

        gChildWindowMemory.webContents.send('memory', heap);
    } catch (error) {
        logging.logError('MemoryUsage,memoryTimer', error);            
    } 
}


async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkMemory !== null)
    {
        gChildWindowMemory.webContents.removeInsertedCSS(gCssDarkMemory) 
    }    
    gCssDarkMemory = await gChildWindowMemory.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkMemory = null;
  }
}