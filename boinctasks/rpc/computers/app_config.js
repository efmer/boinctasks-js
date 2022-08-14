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

const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const SendArray = require('../misc/send_array');
const {dialog,BrowserWindow} = require('electron');
const btC = require('../functions/btconstants');

let gChildAppConfig = null;
let gCssDarkAppConfig = null;
let gAppConfigCon = null;
let gAppConfigUrl = null;

class AppConfig{
  appConfigRead(selected,gb)
  {
    gAppConfigCon = null;
    gAppConfigUrl = null;  
    sendGetAppConfig(selected,gb)
  }
  update(gb,xml)
  {
    updateAppConfig(gb,xml);
  }

  setTheme(css)
  {
    insertCssDark(css);
  }    
}
module.exports = AppConfig;

function sendGetAppConfig(gb,selected)
{
  try {
    let res = selected[0].split(btC.SEPERATOR_SELECT);
    let computerName = res[1];
    let url = res[2];

    let con = null;
    let len = gb.connections.length;
    for (let i=0; i<len;i++ )
    {
      if (gb.connections[i].computerName === computerName)
      {
        con = gb.connections[i];
        break;
      }
    }
    if (con === null) return;

    AppConfigStart(gb,url,con);
  } catch (error) {
    logging.logError('AppConfig, sendGetAppConfig', error);     
  }
}

function AppConfigStart(gb,url,con)
{
  try {
      let title = "BoincTasks Js = " + btC.TL.DIALOG_EDIT_APP_CONFIG.DEA_TITLE;
      let state = windowsState.get("cc_config",700,800)
  
      if (gChildAppConfig === null)
      {
        gChildAppConfig = new BrowserWindow({
          'x' : state.x,
          'y' : state.y,
          'width': state.width,
          'height': state.height,
          show: true, 
          webPreferences: {
            sandbox : false,
            contextIsolation: false,  
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            preload: './preload/preload.js'
          }
        });

        gChildAppConfig.loadFile('index/index_app_config.html')
        gChildAppConfig.once('ready-to-show', () => {
          gChildAppConfig.setTitle(title);
          gChildAppConfig.webContents.send('error_text', btC.TL.FOOTER.FTR_BUSY);
          getData(url,con);
        })
        gChildAppConfig.webContents.on('did-finish-load', () => {
          insertCssDark(gb.theme);
        })
        gChildAppConfig.on('close', () => {
          let bounds = gChildAppConfig.getBounds();
          windowsState.set("cc_config",bounds.x,bounds.y, bounds.width, bounds.height)
        })     
        gChildAppConfig.on('closed', () => {
          gChildAppConfig = null
        })          
      }
      else
      {
        gChildAppConfig.webContents.send('error_text', btC.TL.FOOTER.FTR_BUSY);    
        gChildAppConfig.webContents.send('xml_text', "");        
        gChildAppConfig.show();
        getData(url,con);   
      }      
  } catch (error) {
      logging.logError('AppConfig,AppConfigStart', error);        
  }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkAppConfig !== null)
    {
      gChildAppConfig.webContents.removeInsertedCSS(gCssDarkAppConfig) 
    }    
    gCssDarkAppConfig = await gChildAppConfig.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkAppConfig = null;
  }
}

function getData(url,con)
{
  try {
    gAppConfigCon = con;
    gAppConfigUrl = url;
    let tagAppBegin = "<get_app_config>";
    let tagAppEnd = "</get_app_config>";
    let tagUrlBegin = "<url>";
    let tagUrlEnd = "</url>";    
    let send = tagAppBegin+tagUrlBegin+url+tagUrlEnd+tagAppEnd;
    const sendArray = new SendArray();
    sendArray.send(con,send, dataReady);
  } catch (error) {
    logging.logError('AppConfig,getData', error);  
  }
}

function dataReady(data)
{
  try {
    gChildAppConfig.hide(); 
    let xml = this.client_completeData;
    let tagReplyBegin = "<boinc_gui_rpc_reply>";
    let tagReplyEnd = "</boinc_gui_rpc_reply>";    
    let index = xml.indexOf(tagReplyBegin);
    let bOK = false;
    if (index >= 0)
    {
      index = xml.indexOf(tagReplyBegin);
      if (index >= 0)
      {
        bOK = true;
      }
    }
    if (!bOK)
    {
      dialog.showMessageBox(gChildAppConfig,
        {
          title: btC.TL.BOX_CONFIG.BX_APP_CONFIG_TITLE,
          message: btC.TL.BOX_CONFIG.BX_APP_CONFIG_INVALID_TAG_MESSAGE,
          detail: btC.TL.BOX_CONFIG.BX_APP_CONFIG_INVALID_TAG_TITLE
        }) 
      logging.logDebug("AppConfig,dataReady, Invalid start/end tags in cc_config.xml");
      return;
    }

    tagErrorBegin = "<error>";
    tagErrorEnd = "</error>"; 
    let indexb = xml.indexOf(tagErrorBegin);
    let indexe = xml.indexOf(tagErrorEnd);    
    let error = "";
    if (indexb >= 0 && indexe >= 0)
    {
      error = "<FONT COLOR='#ff0000'>" + xml.substring(indexb+tagErrorBegin.length,indexe) + "</FONT>" ;
      xml = "";
    }
    xml = xml.replaceAll("\3","");  
    xml = xml.replaceAll(tagReplyBegin,""); 
    xml = xml.replaceAll(tagReplyEnd,"");     
    let title = "BoincTasks Js - " + btC.TL.DIALOG_EDIT_APP_CONFIG.DEA_TITLE + " " +  this.computerName + " - " + gAppConfigUrl;
    gChildAppConfig.setTitle(title);
    gChildAppConfig.webContents.send('error_text', error);    
    gChildAppConfig.webContents.send('xml_text', xml);
    gChildAppConfig.hide();      
    gChildAppConfig.show();   
  } catch (error) {
    logging.logError('AppConfig,dataReady', error);      
  }
}

function updateAppConfig(gb,xml)
{
  try {
    var parseString = require('xml2js').parseString;
    parseString(xml, function (err, result) {
    let len = xml.length;
    if (len < 3 || functions.isDefined(result))
    {
       // OK
      gChildAppConfig.close();
      let tagBegin = "<set_app_config >";
      let tagEnd = "</set_app_config >";  
      let tagUrlBegin = "<url>";
      let tagUrlEnd = "</url>";  
      let data = tagBegin + tagUrlBegin + gAppConfigUrl + tagUrlEnd + xml + tagEnd + "\3";
      const sendArray = new SendArray();      
      sendArray.send(gAppConfigCon,data, dataSendReady);
      return;
    }
    else
    {
      if (functions.isDefined(err))
      {
        error = err.message;
      }
      else 
      {
        error = "Something is wrong, empty string?";
      }    
      dialog.showMessageBox(gChildAppConfig,
      {
        title: btC.TL.BOX_CONFIG.BX_APP_CONFIG_TITLE,
        message: btC.TL.BOX_CONFIG.BX_APP_CONFIG_INVALID_TAG_MESSAGE,
        detail: error
      })
    }
    
    });
  } catch (error) {
    logging.logError('AppConfig,updateAppConfig', error);        
  }
}

function dataSendReady(even)
{
  let data = this.client_completeData;
  if (data.indexOf("success") < 0)
  {
      dialog.showMessageBox(gChildAppConfig,
      {
        title: btC.TL.BOX_CONFIG.BX_APP_CONFIG_TITLE,
        message: btC.TL.BOX_CONFIG.BX_APP_CONFIG_INVALID_TAG_MESSAGE,
        detail: data
      })
      logging.logErrorMsg("AppConfig,dataSendReady",data);
      return;        
  }
  else
  {
    // finally read the changed cc_config.xml & app_config.xml
    const sendArray = new SendArray();      
    let send = "<read_cc_config/>";
    sendArray.send(gAppConfigCon,send, dataReadConfigReady);
  }
}

function dataReadConfigReady(even)
{
  let data = this.client_completeData;
  if (data.indexOf("success") < 0)
  {
    let msg = this.computerName + ": " + data;
    dialog.showMessageBox(gChildAppConfig,
    {
        title: btC.TL.BOX_CONFIG.BX_APP_CONFIG_TITLE,
        message: btC.TL.BOX_CONFIG.BX_APP_CONFIG_INVALID_TAG_MESSAGE,
        detail: msg
    })
    logging.logErrorMsg("AppConfig,dataReadConfigReady",msg);
    return;
  }
  else
  {
    logging.logDebug("AppConfig, reading cc_config.xml and app_config.xml: success");
  }
}