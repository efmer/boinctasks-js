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

const TESTING_UPDATE_DARWIN = false;
const TESTING_UPDATE_LINUX = false;
const TESTING_UPDATE = false;

const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const btC = require('../functions/btconstants');

const os = require('os');
const {app,BrowserWindow} = require('electron')
const shell = require('electron').shell;

let gReleaseVersion = "";
let gBetaVersion = "";
let gCurrentVersion = "";

let gChildUpdate = null;
let gCssDarkUpdate = null;

class Update{
  update(type,version,theme)
  {
    gCurrentVersion = version;
    updateWindow(version,theme);
  } 
  button(type)
  {
    let osPlatform = os.platform();
    if (TESTING_UPDATE_DARWIN) osPlatform = "darwin";
    if (TESTING_UPDATE_LINUX) osPlatform = "linux";    
    switch(osPlatform)
    {
      case "win32":
        downloadExe(type);
      break;
      default:
        linkExe(type);         
    }
  }
  setTheme(css)
  {
    insertCssDark(css);
  }
}
module.exports = Update;

function updateOs(version)
{
    try {
        let osPlatform = os.platform();
        if (TESTING_UPDATE_DARWIN) osPlatform = "darwin";
        if (TESTING_UPDATE_LINUX) osPlatform = "linux";
        let osArch = os.arch();
        let msg = btC.TL.DIALOG_UPDATE.DUD_PLATFORM + " " + osPlatform + " , " + btC.TL.DIALOG_UPDATE.DUD_ARCH + " " + osArch + "<br><br>"; 
        msg += "<b>" + btC.TL.DIALOG_UPDATE.DUD_CURRENT + " " + version + "</b><br><br>";

        msg += btC.TL.DIALOG_UPDATE.DUB_VERSION_WEBSITE + "<br><br><br><br>"

        switch(osPlatform)
        {
          case "win32":
            updateWin32(msg);
          break;
          case "darwin":
            updateDarwin(msg,);
          break;
          default:
            updateRest(msg);
          break;          
        }      
        gChildUpdate.webContents.send('update_msg', msg);         
    } catch (error) {
        logging.logError('Update,checkUpdate', error);        
    }  
}

function updateWin32(msg)
{
  let msg2 = msg + "Checking for updates on https://efmer.eu"
  gChildUpdate.webContents.send('update_msg', msg2);  
  osText = "Windows";
  url = "https://efmer.eu/download/boinc/boinc_tasks_js/windows/update.xml";
  readUrl(url, msg);
}

function updateDarwin(msg)
{
  let msg2 = msg + "Checking for updates on https://efmer.eu"
  gChildUpdate.webContents.send('update_msg', msg2);  
  url = "https://efmer.eu/download/boinc/boinc_tasks_js/mac/update.xml";
  readUrl(url, msg);
}

function updateRest(msg)
{
  let msg2 = msg + "Checking for updates on https://efmer.eu"
  gChildUpdate.webContents.send('update_msg', msg2);  
  url = "https://efmer.eu/download/boinc/boinc_tasks_js/linux/update.xml";
  readUrl(url, msg);
}

function xmlFound(xml,msg)
{
  var bFound = false;
  try {
      var parseString = require('xml2js').parseString;
      parseString(xml, function (err, data) {
          if (functions.isDefined(data.update))
          {
              var update = data.update;
              let beta = update.beta[0];
              let release = update.release[0];
              let betaInfo = beta.info[0].replace(/\r?\n/g, "<br>");
              let betaVersion = beta.version[0];
              let releaseInfo = release.info[0].replace(/\r?\n/g, "<br>")
              let releaseVersion = release.version[0];

              gReleaseVersion = release.url[0];
              gBetaVersion = beta.url[0];

              let br = "";
              let showButton = true;
              if (process.windowsStore)
              {
                showButton = false;
              }
              if (TESTING_UPDATE) gCurrentVersion = 0.5 // force new version to show
              if (releaseVersion > gCurrentVersion)
              {
                br += btC.TL.DIALOG_UPDATE.DUD_FOUND_NEW_RELEASE + " " + releaseVersion + "<br>"
                br += releaseInfo;
                if (showButton)
                {
                  br += '<br><button id="button_release">' + btC.TL.DIALOG_UPDATE.DUD_DOWNLOAD_RELEASE + '</button>';                  
                }
                br += "<br><br>"
              }

              if (betaVersion > gCurrentVersion)
              {
                br += btC.TL.DIALOG_UPDATE.DUD_FOUND_NEW_BETA + " " + betaVersion + "<br>"
                br += betaInfo;
                if (showButton)
                {
                  br += '<br><button id="button_beta">' + btC.TL.DIALOG_UPDATE.DUD_DOWNLOAD_BETA +'</button>';                
                }
                br += "<br><br>"
              }
              if (br === "")
              {
                br +=  btC.TL.DIALOG_UPDATE.DUD_UP_TO_DATE + " (" + btC.TL.DIALOG_UPDATE.DUD_UP_TO_DATE_BETA +  " " + betaVersion + " , "+ btC.TL.DIALOG_UPDATE.DUD_UP_TO_DATE_RELEASE + " " + releaseVersion + ")";
              }
              msg += br;
              bFound = true;
          }
      });
      } catch (error) {
          logging.logError('Results,parseResults', error);
      }
      if (!bFound)
      {
        msg += "Failed to read update file. (xmlFound)"
      }
      gChildUpdate.webContents.send('update_msg', msg);
}

function readUrl(url,msg)
{
  try {
    https = require('https');
    https.get(url, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
          data += chunk;
      });
      resp.on('end', () => {
        xmlFound(data,msg);
      });

    }).on("error", (err) => {
      msg += "Failed to read update file. (xmlNotFound)";
      let errMsg = "Update failed: " + err;
      logging.logDebug(errMsg);
      gChildUpdate.webContents.send('update_msg', msg);  
    });
  } catch (error) {      
    logging.logError('Update,readUrl', error);  
  }
}

function linkExe(type)
{
  try {
    let url = "";
    switch (type)
    {    
      case "release" :
        url = gReleaseVersion;
      break;
      case "beta" :
        url = gBetaVersion;
      break;
    }
    shell.openExternal(url)
  } catch (error) {
    logging.logError('Update,linkExe', error);  
  }
}

function downloadExe(type)
{
  try {
    let url = "";
    switch (type)
    {    
      case "release" :
        url = gReleaseVersion;
      break;
      case "beta" :
        url = gBetaVersion;
      break;
    }

    https = require('https');
    https.get(url, (resp) => {
      let length = resp.headers['content-length'];
      let lenRead = 0;
      let data = [];    
      let percS = "";
      resp.on('data', (chunk) => {
        data.push(chunk)
        lenRead += chunk.length;

        let perc = (lenRead / length)*100;
        let percNow = perc.toFixed(2)
        if (percS != percNow)
        {
          gChildUpdate.webContents.send('update_download', btC.TL.DIALOG_UPDATE.DUB_DOWNLOADING + " " + percS + " %"); 
          percS = percNow;
        }
      });
      resp.on('end', () => {
        try {
          var buffer = Buffer.concat(data);
          const ReadWrite  = require('../functions/readwrite');
          const readWrite = new ReadWrite();
          let dir = readWrite.write("temp","btj_setup.exe",buffer);            
          Install(dir);
        } catch (error) {
          logging.logError('Update,downloadExe,end', error);
          gChildUpdate.webContents.send('update_download', "Failed to read exe file (downloadExe end)");            
        }
      });

    }).on("error", (err) => {
      let msg = "Failed to read exe file. (downloadExe)";
      let errMsg = "Dowload exe failed: " + err;
      logging.logDebug(errMsg);
      gChildUpdate.webContents.send('update_download', msg);  
    });
  } catch (error) {
    logging.logError('Update,downloadExe', error); 
  }
}

function Install(path)
{
  let msg = "";
  logging.logDebug("Install,Path used: " + path + "<br>");
  try {
    msg +=  btC.TL.DIALOG_UPDATE.DUB_NEW_VERSION_READY;
    gChildUpdate.webContents.send('update_download', msg);
    setTimeout(exitApp, 3000)
    var child = require('child_process').execFile;
    var executablePath = path + "\\btj_setup.exe";
    var parameters = ["--show"];
    child(executablePath, parameters, function(err, data) {
    if(err){
      msg += "Installation failed: " + err.message;
      logging.logDebug("Failed to run downloaded installer", msg);
      gChildUpdate.webContents.send('update_download', msg);         
      return;
    }
    });
} catch (error) {
    logging.logError('Update,Install', error);
  } 
}

function exitApp()
{
  app.exit()
}

function updateWindow(version,theme)
{
    try {
       
        let title = "BoincTasks Js - " + btC.TL.DIALOG_UPDATE.DUD_TITLE;
        if (gChildUpdate == null)
        {
          let state = windowsState.get("update",400,600)
      
          gChildUpdate = new BrowserWindow({
            'x' : state.x,
            'y' : state.y,
            'width': state.width,
            'height': state.height,
            webPreferences: {
              sandbox : false,
              contextIsolation: false,  
              nodeIntegration: true,
              nodeIntegrationInWorker: true,        
   //           preload:'${__dirname}/preload/preload.js',
            }
          });

          gChildUpdate.loadFile('index/index_update.html')
          gChildUpdate.once('ready-to-show', () => {    
            if (btC.DEBUG_WINDOW)
            {
              gChildUpdate.webContents.openDevTools()
            }
            gChildUpdate.show();  
            gChildUpdate.setTitle(title);
          })

          gChildUpdate.webContents.on('did-finish-load', () => {
            insertCssDark(theme);
            updateOs(version);            
          })

          gChildUpdate.on('close', () => {
            let bounds = gChildUpdate.getBounds();
            windowsState.set("update",bounds.x,bounds.y, bounds.width, bounds.height)
          }) 
              
          gChildUpdate.on('closed', () => {
            gChildUpdate = null
          })    
        }
        else
        {
          if (btC.DEBUG_WINDOW)
          {
            gChildUpdate.webContents.openDevTools()
          }
          gChildUpdate.setTitle(title); 
           gChildUpdate.hide();
           gChildUpdate.show();  
           updateOs(version);         
        }
              
    } catch (error) {
        logging.logError('Update,updateWindow', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkUpdate !== null)
    {
      gChildUpdate.webContents.removeInsertedCSS(gCssDarkUpdate) 
    }    
    gCssDarkUpdate = await gChildUpdate.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkUpdate = null;
  }
}