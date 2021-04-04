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

const TESTING_UPDATE = false;

const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();

const btConstants = require('../functions/btconstants');

const os = require('os');
const {app,BrowserWindow} = require('electron')
const shell = require('electron').shell

let gReleaseVersion = "";
let gBetaVersion = "";

class Update{
    update(type)
    {
      updateWindow();
    } 
    button(type)
    {
      let osPlatform = os.platform();
      if (TESTING_UPDATE) osPlatform = "darwin";
      switch(osPlatform)
      {
        case "win32":
          downloadExe(type);
        break;
        case "darwin":
          linkExe(type);
        break;          
      }        

    }
}
module.exports = Update;

gChildUpdate = null;

function updateOs()
{
    try {
        let osPlatform = os.platform();
        if (TESTING_UPDATE) osPlatform = "darwin";     
        let osArch = os.arch();
        let version = btConstants.VERSION.toFixed(2)
        let msg = "Platform: " + osPlatform + ", architecture: " + osArch + "<br><br>"; 
        msg += "<b>Current version: " + version + "</b><br><br>";

        switch(osPlatform)
        {
          case "win32":
            updateWin32(msg,);
            return;
          break;
          case "darwin":
            updateDarwin(msg,);
            return;
          break;          
        }      
        msg += "<br>Updates are handled automatically."
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

              let version = btConstants.VERSION;
              if (TESTING_UPDATE) version = 0.5 // force new version to show
              if (releaseVersion > version)
              {
                br += "Found new release version: " + releaseVersion + "<br>"
                br += releaseInfo;
                br += '<br><button id="button_release">Download release version</button>';
                br += "<br><br>"
              }

              if (betaVersion > version)
              {
                br += "Found new beta version: " + betaVersion + "<br>"
                br += betaInfo;
                br += '<br><button id="button_beta">Download beta version</button>';                
                br += "<br><br>"
              }
              if (br === "")
              {
                br += "BoincTasks Js is up-to-date.";
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
          gChildUpdate.webContents.send('update_download', "Downloading: " + percS + " %"); 
          percS = percNow;
        }
      });
      resp.on('end', () => {
        try {
          var buffer = Buffer.concat(data);
          gChildUpdate.webContents.send('update_download', "Download completed."); 
          const ReadWrite  = require('../functions/readwrite');
          const readWrite = new ReadWrite();
          let dir = readWrite.write("temp","btj.appx",buffer);            
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
    const Shell = require('node-powershell');

    const ps = new Shell({
      executionPolicy: 'Bypass',
      noProfile: true
    });
    
    ps.addCommand('cd "' + path + '"');    //"C:\\Users\\fred\\AppData\\Roaming\\Boinctasks Js\\temp"');
    ps.addCommand("Add-AppxPackage btj.appx");
    ps.invoke()
    .then(output => {
      if (output.length === 0)
      {
        msg += '<b><h3 style="color:green;"> New version installed.</h3><b><br>Restarting.......';
        gChildUpdate.webContents.send('update_download', msg);
        setTimeout(restart, 5000)
      }
      else 
      {
        msg += "Installation failed: (output) "  + output + "<br>";
        logging.logDebug("Install", msg);
        gChildUpdate.webContents.send('update_download', msg);          
      }
    })
    .catch(err => {
      msg += "Installation failed: (err) "  + err + "<br>";
      logging.logDebug("Install", msg);
      gChildUpdate.webContents.send('update_download', msg);        
    });

  } catch (error) {
    logging.logError('Update,Install', error);
  } 
}

function restart()
{
  app.relaunch()
  app.exit()
}

function updateWindow()
{
    try {
       
        let title = "BoincTasks Js Check for update";
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
              preload: './preload/preload.js'
            }
          });
          gChildUpdate.loadFile('index/index_update.html')
          gChildUpdate.once('ready-to-show', () => {    
//            gChildUpdate.webContents.openDevTools()
            gChildUpdate.show();  
            gChildUpdate.setTitle(title);
            updateOs();
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
          gChildUpdate.setTitle(title); 
            gChildUpdate.hide();
            gChildUpdate.show();  
            updateOs();         
        }
              
    } catch (error) {
        logging.logError('Update,updateWindow', error);        
    }  
}