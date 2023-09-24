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

const btC = require('../functions/btconstants');

const { dialog,clipboard  } = require('electron');

let g_toolbarProperties = null;

let gToolbarData = "";

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
                        if (sel > 0)
                        {
                            let res = gb.rowSelect.computers.rowSelected[0].split(btC.SEPERATOR_SELECT);
                            if (res.length !== 2) break;
                            let computer = res[1];
                            let connections = gb.connections;
                            for (let c=0; c<connections.length;c++)
                            {
                              if (connections[c].computerName === computer)
                              {
                                let con = connections[c];
                                if (con.auth) toolbar = getToolbarComputersAuth();
                                else toolbar = getToolbarComputers();
                              }
                            }
                        }                        
                    }
                break;  
                case "projects":
                    sel = gb.rowSelect.projects.rowSelected.length                 
                    if (sel > 0) toolbar = getToolbarProjects();
                break;                                                  
                case "tasks":
                    sel = gb.rowSelect.results.rowSelected.length                    
                    if (sel > 0) toolbar = getToolbarResultsSel(gb);
                    else toolbar = toolbar = getToolbarResults(gb);
                break;
                case "transfers":
                    sel = gb.rowSelect.transfers.rowSelected.length
                    if (sel > 0) toolbar = getToolbarTransfersSelect();
                    else
                    {
                        try {
                            let table = gb.currentTable.transfersTable;
                            let len = table.length;
                            if (len > 0) toolbar = getToolbarTransfers(len);
                        } catch (error) {                        
                        }
                    }
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
            sendToolbar(gb.mainWindow, toolbar);
  
        } catch (error) {
            logging.logError('Toolbar,show', error);             
        }        
    }

    hide(window)
    {   
        gToolbarData = "";
        window.webContents.send('toolbar', "", false);  
    }
    
    click(gb,id, callback)
    {
        try {
            let selected;
            let properties;
            switch (id)
            {
                // computer
                case "toolbar_abort_c":
                  dialog.showMessageBox(gb.mainWindow,
                    {
                        title: btC.TL.BOX_DELETE_COMPUTER.BX_DELETE_COMPUTER_TITLE,
                        message: btC.TL.BOX_DELETE_COMPUTER.BX_DELETE_COMPUTER_MESSAGE,
                        buttons: [btC.TL.BOX_GENERAL.BX_CANCEL, btC.TL.BOX_GENERAL.BX_YES],
                        defaultId: 0, // bound to buttons array
                        cancelId: 1 // bound to buttons array
                    })
                    .then(result => {
                        if (result.response === 0) {
                        // cancel
                        } else if (result.response === 1) {
                        // yes
                        callback("remove_selected");
                        }
                    });
                break;
                case "toolbar_info_c":          
                    selected = gb.rowSelect.computers.rowSelected; 
                    if (g_toolbarProperties === null) g_toolbarProperties = require('./properties');
                    properties = new g_toolbarProperties();
                    properties.computer(selected,gb);
                break;
                case "toolbar_cc_config_c":          
                    selected = gb.rowSelect.computers.rowSelected;
                    if (gClassCcConfig === null)
                    {
                        const ccConfig = require('../computers/cc_config');                    
                        gClassCcConfig = new ccConfig(); 
                    }
                    gClassCcConfig.ccConfigRead(gb,selected);
                break;                
                // results
                case "toolbar_suspend":
                    selected = gb.rowSelect.results.rowSelected;
                    suspendAtCheckpointResume(gb,selected);
                    task(gb,selected,"suspend_result",SEND_TASKS);
                break;
                case "toolbar_suspend_check":
                    selected = gb.rowSelect.results.rowSelected;
                    suspendAtCheckpoint(gb,selected);
                break;                  
                case "toolbar_resume":
                    selected = gb.rowSelect.results.rowSelected;
                    suspendAtCheckpointResume(gb,selected);
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
                    if (g_toolbarProperties === null) g_toolbarProperties = require('./properties');
                    properties = new g_toolbarProperties();
                    properties.task(selected,gb);
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
                case "toolbar_clipboard_tasks":
                    selected = gb.rowSelect.results.rowSelected;                      
                    clipboardTasks(selected,gb);
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
                case "toolbar_app_config_p":
                    selected = gb.rowSelect.projects.rowSelected;
                    if (gClassAppConfig === null) 
                    {
                        const appConfig = require('../computers/app_config');
                        gClassAppConfig = new appConfig(); 
                    }
                    gClassAppConfig.appConfigRead(gb,selected);
                break;
                case "toolbar_detach_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    detachProject(gb.mainWindow,selected,gb.connections);
                break;
                case "toolbar_reset_p":
                    selected = gb.rowSelect.projects.rowSelected;                       
                    resetProject(gb.mainWindow,selected,gb.connections);
                break;
                case "toolbar_info_p":
                    selected = gb.rowSelect.projects.rowSelected;                    
                    if (g_toolbarProperties === null) g_toolbarProperties = require('./properties');
                    properties = new g_toolbarProperties();
                    properties.project(selected,gb);
                break;
                case "toolbar_www":
                    wwwShow(gb);
                break;
                // transfers
                case "toolbar_update_t":
                    selected = gb.rowSelect.transfers.rowSelected;                       
                    task(gb,selected,"retry_file_transfer",SEND_TRANSFERS);
                break;
                case "toolbar_update_t_all":                    
                    transferAll(gb);
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

function sendToolbar(window, toolbar)
{
    if (gToolbarData != toolbar)
    {
        window.webContents.send('toolbar', toolbar);
        gToolbarData = toolbar;
        return;
    }
    let ii = 1;
}

function getToolbarResultsSel(gb)
{
    var toolbar =   '<span id="toolbar_abort" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;' + btC.TL.FOOTER.FTR_ABORT  + '</span>' +
                    '<span                    class="ef_btn_toolbar bt_img_toolbar_none ef_btn_toolbar_hidden">&nbsp;</span>' +
                    '<span id="toolbar_suspend" class="ef_btn_toolbar bt_img_toolbar_pause">&nbsp;' + btC.TL.FOOTER.FTR_SUSPEND + '</span>' +
 //                 '<span id="toolbar_suspend_check" class="ef_btn_toolbar bt_img_toolbar_pause">&nbsp;' + btC.TL.FOOTER.FTR_SUSPEND_CHECK + '</span>' + moved to context
                    '<span id="toolbar_resume" class="ef_btn_toolbar bt_img_toolbar_resume">&nbsp;' + btC.TL.FOOTER.FTR_RESUME + '</span>' +
                    '<span id="toolbar_update" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;' + btC.TL.FOOTER.FTR_UPDATE + '</span>';
 //                   '<span id="toolbar_info" class="ef_btn_toolbar bt_img_toolbar_info">&nbsp;'+ btC.TL.FOOTER.FTR_INFO + '</span>' + moved to context
 //                   '<span id="toolbar_rules" class="ef_btn_toolbar bt_img_toolbar_list">&nbsp;'+ btC.TL.FOOTER.FTR_RULE + '</span>'; moved to context
    let iReady = gb.readyToReport;
    if (iReady > 0)
    {
        toolbar +=   '<span id="toolbar_completed" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;' + btC.TL.FOOTER.FTR_READY_TO_REPORT  +  iReady + '</span>';
    }                    
    else
    {
        toolbar +=   '<span id="toolbar_completed" class="ef_btn_toolbar bt_img_toolbar_none ef_btn_toolbar_hidden">&nbsp;' + btC.TL.FOOTER.FTR_READY_TO_REPORT  +  iReady + '</span>';        
    }
    return toolbar;
}

function getToolbarResults(gb)
{
    let toolbar = "";
    let iReady = gb.readyToReport;
    if (iReady > 0)
    {
        toolbar +=   '<span id="toolbar_completed" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;' + btC.TL.FOOTER.FTR_READY_TO_REPORT + iReady + '</span>'                     
    }
    return toolbar;
}

function getToolbarTransfers(cnt)
{
    var toolbar =   '<span id="toolbar_update_t_all" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;' + btC.TL.FOOTER.FTR_RETRY_ALL + cnt + '</span>';
    return toolbar;
}

function getToolbarTransfersSelect()
{
    var toolbar =   '<span id="toolbar_update_t" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;' + btC.TL.FOOTER.FTR_RETRY + '</span>' +
                    '<span id="toolbar_abort_t" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;' + btC.TL.FOOTER.FTR_ABORT + '</span>';      
    return toolbar;
}

function getToolbarProjects()
{
                    //'<span id="toolbar_app_config_p" class="ef_btn_toolbar bt_img_toolbar_list">&nbsp;' + btC.TL.FOOTER.FTR_APP_CONFIG + '</span>' +
      var toolbar = '<span id="toolbar_detach_p" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;' + btC.TL.FOOTER.FTR__DETACH + '</span>' +
                    '<span id="toolbar_reset_p" class="ef_btn_toolbar bt_img_toolbar_back">&nbsp;' + btC.TL.FOOTER.FTR_RESET + '</span>' +
                    '<span id="toolbar_suspend_p" class="ef_btn_toolbar bt_img_toolbar_pause">&nbsp;' + btC.TL.FOOTER.FTR_SUSPEND + '</span>' +
                    '<span id="toolbar_resume_p" class="ef_btn_toolbar bt_img_toolbar_resume">&nbsp;' + btC.TL.FOOTER.FTR_RESUME + '</span>' +
                    '<span id="toolbar_nomore_p" class="ef_btn_toolbar bt_img_toolbar_download_not">&nbsp;' + btC.TL.FOOTER.FTR_NO_MORE_WORK  + '</span>' +
                    '<span id="toolbar_allow_p" class="ef_btn_toolbar bt_img_toolbar_download">&nbsp;' + btC.TL.FOOTER.FTR_ALLOW_WORK + '</span>' +
                    '<span id="toolbar_update_p" class="ef_btn_toolbar bt_img_toolbar_retry">&nbsp;' + btC.TL.FOOTER.FTR_UPDATE + '</span>';
//                    '<span id="toolbar_info_p" class="ef_btn_toolbar bt_img_toolbar_info">&nbsp;'+ btC.TL.FOOTER.FTR_INFO + '</span>' +
//                    '<span id="toolbar_www" class="ef_btn_toolbar bt_img_toolbar_www">&nbsp;' + 'WWW' + '</span>';
    return toolbar;
}

function getToolbarMessages()
{
    var toolbar =   '<span id="toolbar_clipboard_m" class="ef_btn_toolbar bt_img_toolbar_clipboard">&nbsp;' + btC.TL.FOOTER.FTR_CLIPBOARD + '</span>';  
    return toolbar;
}

function getToolbarHistory()
{
    var toolbar =   '<span id="toolbar_clipboard_h" class="ef_btn_toolbar bt_img_toolbar_clipboard">&nbsp;' + btC.TL.FOOTER.FTR_CLIPBOARD + '</span>';  
    return toolbar;
}

function getToolbarComputers()
{
    var toolbar =   '<span id="toolbar_abort_c" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;' + btC.TL.FOOTER.FTR_DELETE + '</span>';
    return toolbar;
}

function getToolbarComputersAuth()
{
    var toolbar =   '<span id="toolbar_cc_config_c" class="ef_btn_toolbar bt_img_toolbar_list">&nbsp;'+ btC.TL.FOOTER.FTR_CC_CONFIG + '</span>' +
                    '<span id="toolbar_abort_c" class="ef_btn_toolbar bt_img_toolbar_cancel">&nbsp;' + btC.TL.FOOTER.FTR_DELETE + '</span>' +
                    '<span id="toolbar_info_c" class="ef_btn_toolbar bt_img_toolbar_info">&nbsp;'+ btC.TL.FOOTER.FTR_INFO + '</span>';
                    
    return toolbar;
}

function getToolbarEditComputers()
{
    var toolbar =  '<span id="toolbar_ok_c" class="ef_btn_toolbar bt_img_toolbar_ok">&nbsp;' + btC.TL.FOOTER.FTR_UPDATE_CHANGES + '</span>'
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
              title: btC.TL.BOX_DELETE_FILTER.BX_FILTER_TITLE,
              message: btC.TL.BOX_DELETE_FILTER.BX_FILTER_MESSAGE,
              detail: btC.TL.BOX_DELETE_FILTER.BX_FILTER_DETAIL
            })
            return;
    }

    let txtDetail = "";
    let len = selected.length;
    for (i=0;i<len;i++)
    {
        txtDetail += selected[i] + "\r\n";        
    }
    txtDetail += "\r\n";
    txtDetail += btC.TL.BOX_ABORT_TASK.BX_ABORT_DETAIL;
    txtDetail = txtDetail.replaceAll(btC.SEPERATOR_SELECT,", ")
    dialog.showMessageBox(mainWindow,
    {
      title: btC.TL.BOX_ABORT_TASK.BX_ABORT_TITLE,
      message: btC.TL.BOX_ABORT_TASK.BX_ABORT_MESSAGE,
      detail: txtDetail,
      buttons: [btC.TL.BOX_GENERAL.BX_CANCEL, btC.TL.BOX_GENERAL.BX_YES],
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
          title: btC.TL.BOX_DETACH_PROJECT.BX_DETACH_TITLE, 
          message: btC.TL.BOX_DETACH_PROJECT.BX_DETACH_MESSAGE,
          detail: btC.TL.BOX_DETACH_PROJECT.BX_DETACH_DETAIL,
          buttons: [btC.TL.BOX_GENERAL.BX_CANCEL, btC.TL.BOX_GENERAL.BX_YES],   
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
          title: btC.TL.BOX_RESET_PROJECT.BX_RESET_TITLE,
          message: btC.TL.BOX_RESET_PROJECT.BX_RESET_MESSAGE,
          detail: btC.TL.BOX_RESET_PROJECT.BX_RESET_DETAIL,
          buttons: [btC.TL.BOX_GENERAL.BX_CANCEL, btC.TL.BOX_GENERAL.BX_YES],  
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
//        connectionsShadow.init();        
        for (let s=0;s<selected.len.length;s++)  
        {
            let res = selected[s].split(btC.SEPERATOR_SELECT);
            let computerName = "";
            let url = "";
            if (res.length > 2)
            {
                computerName = res[1];
                url = res[2];
            }
//            connectionsShadow.init();
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
//        connectionsShadow.flushSendArray();
    } catch (error) {
        logging.logError('Toolbar,detachProjectYes', error);        
    }
}

function wwwShow(gb)
{
    try {      
        let selected = gb.rowSelect.projects.rowSelected;
        for (let s=0;s<selected.length;s++)  
        {
            let res = selected[s].split(btC.SEPERATOR_SELECT);
            let computerName = "";
            let url = "";
            if (res.length > 2)
            {
                computerName = res[1];
                url = res[2];
                for (var c=0; c<connections.length;c++)
                {
                    let con = connections[c];
                    if (con.computerName === computerName)
                    {
                        if (con.auth === true)
                        {
                            let project = con.projects.project;
                            if (project !== void 0)
                            {
                                let len = project.length;
                                for (i=0;i<len;i++)
                                {
                                    if (project[i].master_url[0] === url)
                                    {
                                        let projectName = project[i].project_name[0];
                                        let html = "<ul>";
                                        let guiUrl = project[i].gui_urls[0].gui_url;
                                        if (guiUrl !== void 0)
                                        {
                                            for (g=0;g<guiUrl.length;g++)
                                            {
                                                let gu = guiUrl[g];
                                                let name = gu.name[0];
                                                let description = gu.description[0];
                                                let url = gu.url[0]
                                                let link = '<span style="font-size:20px"><a href="'+ url + '" target="_blank">' + description + '</a></span>';
                                                html += '<li><span style="font-size:30px">' + name + "<span></li>";
                                                html += link + "<br><br>";
                                            }
                                            html += '</ul>';
                                            const Www = require('./www');
                                            const www = new Www();
                                            www.show(gb,projectName,html)

                                            return;
                                        }
                                    }
                                } 
                            }                                                        
                        }
                    }
                }
            }            
        }
    } catch (error) {
        logging.logError('Toolbar,wwwShow', error);        
    }  
}

function task(gb,selected,request,what)
{
    try {
//        connectionsShadow.init();
        let connections = gb.connections;
        for (var i=0; i<selected.length;i++)
        {
            var res = selected[i].split(btC.SEPERATOR_SELECT);
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
//        connectionsShadow.flushSendArray();
    } catch (error) {
        logging.logError('Toolbar,Task', error);       
    }    
}

function findFilter(selected)
{
    try {
        for (var i=0; i<selected.length;i++)
        {
            var res = selected[i].split(btC.SEPERATOR_SELECT);
            if (res.length === 3) 
            {
                if (res[2].indexOf(btC.SEPERATOR_FILTER) >= 0) return true;
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
    // flush in connections.js
}

function sendCommandTransfer(con,request, url, wu)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n<filename>"+ wu + "</filename>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req); 
    // flush in connections.js    
}

function sendCommandProject(con,request, url)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req);
    // flush in connections.js    
}

function reportCompleted(gb)
{
    let url = "";
    try {
//        connectionsShadow.init();
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
                    // flush in connections.js
                }
            }
        }
//        connectionsShadow.flushSendArray();    
    } catch (error) {
        logging.logError('Toolbar,reportCompleted', error);    
    }   
}

function transferAll(gb)
{
    try {
//        connectionsShadow.init();
        for (var i=0;i<gb.connections.length;i++)          
        {
            let con = connections[i];
            if (con.auth)
            {
                let transfer = con.transfers;
                if (transfer !== null)
                {
                    let ft = transfer.file_transfer;
                    for (let t=0;t<ft.length;t++)
                    {
                        url = ft[t].project_url;
                        wu = ft[t].name;
                        sendCommandTransfer(con,"retry_file_transfer", url[0], wu[0]);
                        // flush in connections.js
                    }
                }
            }
        }
//        connectionsShadow.flushSendArray();         
    } catch (error) {
        logging.logError('Toolbar,transferAll', error);           
    }
}


function clipboardMessages(selected,connections)
{
    try {
        let msg = "";
        let len = selected.lenght;
        if (len === 0) return;

        let res = selected[0].split(btC.SEPERATOR_SELECT);
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
                        res = selected[i].split(btC.SEPERATOR_SELECT);
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

function clipboardTasks(selected, gb)
{
    try {
        let selId = "";
        let len = selected.lenght;
        if (len === 0) return;

        let hTxt = "<table><tr>"
        hTxt += "<th>" + btC.TL.TAB.T_GENERAL_COMPUTER + "</th><th>" + btC.TL.TAB.T_GENERAL_PROJECT + "</th><th>" + btC.TL.TAB.T_GENERAL_APPLICATION + "</th>";
        hTxt += "<th>" + btC.TL.TAB.T_GENERAL_NAME + "</th><th>" + btC.TL.TAB.T_GENERAL_ELAPSED + "</th><th>" + btC.TL.TAB.T_GENERAL_PROGRESS + "</th>";
        hTxt += "<th>" + btC.TL.TAB.T_TASK_TIMELEFT + "</th><th>" + btC.TL.TAB.T_TASK_DEADLINE + "</th><th>" + btC.TL.TAB.T_GENERAL_STATUS + "</th>";
        hTxt += "<th>" + btC.TL.STATUS.S_FILTER_TASKS + "</th></tr>";
        let table = gb.currentTable.resultTable                                
        for (let t=0;t<table.length;t++)
        {
            let item = table[t];
            { 
                if (item.filtered)
                {
                    let rTable = item.resultTable;
                    selId = item.wuName + btC.SEPERATOR_SELECT + item.computerName + btC.SEPERATOR_SELECT + item.projectUrl + item.app + btC.SEPERATOR_FILTER + item.computerName; // filter itself
                    hTxt += clipboardTasksAdd(item,selected,selId,true)

                    for (let tf=0;tf<rTable.length;tf++) // items in the filter
                    {
                        let item = rTable[tf];
                        selId = item.wuName + btC.SEPERATOR_SELECT + item.computerName + btC.SEPERATOR_SELECT + item.projectUrl;
                        hTxt += clipboardTasksAdd(item,selected,selId)
                    }
                    continue;
                }
                selId = item.wuName + btC.SEPERATOR_SELECT + item.computerName + btC.SEPERATOR_SELECT + item.projectUrl;
                hTxt += clipboardTasksAdd(item,selected,selId)
            }
        }
        hTxt += "</table>"
        let txt = stripHtml(hTxt);
        clipboard.write({
            text: txt,
            html: hTxt
        })
    } catch (error) {
        logging.logError('Toolbar,clipboardMessages', error);    
    }
}

function clipboardTasksAdd(item, selected, selId, filter)
{
    let hTxt = "";
    for (let s=0;s<selected.length;s++ )                            
    {
        if (selected[s] == selId)
        {
            hTxt += "<tr><td>";
            hTxt += item.computerName + "</td><td>";
            hTxt += item.project + "</td><td>";
            hTxt += item.app + "</td><td>";
            hTxt += item.wuName + "</td><td>";
            let elapsedS = functions.getFormattedTimeInterval(item.elapsed);
            hTxt += elapsedS + "</td><td>";
            let cpuS = item.fraction.toFixed(2) + "%";
            hTxt += cpuS + "</td><td>";  
            let timeLeftS = functions.getFormattedTimeInterval(item.remaining);
            hTxt += timeLeftS + "</td><td>";  
            let deadlineS = functions.getFormattedTime(item.deadline);
            hTxt += deadlineS + "</td><td>";                                                         
            hTxt += item.statusS;
            if (filter)
            {
                hTxt +=  "</td><td>" + item.wu;
            }
            hTxt += "</td></tr>";
        }
    }
    return hTxt;
}

function clipboardHistory(selected, gb)
{
    try {
        let len = selected.lenght;
        if (len === 0) return;

        let hTxt = "<table><tr>"
        hTxt += "<th>" + btC.TL.TAB.T_GENERAL_COMPUTER + "</th><th>" + btC.TL.TAB.T_GENERAL_PROJECT + "</th><th>" + btC.TL.TAB.T_GENERAL_APPLICATION + "</th>";
        hTxt += "<th>" + btC.TL.TAB.T_GENERAL_NAME + "</th><th>" + btC.TL.TAB.T_GENERAL_ELAPSED + "</th><th>" + btC.TL.TAB.T_GENERAL_CPU + "</th><th>";
        hTxt += btC.TL.TAB.T_HISTORY_COMPLETED + "</th><th>" + btC.TL.TAB.T_GENERAL_STATUS + "</th></tr>";
        let table = gb.currentTable.historyTable
                                            
        for (let t=0;t<table.length;t++)
        {
            let item = table[t];
            { 
                let selId = item.result + btC.SEPERATOR_SELECT + item.computerName + btC.SEPERATOR_SELECT + item.projectUrl;
                for (let s=0;s<selected.length;s++ )                            
                {
                    if (selected[s] == selId)
                    {
                        hTxt += "<tr><td>";
                        hTxt += item.computerName + "</td><td>";
                        hTxt += item.projectName + "</td><td>";
                        hTxt += item.appNameUF + "</td><td>";
                        hTxt += item.result + "</td><td>";
                        let elapsedS = functions.getFormattedTimeInterval(item.elapsed);
                        hTxt += elapsedS + "</td><td>";
                        let cpu = (item.cpuTime/item.elapsed) * 100;
                        if (cpu > 100) cpu = 100;
                        let cpuS = cpu.toFixed(2) + "%";
                        hTxt += cpuS + "</td><td>";
                        let d = new Date(item.completedTime*1000);
                        d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
                        let options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                        let timeS = d.toLocaleDateString("en-US", options);
                        hTxt += timeS + "</td><td>";
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
                        hTxt += status + "</td>";
                        hTxt += "</td></tr>";
                    }
                }
            }          
        }
        hTxt += "</table>"
        let txt = stripHtml(hTxt);
        clipboard.write({
            text: txt,
            html: hTxt
        })
    } catch (error) {
        logging.logError('Toolbar,clipboardHistory', error);    
    }
}

function suspendAtCheckpoint(gb,selected)
{
    try{
        for (let s=0;s<selected.length;s++) 
        {
            let res = selected[s].split(btC.SEPERATOR_SELECT);
            if (res.length !== 3) return;
            let computer = res[1];
            let connections = gb.connections;
            for (let c=0; c<connections.length;c++)
            {
                if (connections[c].computerName === computer)
                {
                    suspendAtCheckpointAdd(connections[c],res[0],res[2])
                }
            }   
        }
    } catch (error) {
        logging.logError('Toolbar,suspendAtCheckpoint', error);    
    }
}


function suspendAtCheckpointResume(gb,selected)
{
    try{
        for (let s=0;s<selected.length;s++) 
        {
            let res = selected[s].split(btC.SEPERATOR_SELECT);
            if (res.length !== 3) return;
            let computer = res[1];
            let connections = gb.connections;
            for (let c=0; c<connections.length;c++)
            {
                let con = connections[c];
                if (con.computerName === computer)
                {
                    let sc = con.suspendCheckpoint;
                    if (sc == void 0)
                    {
                        return;
                    }
                    let len = sc.length
                    for (let i=0;i<len;i++)
                    {
                        let check = sc[i];
                        if (check.task == res[0])
                        {
                            if (check.url == res[2])
                            {
                                sc.splice(i, 1);
                                len = sc.length;
                                if (len == 0)                            
                                {
                                    con.suspendCheckpoint = void 0; 
                                    return;
                                }
                                i = 0;              // restart the for loop
                            }
                        }
                    }
                }
            }   
        }
    } catch (error) {
        logging.logError('Toolbar,suspendAtCheckpointResume', error);    
    }    
}

function suspendAtCheckpointAdd(con,task,url)
{
    try
    {
        let sc = null;
        if (con.suspendCheckpoint == void 0)
        {
            sc = [];
        }
        else
        {
            sc = con.suspendCheckpoint;
            // double?
            let len = sc.length
            for (let i=0;i<len;i++)
            {
                let check = sc[i];
                if (check.task == task)
                {
                    if (check.url == url)
                    {
                        // is double
                        return;
                    }
                }
            }
        }

        let check = new Object;
        check.task = task;
        check.url = url;
        check.present = false;
        check.checkPoint = -1;
        sc.push(check);
        con.suspendCheckpoint = sc;  
    } catch (error) {
        logging.logError('Toolbar,suspendAtCheckpointAdd', error);    
    } 
}

function stripHtml(txt)
{
    txt = txt.replaceAll("<table>","");
    txt = txt.replaceAll("</table>","");
    txt = txt.replaceAll("<tr>","");
    txt = txt.replaceAll("</tr>","\n");
    txt = txt.replaceAll("<th>","");    
    txt = txt.replaceAll("</th>","\t");    
    txt = txt.replaceAll("<td>","");    
    txt = txt.replaceAll("</td>","\t");    
    return txt;
}
