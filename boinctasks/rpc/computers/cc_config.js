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

let gChildCcConfig = null;
let gCssDarkCcConfig = null;
let gCcConfigCon = null;

class CcConfig{
  ccConfigRead(selected,gb)
  {
    gCcConfigCon = null;    
    sendGetCcConfig(selected,gb)
  }
  update(gb,xml)
  {
    updateCcConfig(gb,xml);
  }

  setTheme(css)
  {
    insertCssDark(css);
  }    
}
module.exports = CcConfig;

function sendGetCcConfig(gb,selected)
{
  try {
    let res = selected[0].split(btC.SEPERATOR_SELECT);
    let ip = res[0];

    let con = null;
    let len = gb.connections.length;
    for (let i=0; i<len;i++ )
    {
      if (gb.connections[i].ip.toLowerCase() === ip)
      {
        con = gb.connections[i];
        break;
      }
    }
    if (con === null) return;

    ccConfigStart(gb,con);
  } catch (error) {
    logging.logError('CcConfig, sendGetCcConfig', error);     
  }
}

function ccConfigStart(gb,con)
{
  try {
    let title = "BoincTasks Js = " + btC.TL.DIALOG_BOINC_SETTINGS.DBO_TITLE;

    let state = windowsState.get("cc_config",700,800)

    if (gChildCcConfig === null)
    {
      gChildCcConfig = new BrowserWindow({
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

      gChildCcConfig.loadFile('index/index_cc_config.html')
      gChildCcConfig.once('ready-to-show', () => {
        gChildCcConfig.setTitle(title);
        gChildCcConfig.webContents.send('error_text', btC.TL.FOOTER.FTR_BUSY);         
        getData(con);
      })
      gChildCcConfig.webContents.on('did-finish-load', () => {
        insertCssDark(gb.theme);
      })
      gChildCcConfig.on('close', () => {
        let bounds = gChildCcConfig.getBounds();
        windowsState.set("cc_config",bounds.x,bounds.y, bounds.width, bounds.height)
      })     
      gChildCcConfig.on('closed', () => {
        gChildCcConfig = null;
      })          
    }
    else
    {
      gChildCcConfig.webContents.send('error_text', btC.TL.FOOTER.FTR_BUSY);       
      gChildCcConfig.webContents.send('xml_text', "");
      gChildCcConfig.show();
      getData(con);      
    }
  } catch (error) {
      logging.logError('CcConfig,ccConfigStart', error);        
  }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkCcConfig !== null)
    {
      gChildCcConfig.webContents.removeInsertedCSS(gCssDarkCcConfig) 
    }    
    gCssDarkCcConfig = await gChildCcConfig.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkCcConfig = null;
  }
}

function getData(con)
{
  try {
    gCcConfigCon = con;
    let send = "<get_cc_config/>";
    const sendArray = new SendArray();
    sendArray.send(con,send, dataReady);
  } catch (error) {
    logging.logError('CcConfig,getData', error);  
  }
}

function dataReady(data)
{
  try {
    gChildCcConfig.hide();    
    let xml = this.client_completeData;
    let tagBegin = "<boinc_gui_rpc_reply>";
    let tagEnd = "</boinc_gui_rpc_reply>";    
    let index = xml.indexOf(tagBegin);
    let bOK = false;
    if (index >= 0)
    {
      index = xml.indexOf(tagEnd);
      if (index >= 0)
      {
        bOK = true;
      }
    }
    if (!bOK)
    {
      dialog.showMessageBox(gChildCcConfig,
        {
          title: btC.TL.BOX_CONFIG.BX_CC_CONFIG_TITLE,
          message: btC.TL.BOX_CONFIG.BX_CC_CONFIG_INVALID_TAG_MESSAGE,
          detail: btC.TL.BOX_CONFIG.BX_CC_CONFIG_INVALID_TAG_TITLE
        }) 
      logging.logDebug("CcConfig,dataReady, Invalid start/end tags in cc_config.xml");
      return;
    }
    xml = xml.replaceAll("\3","");  
    xml = xml.replaceAll(tagBegin,""); 
    xml = xml.replaceAll(tagEnd,"");     
    let title = "BoincTasks Js - " + btC.TL.DIALOG_EDIT_CC_CONFIG.DEC_TITLE + " " +  this.computerName
    gChildCcConfig.setTitle(title);
    gChildCcConfig.webContents.send('error_text', "");   
    gChildCcConfig.webContents.send('xml_text', xml);
    gChildCcConfig.show();   
  } catch (error) {
    logging.logError('CcConfig,dataReady', error);      
  }
}

function updateCcConfig(gb,xml)
{
  try {
    var parseString = require('xml2js').parseString;
    parseString(xml, function (err, result) {
    if (functions.isDefined(result))
    {
       // OK
      gChildCcConfig.close();
      let tagBegin = "<set_cc_config>";
      let tagEnd = "</set_cc_config>";  
      let data = tagBegin + xml + tagEnd + "\3";
      const sendArray = new SendArray();      
      sendArray.send(gCcConfigCon,data, dataSendReady);
      return;
    }
    else
    {
      dialog.showMessageBox(gChildCcConfig,
        {
          title: btC.TL.BOX_CONFIG.BX_CC_CONFIG_TITLE,
          message: btC.TL.BOX_CONFIG.BX_CC_CONFIG_INVALID_TAG_MESSAGE,
          detail: err.message
        })       
    }
    
    });
  } catch (error) {
    logging.logError('CcConfig,updateCcConfig', error);        
  }
}

function dataSendReady(even)
{
  let data = this.client_completeData;
  if (data.indexOf("success") < 0)
  {
    let msg = this.computerName + ": " + data;
    logging.logErrorMsg("CcConfig,dataSendReady",msg);
    return;
  }
    // finally read the changed cc_config.xml & app_config.xml
  const sendArray = new SendArray();      
  let send = "<read_cc_config/>";
  sendArray.send(gCcConfigCon,send, dataReadConfigReady);
}

function dataReadConfigReady(even)
{
  let data = this.client_completeData;
  if (data.indexOf("success") < 0)
  {
    let msg = this.computerName + ": " + data;
    dialog.showMessageBox(gChildCcConfig,
    {
        title: btC.TL.BOX_CONFIG.BX_CC_CONFIG_TITLE,
        message: btC.TL.BOX_CONFIG.BX_CC_CONFIG_INVALID_TAG_MESSAGE,
        detail: msg
    })
    logging.logErrorMsg("CcConfig,dataReadConfigReady",msg);
    return;
  }
  else
  {
    logging.logDebug("CcConfig, reading cc_config.xml: success");
  }
}