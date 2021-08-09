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

const ReadWrite  = require('../functions/readwrite');
const readWrite = new ReadWrite();

const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();

const {BrowserWindow } = require('electron');

let gChildWindowPing = null;
let gCssDarkPing = null;
let gClassSendArray = null;
let gTimer = null;
let gCon = null;
let gStatus = "";

class Ping{
    showPing(theme)
    {
        try {
            showPing(theme); 
        } catch (error) {
            logging.logError('Ping,showPing', error);            
        }
    }
    start(data)
    {
        start(data);
    }
}
module.exports = Ping;

function start(data)
{
    try {
        gStatus = "";
        json = JSON.stringify(data);
        readWrite.write("settings", "ping.json",json);
        if (gClassSendArray === null)
        {
            const sendArray = require('../misc/send_array');    
            gClassSendArray = new sendArray();     
        }
        updateStatus("Get state");
        let send = "<get_state/>\n";
        let con = new Object();
        con.ip = data.ip;
        con.computerName = data.ip;        
        con.port = data.port;
        con.passWord = data.password;
        gCon = gClassSendArray.send(con,send, stateReady);
        startTimeout();
    } catch (error) {
        logging.logError('Ping,start', error);         
    }
}

function stateReady(data)
{
    try {
        stopTimeout();
        let con = this;
        if (con.auth) updateStatus("State read Authenticated");
        let data  = con.client_completeData;
        updateStatus('<textarea rows="16">' + data + '</textarea>');
        updateStatus("Get projects");
        let send = "<get_project_status/>";
        gCon = gClassSendArray.send(con,send, projectsReady);
        startTimeout()
    } catch (error) {
        logging.logError('Ping,startReady', error);         
    }
}

function projectsReady(data)
{
    try {
        stopTimeout();
        updateStatus("Projects read");
        let con = this;
        let data  = con.client_completeData;
        updateStatus('<textarea rows="16">' + data + '</textarea>');
        updateStatus("Get results");        
        let send = "<get_results/>\n";        
        gCon = gClassSendArray.send(con,send, resultsReady);
    } catch (error) {
        logging.logError('Ping,projectsReady', error);         
    }
}

function resultsReady(data)
{
    try {
        stopTimeout();
        updateStatus("Results read");
        let con = this;
        let data  = con.client_completeData;
        updateStatus('<textarea rows="16">' + data + '</textarea>');
        updateStatus("Get transfers");        
        let send = "<get_file_transfers/>n";
        gCon = gClassSendArray.send(con,send, transfersReady);        
    } catch (error) {
        logging.logError('Ping,stateRresultsReadyeady', error);         
    }
}

function transfersReady(data)
{
    try {
        stopTimeout();
        updateStatus("Transfers read");
        let con = this;
        let data  = con.client_completeData;
        updateStatus('<textarea rows="16">' + data + '</textarea>');
        updateStatus("Get messages");        
        let send = "<get_messages/>\n";
        gCon = gClassSendArray.send(con,send, messagesReady);
    } catch (error) {
        logging.logError('Ping,transfersReady', error);         
    }
}

function messagesReady(data)
{
    try {
        stopTimeout();
        updateStatus("Messages read");
        let con = this;
        let data  = con.client_completeData;
        updateStatus('<textarea rows="16">' + data + '</textarea>');
        updateStatus("Get notices");        
        let send = "<get_notices>\n</get_notices>";
        gCon = gClassSendArray.send(con,send, noticesReady);
    } catch (error) {
        logging.logError('Ping,messagesReady', error);         
    }
}

function noticesReady(data)
{
    try {
        stopTimeout();
        updateStatus("Notices read");
        let con = this;
        let data  = con.client_completeData;
        updateStatus('<textarea rows="16">' + data + '</textarea>');
        gChildWindowPing.webContents.send('ping_end', "");
    } catch (error) {
        logging.logError('Ping,noticesReady', error);         
    }
}

function startTimeout()
{
    gTimer = setInterval(timeout, 5000);    // 5 seconds
}

function stopTimeout()
{
    clearTimeout(gTimer);
}

function timeout()
{
    stopTimeout();
    updateStatus("Timeout");
    let con = gCon;
    if (con.auth === void 0)
    {
        updateStatus("Not Authenticated");
    }
    gChildWindowPing.webContents.send('ping_end', "");
}

function updateStatus(txt)
{
    gStatus += txt;
    gStatus += "<br>";
    gChildWindowPing.webContents.send('status', gStatus);     
}

function showPing(theme)
{
  var title = "BoincTasks Js - Ping";

  if (gChildWindowPing == null)
  {
    let state = windowsState.get("ping",800,800)

    gChildWindowPing = new BrowserWindow({
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

    gChildWindowPing.loadFile('index/index_ping.html')
    gChildWindowPing.once('ready-to-show', () => {    
        gChildWindowPing.setTitle(title);
        let data = JSON.parse(readWrite.read("settings", "ping.json"));     
        gChildWindowPing.webContents.send('init', data); 
 //     childWindowScan.webContents.openDevTools() // debug only

    }) 
    gChildWindowPing.webContents.on('did-finish-load', () => {
        insertCssDark(theme);
      })  
      gChildWindowPing.on('close', () => {
        let bounds = gChildWindowPing.getBounds();
        windowsState.set("ping",bounds.x,bounds.y, bounds.width, bounds.height)
      })     
      gChildWindowPing.on('closed', () => {
        gChildWindowPing = null
      })  
  }
  else
  {
    windowReady(title);  
    gChildWindowPing.hide();    
    gChildWindowPing.show();
  }
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkPing !== null)
    {
        gChildWindowScan.webContents.removeInsertedCSS(gCssDarkPing) 
    }    
    gCssDarkPing = await gChildWindowScan.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkPing = null;
  }
}