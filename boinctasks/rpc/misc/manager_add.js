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
const BtSocket  = require('./socket'); 
const Authenticate = require('./authenticate');
const athenticate = new Authenticate();

const { BrowserWindow } = require('electron');
const btC = require('../functions/btconstants');

let gTimer = null;

let gConnections = null;
let gConList = [];
let gConListInfo = [];
let gManagerInfoFound = false;
let gMsgTotal = "";
let gSync = false;

let gChildAddManager = null;
let gCssDarkManager = null;

class ManagerAdd
{
    addManager(gb)
    {
        addManager(gb.theme);
    }
    process(gb,event,data)
    {
        try {

            switch(event)
            {
                case 'ready':
                    start(gb.connections)
                    gConnections = gb.connections;
                    info()
                break;
                case 'sync':
                    gSync = true;
                    addManagerOk(data);                
                break;
                case 'ok':
                    gSync = false;
                    addManagerOk(data);
                break;
            }

           
        } catch (error) {
            logging.logError('AddManager,process', error);             
        }        
    }
    
    setTheme(theme)
    {
        insertCssDark(theme);
    }
}

module.exports = ManagerAdd;


function start(connections)
{
    try {
        let computerList = "";
        let conLocalHost = null
        let conFound = null
        for (let i=0;i<connections.length;i++)
        {
            let con = connections[i];
            if (!con.auth)
            {
                continue;
            } 
            if (conFound === null) conFound = con;
            if (con.ip.toLowerCase() == "localhost")
            {
                conLocalHost = con;
            }
            computerList += '<option value ="' + con.computerName + '">'+ con.computerName + '</option>';
        }

        if (conLocalHost === null)
        {
            if (conFound === null)
            {
                return;
            }
            conLocalHost = conFound;
        }
        getManagerList(conLocalHost, computerList);        
    } catch (error) {
        logging.logError('AddManager,start', error);   
    }
}

function addManagerOk(item)
{
    try {
        gMsgTotal = "";        
        if (item.sel.length == 0)
        {
            sendError(btC.TL.DIALOG_ADD_MANAGER.DAM_ERROR_SELECT_COMPUTER);
            gChildAddManager.webContents.send('add_manager_enable');
            stopTimer();
            return;
        }
        startTimer();
        addManagers(item);
    } catch (error) {
        logging.logError('AddManager,addManagerOk', error);           
    }
}

function addManagers(item)
{
    try {
        gMsgTotal = "";
        gConList = [];
        stopTimer();
        let sel = item.sel;
        if (sel.length == 0)
        {
            if (gChildAddManager !== null) gChildAddManager.webContents.send('add_manager_enable');
            stopTimer();
            return;
        }
        startTimer();
        for (let c=0; c < connections.length; c++)
        {            
            let con = connections[c];            
            for (let s=0;s<sel.length;s++)
            {
                if (con.computerName === sel[s])
                {
                    let obj = new Object()
                    obj.con = con;
                    obj.loginName = item.loginName;
                    obj.passWord = item.passWord;
                    obj.url = item.url;
                    gConList.push(obj);
                }
            }
        }
        fetchNext();
    } catch (error) {
        logging.logError('AddManager,addManagers', error);          
    }    
}

function fetchNext()
{
    if (gConList.length > 0)
    {
        let item = gConList[0];
        let con = item.con;
        let msg;
        if (gSync)
        {
            msg = btC.TL.DIALOG_ADD_MANAGER.DAM_STATUS_SYNCHRONIZE + " " + con.computerName;
        }
        else
        {
            if (item.url.length === 0) msg = btC.TL.DIALOG_ADD_MANAGER.DAM_STATUS_DETACHING + " " + con.computerName;
            else msg = btC.TL.DIALOG_ADD_MANAGER.DAM_STATUS_ADDING + " " + con.computerName;
        }
        sendMsg(msg);
        logging.logDebug(msg);        
        addManagerComputer(item);
        gConList.shift();
        return;
    }
    info();
    if (gChildAddManager !== null) gChildAddManager.webContents.send('add_manager_enable');
    stopTimer();
}

function addManagerComputer(item)
{
    let conIn = item.con;
    let con = new Object();
    con.computerName = conIn.computerName;
    con.ip = conIn.ip;
    con.port = conIn.port;
    con.passWord = conIn.passWord;
    const btSocket = new BtSocket();        
    con.clientClass = btSocket;
    con.clientClass.socket(con);
    con.client_callback = authenticatedAdd;
    con.item = item;
    athenticate.authorize(con);
}

function authenticatedAdd(event)
{
    try {
        let item = this.item;
        attachManager(this,item.url, item.loginName, item.passWord);   
    } catch (error) {
        logging.logError('AddManager,authenticatedAdd', error);      
    }
}

function attachManager(con,url,login,password)
{
    try { 
        let toSend;
        if (gSync)  toSend = "<acct_mgr_rpc>\n<use_config_file/>\n</acct_mgr_rpc>\n";
        else        toSend = "<acct_mgr_rpc>\n<url>" + url + "</url>\n<name>" + login + "</name>\n<password>" + password + "</password>\n</acct_mgr_rpc>\n";
        logging.logDebug("attachManager: [" + con.ip + "] url " + url);         
        con.client_completeData = "";
        con.client_callbackI = attachManagerReady;
        functions.sendRequest(con.client_socket, toSend);    
    } catch (error) {
        logging.logError('AddManager,attachManager', error);         
    }        
}

function attachManagerReady(event)
{
    try {
        switch(event)
        {
            case "data":        
                let reply = parseManagerRpc(this.client_completeData);                
                if (functions.isDefined(reply.error))
                {                       
                    logging.logDebug("attachManagerReady: error " + reply.error); 
                    sendError(reply.error); 
                    fetchNext();
                    return;
                }
                if (functions.isDefined(reply.success))
                {                 
                    logging.logDebug("attachManager: success");                     
                    this.client_completeData = "";
                    this.client_callbackI = attachManagerPoll;
                    functions.sendRequest(this.client_socket, "<acct_mgr_rpc_poll/>\n"); 
                }
                else
                {
                    logging.logDebug("lookup_account: failed");
                }
            break;        
        }
    } catch (error) {
        logging.logError('AddManager,attachManagerReady', error);
    }         
}

function parseManagerRpc(xml)
{    
    reply = null;  
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            reply = result['boinc_gui_rpc_reply'];
            return reply;
        });      
    } catch (error) {
        logging.logError('AddManager,parseManagerRpc', error);        
    }

    return reply;
}

function attachManagerPoll(event)
{
    try {
        switch(event)
        {
            case "data":        
                const item = parsePoll(this.client_completeData);

                if (item.error != '')
                {
                    let error = item.error;
                    if (error == -204) // not ready
                    {
                        let con = this;
                        setTimeout(function(){
                            con.client_completeData = "";   // nor ready retry
                            con.client_callbackI = attachManagerPoll;
                            functions.sendRequest(con.client_socket, "<acct_mgr_rpc_poll/>\n");
                            }, 500);    // 0.5 sec
                        return;
                    }
                    if (error != 0) // OK
                    {                        
                        logging.logDebug("attachManagerPoll: error: " + error + " " + item.errorText);             
                        intError(error);
                    }
                    else
                    {
                        logging.logDebug("attachManagerPoll: Ready");
                        sendMsg(btC.TL.DIALOG_ADD_MANAGER.DAM_STATUS_READY);
                    }
                    fetchNext();
                }
            break;     
        }
    } catch (error) {
        logging.logError('AddManager,attachManagerPoll', error);
    }         
}

function parsePoll(xml)
{
    let item = new Object();
    item.error = "";
    item.errorText = "";    
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            let accountReply = result['boinc_gui_rpc_reply']['acct_mgr_rpc_reply'];
            if (functions.isDefined(accountReply))
            {
                if (functions.isDefined(accountReply[0].error_num)) 
                {              
                    item.error = accountReply[0].error_num.toString();
                }          
            }
            else 
            {
                let replyError = result['boinc_gui_rpc_reply']['error'];
                if (functions.isDefined(replyError))
                {
                    item.error = replyError[0].error_num;
                    item.errorText = replyError[0].error_msg;
                }
                else item.error = "Unknown";
            }
        });
    } catch (error) {
        logging.logError('AddManager,parseLookUp', error);  
    }   
    return item;   
}

function getManagerList(conIn,computerList)
{
    try {
        let manager = new Object();
        manager.account = [];
        manager.url = [];
    
        manager.account.push("BOINCstats BAM!");
        manager.url.push("http://bam.boincstats.com/");
        manager.account.push("GridRepublic");
        manager.url.push("http://www.gridrepublic.org/");
        manager.account.push("GRCPool");
        manager.url.push("https://grcpool.com");
        manager.account.push("Science United");
        manager.url.push("https://scienceunited.org/");
        manager.computerList = computerList;

        let managerlist = "";
        for (let i=0;i<manager.account.length;i++)
        {            
            managerlist += '<option value ="' + i + '">'+ manager.account[i] + '</option>';
        }
        manager.managerlist = managerlist;
        gChildAddManager.webContents.send('add_manager_init', computerList, managerlist, manager);

    } catch (error) {
        logging.logError('AddManager,getManagerList', error);    
    }
}

function intError(error)
{
    switch (error)
    {        
        case -189:
            msg = btC.TL.DIALOG_ADD_MANAGER.DAM_ERROR_URL;
        break;       
        default: 
            msg = error;
    }
    sendError(msg);

}

function sendError(msg)
{
    let emsg = '<span style="color:#FF0000";>' + btC.TL.DIALOG_ADD_MANAGER.DAM_ERROR + " " + msg + '</span>';
    sendMsg(emsg);
}

function sendMsg(msg)
{
    gMsgTotal += msg + "<br>";
    gChildAddManager.webContents.send('add_manager_status', gMsgTotal); 
}

function startTimer()
{
    gTimer = setInterval(btTimer, 20000);    // 20 seconds.
}

function stopTimer()
{
    clearTimeout(gTimer);
}

function btTimer()
{
    if (gChildAddManager !== null) gChildAddManager.webContents.send('add_manager_enable');
    info();
    clearTimeout(gTimer);
}

function addManager(theme)
{
  let title = "BoincTasks Js - " + btC.TL.DIALOG_ADD_MANAGER.DAM_TITLE;
  if (gChildAddManager == null)
  {
    let state = windowsState.get("account_manager_add",700,800)

    gChildAddManager = new BrowserWindow({
      'x' : state.x,
      'y' : state.y,
      'width': state.width,
      'height': state.height,
      webPreferences: {
        sandbox : false,
        contextIsolation: false,  
        nodeIntegration: true,
        nodeIntegrationInWorker: true
 //     preload:'${__dirname}/preload/preload.js',
      }
    });
    gChildAddManager.loadFile('index/index_manager_add.html')
    gChildAddManager.once('ready-to-show', () => {  
        if (btC.DEBUG_WINDOW)
        {                    
            gChildAddManager.webContents.openDevTools();
        }           
        gChildAddManager.show();  
        gChildAddManager.setTitle(title);        
    }) 

    gChildAddManager.webContents.on('did-finish-load', () => {
        insertCssDark(theme);
        gChildAddManager.webContents.send("translations",btC.TL.DIALOG_ADD_MANAGER);           
    })

    gChildAddManager.on('close', () => {
      let bounds = gChildAddManager.getBounds();
      windowsState.set("account_manager_add",bounds.x,bounds.y, bounds.width, bounds.height)
    })
    
    gChildAddManager.on('closed', () => {
        gChildAddManager = null
    })    
  }
  else
  {
    if (btC.DEBUG_WINDOW)
    {                    
        gChildAddManager.webContents.openDevTools();
    } 
    gChildAddManager.setTitle(title); 
    gChildAddManager.hide();
    gChildAddManager.show(); 
    info();
  }
//  gChildAddManager.webContents.openDevTools()
}

async function insertCssDark(darkCss)
{
  try {
    if (gChildAddManager === null) return;
    if (gCssDarkManager !== null)
    {
        gChildAddManager.webContents.removeInsertedCSS(gCssDarkManager) 
    }    
    gCssDarkManager = await gChildAddManager.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkManager = null;
  }
}

/////////// Info /////////////////////////////////////////////////////////////////////////////

function info()
{
    try {
        let connections = gConnections;
        gManagerInfoFound = false;
        gManagerInfoMsg = "<table id='table_line'><th>" + btC.TL.DIALOG_ADD_MANAGER.DAM_INFO_COMPUTER  + "</th><th>" + btC.TL.DIALOG_ADD_MANAGER.DAM_INFO_MANAGER + "</th><th>" + btC.TL.DIALOG_ADD_MANAGER.DAM_INFO_URL + "</th><th>" + btC.TL.DIALOG_ADD_MANAGER.DAM_INFO_CREDENTIALS  + "</th>";
        gConListInfo = [];
        let conFound = null
        for (let i=0;i<connections.length;i++)
        {
            let con = connections[i];
            if (!con.auth)
            {
                continue;
            } 
            if (conFound === null) conFound = con;
            if (con.ip.toLowerCase() == "localhost")
            {
                conLocalHost = con;
            }
            gConListInfo.push(con);
        }
        fetchNextInfo();
    } catch (error) {
        logging.logError('ManagerInfo,info', error);       
    }
}

function fetchNextInfo()
{
    if (gConListInfo.length > 0)
    {
        infoComputer(gConListInfo[0]);
        gConListInfo.shift();
        return;
    }
    if (gManagerInfoFound)
    {
        gManagerInfoMsg += "</table><br><br>";
        if (gChildAddManager !== null) gChildAddManager.webContents.send('info_manager_status',gManagerInfoMsg);
    }
    else
    {
        if (gChildAddManager !== null) gChildAddManager.webContents.send('info_manager_status',"");     
    }
}

function infoComputer(conIn)
{
    let con = new Object();
    con.computerName = conIn.computerName;
    con.ip = conIn.ip;
    con.port = conIn.port;
    con.passWord = conIn.passWord;
    const btSocket = new BtSocket();
    con.clientClass = btSocket;
    con.clientClass.socket(con);
    con.client_callback = authenticatedInfo;
    athenticate.authorize(con);
}

function authenticatedInfo(event)
{
    try {
//        let item = gInfoManager.addItem;
        let toSend =   "<acct_mgr_info>/n";
        this.client_completeData = "";
        this.client_callbackI = infoManagerReady;
        functions.sendRequest(this.client_socket, toSend);
    } catch (error) {
        logging.logError('ManagerInfo,authenticatedInfo', error);         
    }        
}

function infoManagerReady(event)
{
    try {
        switch(event)
        {
            case "data":
                let msg = "";
                let name = "";
                let url = "";
                let cred = "";
                let reply = parseManagerInfo(this.client_completeData);                
                if (functions.isDefined(reply.acct_mgr_info))
                {
                    let mgr = reply.acct_mgr_info;
                    if (mgr.length > 0)                    
                    {
                        let item = mgr[0];
                        if (functions.isDefined(item.acct_mgr_name)) name = item.acct_mgr_name[0];
                        if (functions.isDefined(item.acct_mgr_url))  url = item.acct_mgr_url[0];
                        if (functions.isDefined(item.have_credentials)) cred =  btC.TL.DIALOG_ADD_MANAGER.DAM_STATUS_YES;
                        else cred = '<span style="color:red;">' + btC.TL.DIALOG_ADD_MANAGER.DAM_STATUS_NO + '</span>';
                    }
                }
                if (url.length > 0)
                {
                    msg = "<tr><td>" + this.computerName + "</td><td>" + name + "</td><td>" + url + "</td><td>" + cred + "</td></tr>"
                    gManagerInfoMsg += msg;
                    gManagerInfoFound = true;
                }
                fetchNextInfo();
            break;        
        }
    } catch (error) {
        logging.logError('ManagerInfo,infoManagerReady', error);
    }         
}

function parseManagerInfo(xml)
{    
    reply = null;  
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            reply = result['boinc_gui_rpc_reply'];
            return reply;
        });      
    } catch (error) {
        logging.logError('ManagerInfo,parseManagerInfo', error);        
    }
    return reply;
}
