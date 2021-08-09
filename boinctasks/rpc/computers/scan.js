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

var net = require("net");
const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const Authenticate = require('../misc/authenticate');
const athenticate = new Authenticate();
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();

const {BrowserWindow } = require('electron');
const { networkInterfaces } = require('os');
const btC = require("../functions/btconstants");

let SCAN_TIMEOUT = 15;
let NO_PASSWORD = btC.TL.DIALOG_COMPUTER_SCAN.DSC_NO_PASSWORD;

let gChildWindowScan = null;
let gCssDarkScan = null;

let lScanLocalIp = null;
let lScanCount = 0;
let lScanFoundAllIp = [];
let lScanFoundAllInfo = [];
let lScanTimeout = false;
let lScanTimeoutCount = SCAN_TIMEOUT;
let lScanFinished  =false;
let lScanTimer = null;
let lScanBusy = false;

let lScanPassword = "";
let lScanPort = "";

let lScanCon = [];

let lbScanPhase2 = false;

class ScanComputers{

    showScan(theme)
    {
        try {
            showComputerScan(theme); 
        } catch (error) {
            logging.logError('ScanComputers,showScan', error);            
        }
    }

    startScan(password, port)
    {
        try {
            lScanPassword = password;
            lScanPort = port;

            gChildWindowScan.webContents.send('trans_scan_explain', "");
            lScanFinished = false;
            if (lScanBusy)
            {
                if (lScanCount > 0) return;
            }
            lbScanPhase2 = false;
            lScanFoundAllIp = [];
            lScanFoundAllInfo = [];
            logging.logDebug("");      
            logging.logDebug("Scan computers: Begin");

            gChildWindowScan.webContents.send('computer_scan_text', "");    
            scanAll();
        } catch (error) {
            logging.logError('ScanComputers,startScan', error);     
        }
    }

    stopScan()
    {
        clearTimeout(lScanTimer);
        gChildWindowScan.close();
        lScanBusy = false;
    }

    setTheme(theme)
    {
        insertCssDark(theme);
    }
}
module.exports = ScanComputers;

class BtSocketScan{
    socket(con)
    {
    try {
        this.connected = false;
        var ip = con.ip;
        var port = con.port;

        con.auth = false;
        con.client_completeData = "";
        con.client_socket = new net.Socket();
        con.client_socket.connect(port, ip);
        con.client_socket.on('connect',function(){
            let scanObj = Object();
            let ip = con.ip;
            scanObj.ip = ip;
            scanObj.computerName = ip;
            scanObj.cpid = NO_PASSWORD;
            scanObj.password = "";
            scanObj.con = con;
            scanFound(scanObj);
        });

        con.client_socket.on('data', function(data) {
            let dataStr = data.toString(); 
            con.client_completeData += dataStr; 
            if (dataStr.indexOf('\u0003') >= 0 )
            {
                if (con.client_completeData.indexOf('<unauthorized') >=0)
                {
                    con.auth = false;
                }
                else {
                    let cb = con.client_callbackI;
                    if (cb !== null) con.client_callbackI('data');                    
                }             

            }
        })
        con.client_socket.on('close', function() {
            var ii = 1;                 
        });        
        con.client_socket.on('error', (err) => {
//            con.client_compleData = "";         
//            con.mode = 'error';
//            con.client_socket.end();                 
//            con.client_socket.destroy();  
        });        
    } catch (error) {
            logging.logError('BtSocket,client', error);
            con.socket_compleData = "";
            con.auth = false;
            con.mode = 'error';
            con.client_socket.end();                 
            con.client_socket.destroy();  
            lostConnection(con,"error2")
        }  
    }
}

function localIp()
{
    const nets = networkInterfaces();
    const ipArray = [];

    for (const name of Object.keys(nets)) 
    {
        for (const net of nets[name]) 
        {
            if (net.family === 'IPv4' && !net.internal) {
                ipArray.push(net.address);
            }
        }
    }
    return ipArray;
}

function scanAll()
{
    try {
        lScanBusy = true;
        lScanCount = 0;
        lScanTimeoutCount = SCAN_TIMEOUT;
        clearTimeout(lScanTimer);
        lScanTimeout = false;

        if (!lbScanPhase2)
        {
            if (lScanLocalIp === null)
            {
                lScanLocalIp = localIp();
                if (lScanLocalIp.length <= 0)
                {          
                    logging.logDebug("No local IP address found");  
                    return;
                }
            }
            logging.logDebug("Local Ip: " + lScanLocalIp[0]); 
        }
        let ix = lScanLocalIp[0].lastIndexOf(".");
        let ip = lScanLocalIp[0].substring(0,ix+1);

        lScanTimer = setTimeout(function(){ scanTimeout() }, 1000);

        let port = lScanPort;
        if (port.length < 2) port = 31416;

        scan(ip, port, lScanPassword)    
    } catch (error) {
        logging.logError('ScanComputers,sendList', error);         
    }    
}

function scan(ip,port,password)
{
    lScanCon = [];
    for(let i=1; i <=255; i++){
        lScanCount++; 
        checkComputer(ip+i, port, lbScanPhase2, password, scanReady)
    }  
}

function scanReady(type)
{
    try {
        if (lScanTimeout) return;
        if (functions.isDefined(this.client_completeData))
        {         
            let data = this.client_completeData;
            let dataStr = data.toString();
            if (dataStr.indexOf('boinc_gui_rpc_reply') >=0)
            {
                // BOINC found     
                this.auth = true;        
                let hostInfo = getHostInfo(dataStr)
                let computerName = this.ip;
                let cpid = "";
                if (hostInfo !== null)
                {
                    computerName = hostInfo.domain_name;
                    cpid = hostInfo.host_cpid;
                }
                let ip = this.ip;
                let scanObj = Object();
                scanObj.ip = ip;
                scanObj.computerName = computerName;
                scanObj.cpid = cpid;
                scanObj.password = this.passWord;
                scanFound(scanObj);              
            }
        }

        try {
            con.destroy();        
        } catch (error) {
            
        }

        lScanCount--;    
        if (lScanCount <= 0) 
        {
            scanFinished();
        } 

    } catch (error) {
        logging.logError('ScanComputers,scanReady', error);     
    }
}

function scanTimeout()
{
    lScanTimeoutCount--;
    if (lScanTimeoutCount > 0)
    {
        lScanTimer = setTimeout(function(){ scanTimeout() }, 1000);
        sendList();
        return;
    }

    lScanTimeout = true;
    scanFinished();
}

function scanFinished()
{
    try {
        if (!lbScanPhase2)
        {
            if (lScanPassword.length > 0)
            {
                lbScanPhase2 = true;
                scanAll()
                return;
            }
        }

        for (let i=0; i< lScanCon.length; i++)
        {
            try {
                lScanCon[i].client_socket.destroy();                  
            } catch (error) {
              let ii = 1;
            }
        }
        lScanCon = [];
    } catch (error) {
        let jj = 1;
    }

    if (lScanFinished) 
    {
        clearTimeout(lScanTimer);
        return;
    }
    lScanFinished = true;
    clearTimeout(lScanTimer);
    foundList();
    lScanBusy = false;
}

function foundList()
{
    try {
        let txt = btC.TL.DIALOG_COMPUTER_SCAN.DCS_WITH_BOINC;
        txt += "<br><br>"
        txt += "<table>";
        let len = lScanFoundAllInfo.length;
        for (let i=0; i<len; i++)
        {
            let sf =  lScanFoundAllInfo[i];            
            let ip = sf.ip;
            let cpid = sf.cpid;
            let computerName = sf.computerName;
            for (let i=0;i<lScanLocalIp.length;i++)
            {
                if (lScanLocalIp[i] == ip) ip = "localhost";
                if (lScanLocalIp[i] == computerName) computerName = "localhost";
            }
            if (cpid === NO_PASSWORD)
            {
                logging.logDebug("Found: " + ip + " Name: " + computerName + " , NOT athenticated");
            }
            else
            {
                logging.logDebug("Found: " + ip + " Name: " + computerName + " Cpid: " + cpid  + " , OK");
            }

            txt += "<tr>";
            txt+=  '<td><input type="checkbox" id="scan-check-' + i + '"><td>';
            txt+= "<td><b>" + btC.TL.DIALOG_COMPUTER_SCAN.DCS_IP + "</b>: ";
            txt+= '<span id="scan-ip-' + i + '">' + ip + '</span></td>';
            txt+= "<td><b>" + btC.TL.DIALOG_COMPUTER_SCAN.DCS_NAME + "</b>: ";
            txt+= '<span id="scan-name-' + i + '">' + computerName + '</span></td>';            
            txt+= "<td><b>" + btC.TL.DIALOG_COMPUTER_SCAN.DCS_CPID + "</b>: ";
            txt+= '<span id="scan-cpid-' + i + '">' + cpid + '</span></td>';
            txt+= "</tr>";
        }
        txt += "</table>";
        txt += '<br><button id="addSelectedButton">' + btC.TL.DIALOG_COMPUTER_SCAN.DCS_ADD_SELECTED + '</button>';
        txt += "<br><br>";
        txt += btC.TL.DIALOG_COMPUTER_SCAN.DSC_EXPLAIN_FINISH + " " + NO_PASSWORD + " , " + btC.TL.DIALOG_COMPUTER_SCAN.DSC_EXPLAIN_FINISH2;
        gChildWindowScan.webContents.send('computer_scan_text', txt); 

        logging.logDebug("Scan computers: End");
        logging.logDebug("");
    } catch (error) {
        logging.logError('ScanComputers,foundList', error);         
    }     
}

function sendList()
{
    try {
        let txt = btC.TL.DIALOG_COMPUTER_SCAN.DCS_WITH_BOINC;
        txt += "<br><br>";

        let readyTime = lScanTimeoutCount;        
        let phase = "";
        if (lbScanPhase2) phase = btC.TL.DIALOG_COMPUTER_SCAN.DSC_NOW_PASSWORD;
        if (!lbScanPhase2 && lScanPassword.length !== 0)
        {
            readyTime += SCAN_TIMEOUT;
        }

        txt += btC.TL.DIALOG_COMPUTER_SCAN.TO_SCAN + " " +  lScanCount + " " + btC.TL.DIALOG_COMPUTER_SCAN.DCS_READY_IN + " " + readyTime + " " + btC.TL.DIALOG_COMPUTER_SCAN.DCS_SECONDS  + " " + phase;
        txt += "<br><br>";
        txt += "<table>";
        for (let i=0; i<lScanFoundAllInfo.length; i++)
        {
            txt += "<tr>";            
            let sf =  lScanFoundAllInfo[i];
            txt+= "<td>" + btC.TL.DIALOG_COMPUTER_SCAN.DCS_IP + ": ";
            txt+= sf.ip;
            txt+= "</td><td>" + btC.TL.DIALOG_COMPUTER_SCAN.DCS_NAME + ": ";
            txt+= sf.computerName;
            txt+= "</td><td>" + btC.TL.DIALOG_COMPUTER_SCAN.DCS_CPID + ": ";
            txt+= sf.cpid;
            txt += "</td></tr>";
        }
        gChildWindowScan.webContents.send('computer_scan_text', txt);    
    } catch (error) {
        logging.logError('ScanComputers,sendList', error);         
    }    
}

function checkComputer(ip,port, bAuth, password,callback)
{
    try {
        let con = new Object();
        con.ip = ip;
        con.computerName = "";        
        con.port =  port;
        con.passWord = password;

        if (bAuth)
        { 
            let pos = lScanFoundAllIp.indexOf(ip);
            if (pos >= 0)
            {
                let scanObj = lScanFoundAllInfo[pos];
                if (scanObj.cpid === NO_PASSWORD)
                {
                    let con = scanObj.con;
                    con.client_callback = scanReadyAuthorized;
                    athenticate.authorize(con); 
                }
            }
        }
        else
        {
            send(con,"<get_host_info/>\n", callback);
        }
    } catch (error) {
        logging.logError('ScanComputers,checkComputer', error);        
    }
}

function scanReadyAuthorized(event)
{
    try {
        if (lScanTimeout) return;
        this.client_completeData = "";        
        this.client_callbackI = scanReady;
        functions.sendRequest(this.client_socket, "<get_host_info/>\n");          
    } catch (error) {
        logging.logError('ScanComputers,scanReadyAuthorized', error);       
    }
}

function send(con,send,callback) 
{
    try {       
        con.sendArraytoSend = send;
        con.client_completeData = "";
        con.client_socket = new BtSocketScan();  
        con.client_socket.socket(con);
        con.client_callbackI = callback;
        functions.sendRequest(con.client_socket, con.sendArraytoSend);          
    } catch (error) {
        logging.logError('ScanComputers,send', error);  
    }
}   

function scanFound(scanObj)
{
    try {
        let pos = lScanFoundAllIp.indexOf(scanObj.ip);
        if (pos < 0)
        {
            lScanFoundAllIp.push(scanObj.ip);
            lScanFoundAllInfo.push(scanObj);
        }
        else
        {
            item = lScanFoundAllInfo[pos];
            item.computerName = scanObj.computerName;
            item.cpid = scanObj.cpid;
            item.password = scanObj.passWord;
        }
        sendList();        
    } catch (error) {
      logging.logError('ScanComputers,scanFound', error); 
    }
}

function showComputerScan(theme)
{
  var log = "";
  var title = "BoincTasks Js - " + btC.TL.DIALOG_COMPUTER_SCAN.DCS_TITLE;

  if (gChildWindowScan == null)
  {
    let state = windowsState.get("scan_computers",1000,800)

    gChildWindowScan = new BrowserWindow({
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

    gChildWindowScan.loadFile('index/index_scan.html')
    gChildWindowScan.once('ready-to-show', () => {    
        windowReady(title);
        gChildWindowScan.webContents.send("translations",btC.TL.DIALOG_COMPUTER_SCAN);         
 //     childWindowScan.webContents.openDevTools() // debug only

    }) 
    gChildWindowScan.webContents.on('did-finish-load', () => {
        insertCssDark(theme);
      })  
    gChildWindowScan.on('close', () => {
        let bounds = gChildWindowScan.getBounds();
        windowsState.set("scan_computers",bounds.x,bounds.y, bounds.width, bounds.height)
      })     
      gChildWindowScan.on('closed', () => {
        gChildWindowScan = null
      })  
  }
  else
  {
    windowReady(title);  
    gChildWindowScan.hide();    
    gChildWindowScan.show();
  }
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkScan !== null)
    {
        gChildWindowScan.webContents.removeInsertedCSS(gCssDarkScan) 
    }    
    gCssDarkScan = await gChildWindowScan.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkScan = null;
  }
}

function windowReady(title)
{
    gChildWindowScan.hide()    
    gChildWindowScan.show();  
    gChildWindowScan.webContents.send('computer_scan_text', ""); 
    gChildWindowScan.webContents.send('computer_scan_show');
    gChildWindowScan.webContents.send('trans_scan_explain', btC.TL.DIALOG_COMPUTER_SCAN.DCS_EXPLAIN);     
    gChildWindowScan.setTitle(title);
}

function getHostInfo(xml)
{
    let hostReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, host) {
            if (functions.isDefined(host))
            {
                var hostArray = host['boinc_gui_rpc_reply']['host_info'];
                if (functions.isDefined(hostArray))
                {
                    hostReturn = hostArray[0];
                    return hostReturn;
                }
            }
        });
    } catch (error) {
        logging.logError('ScanComputers,parseProjects', getHostInfo);         
    }
    return hostReturn
}