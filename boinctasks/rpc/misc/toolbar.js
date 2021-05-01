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

const ConnectionsShadow = require('./connections_shadow');
const connectionsShadow = new ConnectionsShadow();

const btConstants = require('../functions/btconstants');

const { dialog,clipboard  } = require('electron');

const SEND_TASKS = 0;
const SEND_PROJECTS = 1;
const SEND_TRANSFERS = 2;

class Toolbar{
   show(gb,editComputers)
    {
        try {
            let sel = 0;
            if (gb.selectedTab != gb.currentTable.name)
            {
                this.hide(mainwindow);
                return;
            }

            let toolbar = "";

            switch(gb.selectedTab)
            {
                case "computers":
                    if (editComputers) toolbar = getToolbarEditComputers();
                    else
                    {
                        sel = gb.rowSelect.computers.rowSelected.length  
                        if (sel > 0) toolbar = getToolbarComputers();
                    }
                break;  
                case "projects":
                    sel = gb.rowSelect.projects.rowSelected.length                 
                    if (sel > 0) toolbar = getToolbarProjects();
                break;                                                  
                case "tasks":
                    sel = gb.rowSelect.results.rowSelected.length                    
                    if (sel > 0) toolbar = getToolbarResultsSel();
                    else toolbar = toolbar = getToolbarResults(gb);
                break;
                case "transfers":
                    sel = gb.rowSelect.transfers.rowSelected.length
                    if (sel > 0) toolbar = getToolbarTransfers();
                break; 
                case "messages":
                    sel = gb.rowSelect.messages.rowSelected.length                      
                    if (sel > 0) toolbar = getToolbarMessages();
                break;
                case "history":
                    sel = gb.rowSelect.history.rowSelected.length                      
                    if (sel > 0) toolbar = getToolbarHistory();
                break;                
            }
            gb.mainWindow.webContents.send('toolbar', toolbar);        
        } catch (error) {
            logging.logError('Toolbar,show', error);             
        }        
    }

    hide(window)
    {
        window.webContents.send('toolbar', "", false);  
    }
    
    click(gb,id, callback)
    {
        try {       
            var selected;
            switch (id)
            {
                // computer
                case "toolbar_abort_c":
                    callback("remove_selected");
                break;                
                // results
                case "toolbar_suspend":
                    selected = gb.rowSelect.results.rowSelected;
                    task(gb,selected,"suspend_result",SEND_TASKS);
                break;              
                case "toolbar_resume":
                    selected = gb.rowSelect.results.rowSelected;                    
                    task(gb,selected,"resume_result",SEND_TASKS);
                break;
                case "toolbar_update":
                    selected = gb.rowSelect.results.rowSelected;                    
                    task(gb,selected,"project_update",SEND_PROJECTS);
                break;                
                case "toolbar_abort":
                    selected = gb.rowSelect.results.rowSelected;                    
                    taskAbort(gb,gb.mainWindow, selected,SEND_TASKS);
                break;
                case "toolbar_info":
                    selected = gb.rowSelect.results.rowSelected;                    
                    const Properties = require('./properties');
                    const properties = new Properties();
                    properties.task(selected,gb.connections);
                break;
                case "toolbar_rules":
                    selected = gb.rowSelect.results.rowSelected;
                    const RequireRulesList = require('../rules/rules_list');
                    let requireRulesList = new RequireRulesList();
                    requireRulesList.toolbarTasks(selected,gb);
                break;
                case "toolbar_completed":
                    reportCompleted(gb);
                break;
                // project
                case "toolbar_resume_p":
                    selected = gb.rowSelect.projects.rowSelected;                    
                    task(gb,selected,"project_resume",SEND_PROJECTS);
                break;                
                case "toolbar_suspend_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    task(gb,selected,"project_suspend",SEND_PROJECTS);
                break;                  
                case "toolbar_nomore_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    task(gb,selected,"project_nomorework",SEND_PROJECTS);
                break;
                case "toolbar_allow_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    task(gb,selected,"project_allowmorework",SEND_PROJECTS);
                break;            
                case "toolbar_update_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    task(gb,selected,"project_update",SEND_PROJECTS);
                break;
                case "toolbar_detach_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    detachProject(gb.mainWindow,selected,gb.connections);
                break;
                case "toolbar_reset_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    resetProject(gb.mainWindow,selected,gb.connections);
                break;
                // transfers
                case "toolbar_update_t":
                    selected = gb.rowSelect.transfers.rowSelected;                       
                    task(gb,selected,"retry_file_transfer",SEND_TRANSFERS);
                break;                 
                case "toolbar_abort_t":
                    selected = gb.rowSelect.transfers.rowSelected;                      
                    taskAbort(gb,gb.mainWindow,selected,SEND_TRANSFERS);
                break;
                // messages
                case "toolbar_clipboard_m":
                    selected = gb.rowSelect.messages.rowSelected;                      
                    clipboardMessages(selected,gb.connections);
                break;
                // history
                case "toolbar_clipboard_h":
                    selected = gb.rowSelect.history.rowSelected;                      
                    clipboardHistory(selected,gb);
                break;                
            }
     
        } catch (error) {
            logging.logError('Toolbar,click', error);      
        }        
    }
  }
  
  module.exports = Toolbar;

function getToolbarResultsSel()
{
    var toolbar =   '<td id="toolbar_abort" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;Abort</td>' +
                    '<td id="toolbar_suspend" class="ef_btn_toolbar bt_img_toolbar_pause">&nbsp;Suspend</td>' +
                    '<td id="toolbar_resume" class="ef_btn_toolbar bt_img_toolbar_resume">&nbsp;Resume</td>' +
                    '<td id="toolbar_update" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;Update</td>' +
                    '<td id="toolbar_info" class="ef_btn_toolbar bt_img_toolbar_info">&nbsp;Info</td>' +                      
                    '<td id="toolbar_rules" class="ef_btn_toolbar bt_img_toolbar_list">&nbsp;Add rule</td>';
    return toolbar;
}

function getToolbarResults(gb)
{
    let toolbar = "";
    let iReady = gb.readyToReport;
    if (iReady > 0)
    {
        toolbar +=   '<td id="toolbar_completed" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;Ready to report: ' + iReady + '</td>'                     
    }
    return toolbar;
}

function getToolbarTransfers()
{
    var toolbar =   '<td id="toolbar_update_t" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;Retry</td>' +
                    '<td id="toolbar_abort_t" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;Abort</td>';      
    return toolbar;
}

function getToolbarProjects()
{
    var toolbar =   '<td id="toolbar_detach_p" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;Detach</td>' +
                    '<td id="toolbar_reset_p" class="ef_btn_toolbar bt_img_toolbar_back">&nbsp;Reset</td>' +
                    '<td id="toolbar_suspend_p" class="ef_btn_toolbar bt_img_toolbar_pause">&nbsp;Suspend</td>' +
                    '<td id="toolbar_resume_p" class="ef_btn_toolbar bt_img_toolbar_resume">&nbsp;Resume</td>' +
                    '<td id="toolbar_nomore_p" class="ef_btn_toolbar bt_img_toolbar_download_not">&nbsp;No more work</td>' +
                    '<td id="toolbar_allow_p" class="ef_btn_toolbar bt_img_toolbar_download">&nbsp;Allow work</td>' +                      
                    '<td id="toolbar_update_p" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;Update</td>';
    return toolbar;
}


function getToolbarMessages()
{
    var toolbar =   '<td id="toolbar_clipboard_m" class="ef_btn_toolbar bt_img_toolbar_clipboard">&nbsp;Clipboard</td>';  
    return toolbar;
}

function getToolbarHistory()
{
    var toolbar =   '<td id="toolbar_clipboard_h" class="ef_btn_toolbar bt_img_toolbar_clipboard">&nbsp;Clipboard</td>';  
    return toolbar;
}

function getToolbarComputers()
{
    var toolbar =   '<td id="toolbar_abort_c" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;Delete</td>';  
    return toolbar;
}

function getToolbarEditComputers()
{
    var toolbar =  '<td id="toolbar_ok_c" class="ef_btn_toolbar bt_img_toolbar_ok">&nbsp;Update changes</td>'
    return toolbar;
}

function taskAbort(gb,window,selected,what)
{
    abort(gb,window, selected, what);
}

function abort(gb,mainWindow, selected, what)
{
    let request = "";
    switch(what)
    {
        case SEND_TASKS:
            request = "abort_result";
        break;
        case SEND_TRANSFERS:
            request = "abort_file_transfer";
        break;
    }

    if (findFilter(selected))
    {
        dialog.showMessageBox(mainWindow,
            {
              title: 'Unable to delete a Filter',
              message: 'You cannot delete a filter this way' ,
              detail: 'Open the filter, click on a task.\nNext press Shift and select another one.\nNow you can delete the selected filtered tasks.'
            })
            return;
    }

    dialog.showMessageBox(mainWindow,
    {
      title: 'Abort?',
      message: 'You are about to abort/delete tasks' ,
      detail: 'Do you want to delete the selected tasks?',
      buttons: ['Cancel', 'Yes delete'],
      defaultId: 0, // bound to buttons array
      cancelId: 1 // bound to buttons array
    })
    .then(result => {
      if (result.response === 0) {
        // cancel
      } else if (result.response === 1) {
        // yes

        task(gb,selected,request,what);
      }
    });
}

function detachProject(window,selected,connections)
{
    dialog.showMessageBox(window,
        {
          title: 'Detach/remove projects?',
          message: 'You are about to detach/remove projects' ,
          detail: 'Do you want to delete the selected projects?',
          buttons: ['Cancel', 'Yes delete'],
          defaultId: 0, // bound to buttons array
          cancelId: 1 // bound to buttons array
        })
        .then(result => {
          if (result.response === 0) {
            // cancel
          } else if (result.response === 1) {
            // yes
            resetDetachProjectYes(selected,connections,true);
          }
        }
        );
}

function resetProject(window,selected,connections)
{
    dialog.showMessageBox(window,
        {
          title: 'Reset projects?',
          message: 'You are about to reset projects' ,
          detail: 'Do you want to reset the selected projects?',
          buttons: ['Cancel', 'Yes delete'],
          defaultId: 0, // bound to buttons array
          cancelId: 1 // bound to buttons array
        })
        .then(result => {
          if (result.response === 0) {
            // cancel
          } else if (result.response === 1) {
            // yes
            resetDetachProjectYes(selected,connections,false);
          }
        }
        );
}

function resetDetachProjectYes(selected,connections,detach)
{
    try {
        connectionsShadow.init();        
        for (let s=0;s<selected.length;s++)  
        {
            let res = selected[s].split(btConstants.SEPERATOR_SELECT);
            let computerName = "";
            let url = "";
            if (res.length > 2)
            {
                computerName = res[1];
                url = res[2];
            }
            connectionsShadow.init();
            for (let i=0;i<connections.length;i++)
            {
                let con = connections[i]
                if (computerName === con.computerName)
                {
                    if (detach) req = "<project_detach>\n<project_url>" + url + "</project_url>\n</project_detach>"
                    else req = "<project_reset>\n<project_url>" + url + "</project_url>\n</project_reset>"
                    connectionsShadow.addSendArray(con,req);
                }
            }
        }
        connectionsShadow.flushSendArray();
    } catch (error) {
        logging.logError('Toolbar,detachProjectYes', error);        
    }
}

function task(gb,selected,request,what)
{
    try {
        connectionsShadow.init();
        let connections = gb.connections;
        for (var i=0; i<selected.length;i++)
        {
            var res = selected[i].split(btConstants.SEPERATOR_SELECT);
            if (res.length !== 3) continue; // skip filter
            var wu = res[0];
            var computer = res[1];
            var url = res[2];
            for (var c=0; c<connections.length;c++)
            {
                let con = connections[c];
                if (con.computerName === computer)
                {
                    switch(what)
                    {
                        case SEND_TASKS:
                            sendCommand(con,request, url, wu);
                        break;
                        case SEND_PROJECTS:
                            sendCommandProject(con,request, url);
                        break;
                        case SEND_TRANSFERS:
                            sendCommandTransfer(connections[c],request, url,wu);
                        break;
                    }
                }
            }
        }
        connectionsShadow.flushSendArray();
    } catch (error) {
        logging.logError('Toolbar,Task', error);       
    }    
}

function findFilter(selected)
{
    try {
        for (var i=0; i<selected.length;i++)
        {
            var res = selected[i].split(btConstants.SEPERATOR_SELECT);
            if (res.length === 3) 
            {
                if (res[2].indexOf(btConstants.SEPERATOR_FILTER) >= 0) return true;
            }
        }      
    } catch (error) {
        logging.logError('Toolbar,findFilter', error);          
    }
    return false;
}

function sendCommand(con,request, url, wu)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n<name>"+ wu + "</name>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req);
}

function sendCommandTransfer(con,request, url, wu)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n<filename>"+ wu + "</filename>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req);
}

function sendCommandProject(con,request, url)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req);
}

function reportCompleted(gb)
{
    let url = "";
    try {
        connectionsShadow.init();
        for (var i=0;i<gb.connections.length;i++)          
        {
            let con = connections[i];
            var toReport = con.toReport;
            if (functions.isDefined(toReport))
            {                    
                for (let tr=0; tr < toReport.url.length;tr++)
                { 
                    url = toReport.url[tr];                
                    sendCommandProject(con,"project_update",url)
                }
            }
        }
        connectionsShadow.flushSendArray();    
    } catch (error) {
        logging.logError('Toolbar,reportCompleted', error);    
    }
   
}

function clipboardMessages(selected,connections)
{
    try {
        let msg = "";
        let len = selected.lenght;
        if (len === 0) return;

        let res = selected[0].split(btConstants.SEPERATOR_SELECT);
        if (res.length !== 3) return;
        let computer = res[1];
        for (let c=0; c<connections.length;c++)
        {
            if (connections[c].computerName === computer)
            {
                msg += "Computer: " + computer + "\n\n";    
                let messages = connections[c].messages;
                if (messages !== null)
                {            
                    var table = messages.msgTable; 
                    for (let i=0;i<selected.length;i++ )
                    {
                        res = selected[i].split(btConstants.SEPERATOR_SELECT);
                        if (res.length !== 3) break;
                        let seq = res[0];                    
                                   
                        for (let s=0;s<table.length;s++)
                        {
                            let item = table[s];
                            if (item.seqno == seq)
                            {
                                msg += seq + "\t";
                                msg += item.project + "\t";
                                msg += item.timeS + "\t";
                                let body = item.body.replaceAll("\n", "");
                                msg += body + "\n";
                            }
                        }
                    }
                }
            }
        }
        clipboard.writeText(msg);
    } catch (error) {
        logging.logError('Toolbar,clipboardMessages', error);    
    }
}

function clipboardHistory(selected, gb)
{
    try {
        let hTxt = "";
        let len = selected.lenght;
        if (len === 0) return;

        let table = gb.currentTable.historyTable
                                            
        for (let t=0;t<table.length;t++)
        {
            let item = table[t];
            { 
                let selId = item.result + btConstants.SEPERATOR_SELECT + item.computerName + btConstants.SEPERATOR_SELECT + item.projectUrl;
                for (let s=0;s<selected.length;s++ )                            
                {
                    if (selected[s] == selId)
                    {
                        hTxt += item.computerName + "\t";
                        hTxt += item.projectName + "\t";
                        hTxt += item.appNameUF + "\t";
                        hTxt += item.result + "\t";
                        let elapsedS = functions.getFormattedTimeInterval(item.elapsed);
                        hTxt += elapsedS + "\t";
                        let cpu = (item.cpuTime/item.elapsed) * 100;
                        if (cpu > 100) cpu = 100;
                        let cpuS = cpu.toFixed(2) + "%";
                        hTxt += cpuS + "\t";
                        let d = new Date(item.completedTime*1000);
                        d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
                        let options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                        let timeS = d.toLocaleDateString("en-US", options);
                        hTxt += timeS + "\t";   
                        let status = "";
                        switch (item.exit)
                        {
                            case 0:
                            status = "OK";
                            break;
                            case -221:
                            status = "Aborted by project";
                            break;
                            default:
                            status = "Exit code: " + item.exit;
                        }                   
                        hTxt += status + "\n";
                    }
                }
            }            
        }
        clipboard.writeText(hTxt);
    } catch (error) {
        logging.logError('Toolbar,clipboardHistory', error);    
    }
}