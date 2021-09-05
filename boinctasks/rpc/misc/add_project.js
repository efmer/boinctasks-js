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
const btC = require('../functions/btconstants');

const { BrowserWindow } = require('electron')

let gTimer = null;

let gAddProject = new Object();
gAddProject.clientClass = null;
gAddProject.addproject = null;

let gChildAddProject = null;
let gCssDarkProject = null;

class AddProject
{
    addProject(theme)
    {
        addProject(theme);
    }
    process(gb,event,data)
    {
        try {

            switch(event)
            {
                case 'ready':
                    start(gb.connections)
                break;
                case 'project_changed':
                    addProjectListChanged(data);
                break;
                case 'ok':  
                    addProjectOk(gb.connections,data);
                break;
            }

           
        } catch (error) {
            logging.logError('AddProject,process', error);             
        }        
    }
    
    setTheme(theme)
    {
        insertCssDark(theme);
    }
}

module.exports = AddProject;


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

        getProjectList(conLocalHost, computerList);        
    } catch (error) {
        logging.logError('AddProject,start', error);   
    }
}

function addProjectOk(connections,item)
{
    if (item.sel.length === 0)
    {
        sendError(btC.TL.DIALOG_ADD_PROJECT.DAB_SELECT_COMPUTER);
        gChildAddProject.webContents.send('add_project_enable');        
        return;
    }
    startTimer();
    gAddProject.msgTotal = "";
    gAddProject.sel = item.sel;
    gAddProject.addItem = item;
    if (gAddProject.addproject.url !== gAddProject.addItem.url)
    {    
        gAddProject.addproject.url = gAddProject.addItem.url;
        gAddProject.addproject.name = "Project defined by changed url";
        let msg = gAddProject.addproject.name + " : " + gAddProject.addItem.url;
        logging.logDebug(msg); 
    }
    addProjects();
}

function addProjects()
{
    try {

        stopTimer();
        if (gAddProject.sel.length === 0)
        {
            gChildAddProject.webContents.send('add_project_enable');
            return; // add projects for all computers.
        }
        startTimer();
        for (let s=0;s<gAddProject.sel.length;s++)
        {
            for (let c=0; c < connections.length; c++)
            {
                let con = connections[c];
                if (con.computerName === gAddProject.sel[s])
                {
                    gAddProject.sel.splice(s, 1);
                    let msg = btC.TL.DIALOG_ADD_PROJECT.DAB_ADDING_COMPUTER + " " + con.computerName;
                    sendMsg(msg);
                    logging.logDebug(msg); 
                    addProjectComputer(con)
                    return;
                }
            }
        }
        
    } catch (error) {
        logging.logError('AddProject,addProjects', error);          
    }    

}


function addProjectComputer(conIn,item)
{
    gAddProject.computerName = conIn.computerName;
    gAddProject.ip = conIn.ip;
    gAddProject.port = conIn.port;
    gAddProject.passWord = conIn.passWord;

    if(gAddProject.clientClass == null)
    {
        const btSocket = new BtSocket();        
        gAddProject.clientClass = btSocket;
    }

    gAddProject.clientClass.socket(gAddProject);

    gAddProject.client_callback = authenticatedAdd;
    athenticate.authorize(gAddProject); //connectAuth);
}

function authenticatedAdd(event)
{
    try {
        let item = gAddProject.addItem;
        lookUpAccount(item.url, item.loginName, item.passWord);   
    } catch (error) {
        logging.logError('AddProject,authenticatedAdd', error);        
        gAddProject.auth = false;
        gAddProject.mode = 'error';        
    }
}

function addProjectListChanged(sel)   
{
    try {
        for (let i=0;i<gAddProject.projects.length;i++)
        {
            let project = gAddProject.projects[i];
            if (project.name[0] === sel)
            {
                getSelectedProjectDescription(project)

                let url = project.url[0];
//                url = url.replace("http:", "https:"); // force https

                gAddProject.addproject.url = url;
                gAddProject.addproject.web_url = project.web_url[0]; 
                gAddProject.addproject.name = project.name[0];
                gChildAddProject.webContents.send('add_project_description', gAddProject.addproject);
            }
        }        
    } catch (error) {
        logging.logError('AddProject,addProjectListChanged', error);           
    }
} 

function getProjectList(conIn,computerList)
{
    try 
    {
        // we need to set up a new connection to isolate us from the other requests.     
        gAddProject.msgTotal = "";
        gAddProject.computerName = conIn.computerName;
        gAddProject.ip = conIn.ip;
        gAddProject.port = conIn.port;
        gAddProject.passWord = conIn.passWord;
        gAddProject.add = false;
        const btSocket = new BtSocket();  
        btSocket.socket(gAddProject);

        gAddProject.list = computerList;
        gAddProject.client_callback = authenticated;
        athenticate.authorize(gAddProject); //connectAuth);
    } catch (error) {
        logging.logError('AddProject,getProjectList', error);        
        gAddProject.auth = false;
        gAddProject.mode = 'error';
    } 
}

function authenticated(event)
{
    try {
        gAddProject.client_callbackI = gotProjectList;
        gAddProject.client_completeData = "";
        functions.sendRequest(gAddProject.client_socket, "<get_all_projects_list/>\n");    
    } catch (error) {
        logging.logError('AddProject,authenticated', error);        
        gAddProject.auth = false;
        gAddProject.mode = 'error';        
    }
}

function gotProjectList(event)
{
    try {
        switch(event)
        {
            case "data":        
                const reply = parseProjectList(gAddProject.client_completeData);
                gAddProject.projects = reply.project;
                if (gAddProject.projects.length > 1)
                {
                    let list = "";
                    for (let i=0;i<gAddProject.projects.length;i++)
                    {
                        let project = gAddProject.projects[i];
                        list += '<option value ="id_' + i + '">'+ project.name + '</option>';
                    }

                    if (gAddProject.addproject === null)
                    {
                        gAddProject.addproject = new Object();
                        gAddProject.addproject.password = "";
                        gAddProject.addproject.email = "";
                    }

                    gAddProject.addproject.url = gAddProject.projects[0].url[0];
                    gAddProject.addproject.web_url = gAddProject.projects[0].web_url[0];
                    gAddProject.addproject.name = gAddProject.projects[0].name[0];

                    getSelectedProjectDescription(gAddProject.projects[0])
                    gChildAddProject.webContents.send('add_project_init', gAddProject.list, list, gAddProject.addproject);
                }
            break;        
        }
    } catch (error) {
        logging.logError('AddProject,gotProjectList', error);
    }         
}

function parseProjectList(xml)
{
    var projects = "";
    try {
        // remove illegal tags
        xml = xml.replace("<a ","[");
        xml = xml.replace("</a>", "]");

        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            var projectArray = result['boinc_gui_rpc_reply']['projects'];
            if (functions.isDefined(projectArray))
            {
                projects = projectArray[0];
                return projects;
            }
            return "";
        });
    } catch (error) {
        logging.logError('AddProject,parseProjectList', error);  
    }   
    return projects;
}

function getSelectedProjectDescription(project)
{
    let description = "<br><b>" + project.specific_area[0] + "</b><br>";
    description += project.description[0];
    gAddProject.addproject.description = description;
}

function lookUpAccount(url,login,password)
{
    try {
        const crypto = require('crypto')
        let np = password + login;
        let hash =  crypto.createHash('md5').update(np).digest("hex")    
        let toSend =   "<lookup_account>\n<url>" + url + "</url>\n<email_addr>" + login + "</email_addr>\n<passwd_hash>" + hash + "</passwd_hash>\n</lookup_account>\n";
        gAddProject.client_completeData = "";
        gAddProject.client_callbackI = lookUpAccountReady;
        functions.sendRequest(gAddProject.client_socket, toSend);  
        logging.logDebug("lookUpAccount: [" + gAddProject.ip + "] url " + url);   
    } catch (error) {
        logging.logError('AddProject,lookUpAccount', error);         
    }        
}

function lookUpAccountReady(event)
{
    try {
        switch(event)
        {
            case "data":        
                let reply = parseLookupAcount(gAddProject.client_completeData);                
                if (functions.isDefined(reply.error))
                {                       
                    logging.logDebug("lookup_account: error " + reply.error); 
                    sendError(reply.error); 
                    gChildAddProject.webContents.send('add_project_enable');
                    return;
                }
                if (functions.isDefined(reply.success))
                {                 
                    logging.logDebug("lookup_account: success");                     
                    gAddProject.client_completeData = "";
                    gAddProject.client_callbackI = lookUpAccountPoll;
                    functions.sendRequest(gAddProject.client_socket, "<lookup_account_poll/>\n"); 
                }
                else
                {
                    logging.logDebug("lookup_account: failed");
                }
            break;        
        }
    } catch (error) {
        logging.logError('AddProject,lookUpAccountPoll', error);
    }         
}

function parseLookupAcount(xml)
{    
    reply = null;  
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            reply = result['boinc_gui_rpc_reply'];
            return reply;
        });      
    } catch (error) {
        logging.logError('AddProject,parseLookupAcount', error);        
    }

    return reply;
}

function lookUpAccountPoll(event)
{
    try {
        switch(event)
        {
            case "data":        
                const item = parseLookUp(gAddProject.client_completeData);

                if (item.error != '')
                {
                    let error = parseInt(item.error);
                    if (error == -204) // not ready
                    {
                        setTimeout(function(){
                            gAddProject.client_completeData = "";   // nor ready retry
                            gAddProject.client_callbackI = lookUpAccountPoll;
                            functions.sendRequest(gAddProject.client_socket, "<lookup_account_poll/>\n");
                            }, 500);    // 0.5 sec
                        return;
                    }
                    logging.logDebug("lookUpAccountPoll: error: " + error + " " + item.errorText); 
                    intError(error);
                    addProjects();
                }
                if (item.authenticator.length > 1)
                {
                    logging.logDebug("lookUpAccountPoll: got authenticator");
                    gAddProject.authenticator = item.authenticator;
                    attach();
                }
            break;        
        }
    } catch (error) {
        logging.logError('AddProject,lookUpAccountPoll', error);
    }         
}

function parseLookUp(xml)
{
    let item = new Object();
    item.error = "";
    item.errorText = "";    
    item.authenticator = "";
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            let accountOut = result['boinc_gui_rpc_reply']['account_out'];
            if (functions.isDefined(accountOut))
            {
                if (functions.isDefined(accountOut[0].error_num)) 
                {              
                    item.error = accountOut[0].error_num.toString();
                }
                if (functions.isDefined(accountOut[0].authenticator)) 
                {              
                    item.authenticator = accountOut[0].authenticator.toString();
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
        logging.logError('AddProject,parseLookUp', error);  
    }   
    return item;   
}

function attach()
{
    try {
        gAddProject.client_completeData = "";
        gAddProject.client_callbackI = attachPoll;       
        let toSend = "<project_attach>\n<project_url> " + gAddProject.addproject.url + "</project_url>\n<authenticator>"+ gAddProject.authenticator + "</authenticator>\n<project_name>" + gAddProject.addproject.name + "</project_name>\n</project_attach>\n"        
        functions.sendRequest(gAddProject.client_socket, toSend);          
    } catch (error) {
        logging.logError('AddProject,attach', error);          
    }
}


function attachPoll(event)
{
    try {
        switch(event)
        {
            case "data":        
                const item = parseAttachPoll(gAddProject.client_completeData);
                if (item.error != '')
                {
                    let error = item.error;
                    logging.logDebug("attachPoll: error: " + error); 
                    sendError(error);
                    addProjects();
                }
                if (item.success)
                {
                    let msg = gAddProject.computerName + " " + btC.TL.DIALOG_ADD_PROJECT.DAB_ATTACHED + " " + gAddProject.addproject.name;
                    logging.logDebug(msg);
                    sendMsg(msg);
                    addProjects();
                }
            break;        
        }
    } catch (error) {
        logging.logError('AddProject,attachPoll', error);
    }         
}

function parseAttachPoll(xml)
{
    let item = new Object();
    item.error = "";
    item.success = false; 
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            var resultArray = result['boinc_gui_rpc_reply'];
            if (functions.isDefined(resultArray))
            {
                if (functions.isDefined(resultArray.error))                
                {
                    item.error = resultArray.error.toString();                    
                }  
                if (functions.isDefined(resultArray.success))                
                {
                    item.success = true;                   
                }               

            }
        });
    } catch (error) {
        logging.logError('AddProject,parseAttachPoll', error);  
    }   
    return item;
}

function intError(error)
{
    switch (error)
    {
        case -113:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_URL;
        break;
        case -224:
        case -214:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_CONTACT;
        break;
        case -206:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_PASSWORD;
        break;
        case -130:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_ALREADY;
        break;
        case -136:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_DATABASE;
        break;
        case -107:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_CONNECT;
        break;
        case -161:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_FOUND;
        break;
        case -204:
            msg = btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR_LOGGING;
        break;        
        default: 
            msg = error;
    }
    sendError(msg);
 
}

function sendError(msg)
{
    let emsg = '<span style="color:#FF0000";>' + btC.TL.DIALOG_ADD_PROJECT.DAP_ERROR + " " + msg + '</span>';
    sendMsg(emsg);
}

function sendMsg(msg)
{
    gAddProject.msgTotal += msg + "<br>";
    gChildAddProject.webContents.send('add_project_status', gAddProject.msgTotal); 
}


function startTimer()
{
    gTimer = setInterval(btTimer, 30000);    // 30 seconds.
}

function stopTimer()
{
    clearTimeout(gTimer);
}

function btTimer()
{
    if (gChildAddProject !== null) gChildAddProject.webContents.send('add_project_enable'); 
    clearTimeout(gTimer);
}

function addProject(theme)
{
  let title = "BoincTasks Js - " + btC.TL.DIALOG_ADD_PROJECT.DAB_TITLE;
  if (gChildAddProject == null)
  {
    let state = windowsState.get("add_project",700,800)

    gChildAddProject = new BrowserWindow({
      'x' : state.x,
      'y' : state.y,
      'width': state.width,
      'height': state.height,
      webPreferences: {
        sandbox : false,
        contextIsolation: false,  
        nodeIntegration: true,
        nodeIntegrationInWorker: true
 //       preload: './preload/preload.js'
      }
    });
    gChildAddProject.loadFile('index/index_add_project.html')
    gChildAddProject.once('ready-to-show', () => {    
      gChildAddProject.show();  
      gChildAddProject.setTitle(title);
      gChildAddProject.webContents.send("translations",btC.TL.DIALOG_ADD_PROJECT);         
    }) 
    gChildAddProject.on('close', () => {
      let bounds = gChildAddProject.getBounds();
      windowsState.set("add_project",bounds.x,bounds.y, bounds.width, bounds.height)
    })
    gChildAddProject.webContents.on('did-finish-load', () => {
        insertCssDark(theme);
    })
    gChildAddProject.on('closed', () => {
      gChildAddProject = null
    })    
  }
  else
  {
    gChildAddProject.setTitle(title); 
    gChildAddProject.hide();
    gChildAddProject.show();
//    connections.addProject(gChildAddProject,'ready');    
  }
//gChildAddProject.webContents.openDevTools()
}

async function insertCssDark(darkCss)
{
  try {
    if (gChildAddProject === null) return;
    if (gCssDarkProject !== null)
    {
        gChildAddProject.webContents.removeInsertedCSS(gCssDarkProject) 
    }    
    gCssDarkProject = await gChildAddProject.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkProject = null;
  }
}