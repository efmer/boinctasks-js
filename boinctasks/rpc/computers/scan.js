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
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();

const SendArray = require('../misc/send_array');
const sendArray = new SendArray();

//const find = require('local-devices');
const {BrowserWindow } = require('electron');
const { networkInterfaces } = require('os');

let gChildWindowScan = null;
let lScanLocalIp = null;
let lScanCount = 0;
let lScanFoundAll = [];
let lScanTimeout = false;
let lScanTimeoutCount = 15;
let lScanFinished  =false;
let lScanTimer = null;
let lScanBusy = false;

let lScanPassword = "";
let lScanPort = "";

let lScanCon = [];


class ScanComputers{

    showScan()
    {
        try {
            showComputerScan(); 
        } catch (error) {
            logging.logError('ScanComputers,showScan', error);            
        }
    }

    startScan(password, port)
    {
        try {
            lScanPassword = password;
            lScanPort = port;

            gChildWindowScan.webContents.send('computer_scan_explain', "");
            lScanFinished = false;
            if (lScanBusy)
            {
                if (lScanCount > 0) return;
            }
            lScanBusy = true;
            clearTimeout(lScanTimer);
            lScanTimeout = false;
            lScanFoundAll = [];
            lScanCount = 0;
            logging.logDebug("");      
            logging.logDebug("Scan computers: Begin");

            let txt  = "Please be patient this can take a while...<br><br>";
            gChildWindowScan.webContents.send('computer_scan_text', txt);    
            scanAll();
        } catch (error) {
            logging.logError('ScanComputers,startScan', error);     
        }
    }

    stopScan()
    {
        clearTimeout(lScanTimer);
        gChildWindowScan.close();
        logging.logDebug("Scan computers: End");
        logging.logDebug("");
        lScanBusy = false;
    }
}
module.exports = ScanComputers;

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
        let ix = lScanLocalIp[0].lastIndexOf(".");
        let ip = lScanLocalIp[0].substring(0,ix+1);

        lScanTimeoutCount = 15;
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
        checkComputer(ip+i, port, password, scanReady)
    }  
}

function scanReady(event)
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
                let hostInfo = getHostInfo(dataStr)
                let computerName = this.ip;
                let cpid = "";
                if (hostInfo !== null)
                {
                    computerName = hostInfo.domain_name;
                    cpid = hostInfo.host_cpid;
                }
                let ip = this.ip;
                for (let i=0;i<lScanLocalIp.length;i++)
                {
                    if (lScanLocalIp[i] == ip)
                    {
                        ip = "localhost";
                    }
                }
                logging.logDebug("Found: " + ip + " Name: " + computerName, " Cpid: " + cpid);
                let scanFound = Object();
                scanFound.ip = ip;
                scanFound.computerName = computerName;
                scanFound.cpid = cpid;
                scanFound.password = this.passWord;
                lScanFoundAll.push(scanFound);
                sendList();                
            }
        }

        try {
            this.destroy();        
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
        let txt = "Computers with BOINC:";
        txt += "<br><br>"
        txt += "<table>";
        let len = lScanFoundAll.length;
        for (let i=0; i<len; i++)
        {
            txt += "<tr>";
            let sf =  lScanFoundAll[i];
            txt+=  '<td><input type="checkbox" id="scan-check-' + i + '"><td>';
            txt+= "<td><b>Ip</b>: ";
            txt+= '<span id="scan-ip-' + i + '">' + sf.ip + '</span></td>';
            txt+= "<td><b>Name</b>: ";
            txt+= '<span id="scan-name-' + i + '">' + sf.computerName + '</span></td>';            
            txt+= "<td><b>Cpid</b>: ";
            txt+= '<span id="scan-cpid-' + i + '">' + sf.cpid + '</span></td>';
            txt+= "</tr>";
        }
        txt += "</table>";
        txt += '<br><button id="addSelectedButton">Add selected computers</button>';
        gChildWindowScan.webContents.send('computer_scan_text', txt);    
    } catch (error) {
        logging.logError('ScanComputers,foundList', error);         
    }     
}

function sendList()
{
    try {
        let txt = "Computers with BOINC:<br><br>";
        txt += "To scan: " + lScanCount + " , ready in: " + lScanTimeoutCount + " seconds";
        txt += "<br><br>";
        for (let i=0; i<lScanFoundAll.length; i++)
        {
            let sf =  lScanFoundAll[i];            
            txt+= "Ip: ";
            txt+= sf.ip;
            txt+= " Name: ";
            txt+= sf.computerName;
            txt+= " Cpid: ";
            txt+= sf.cpid;
            txt+= "<br>";
        }
        gChildWindowScan.webContents.send('computer_scan_text', txt);    
    } catch (error) {
        logging.logError('ScanComputers,sendList', error);         
    }    
}

function checkComputer(ip,port, password,callback)
{
    try {
        let con = new Object();
        con.ip = ip;
        con.computerName = "";        
        con.port =  port;
        con.passWord = password;
        let sendCon = sendArray.send(con,"<get_host_info/>\n", callback);
        lScanCon.push(sendCon);
    } catch (error) {
        logging.logError('ScanComputers,checkComputer', error);        
    }
}

function showComputerScan()
{
  var log = "";
  var title = "Computer Scan";

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
 //     childWindowScan.webContents.openDevTools() // debug only

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

function windowReady(title)
{
    gChildWindowScan.hide()    
    gChildWindowScan.show();  
    gChildWindowScan.webContents.send('computer_scan_text', ""); 
    gChildWindowScan.webContents.send('computer_scan_show');     

    let explain = "The password can be found in the BOINC data folder in a file called gui_rpc_auth.cfg.<br>";
    explain += "If you did't already, make sure BOINC connections are allowed by editing remote_host.cfg on the remote computer.<br><br>";
    explain += '<a href="https://efmer.com/boinctasks-js-find-computers/">I know manuals are boring, but click here read the BoincTasks manual before you proceed</a>.<br><br><br>';
    explain += "Fill in the password or leave it empty (you don't get a computer name if you leave it empty)<br>";
    explain += "You may leave the port empty for the default 31416.<br>";

    gChildWindowScan.webContents.send('computer_scan_explain', explain);     
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
        logging.logError('ScanComputers,parseProjects', getCpid);         
    }
    return hostReturn
}