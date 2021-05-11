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

const crypto = require('crypto')
const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const State = require('../misc/state');
const conState = new State();
const ReadWrite  = require('../functions/readwrite');
const btConstants = require('../functions/btconstants');
const readWrite = new ReadWrite();

class History{
    getHistory(con, btSetting)
    {
        try 
        {
            con.historyDelete = btSetting.historyDelete;   
            con.client_callbackI = historyData;
            con.client_completeData = "";
            functions.sendRequest(con.client_socket, "<get_old_results/>");            
        } catch (error) {
            logging.logError('History,getHistory', error);               
            this.mode = 'errorc';
            this.error = error;
        }  
    }

    read(con)
    {
        readHistory(con);
    }
}
module.exports = History;

function historyData()
{
    try 
    {
        let history = parseHistory(this.client_completeData);
        if (history === null)
        {
            getCount(this);
            getProjectName(this);
            this.mode = "empty"; 
            return;
        }
        historyAdd(this, this.state, history)
        getCount(this);
        getProjectName(this);      
        this.mode = "OK";             
    } catch (error) {
        logging.logError('History,historyData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 

function parseHistory(xml)
{
    var historyReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (functions.isDefined(result))
            {
                let historyArray = result['boinc_gui_rpc_reply']['old_results'];
                if (functions.isDefined(historyArray))
                {
                    if (functions.isDefined(historyArray[0].old_result) )
                    {
                        historyReturn = historyArray[0].old_result;
                        return historyReturn;
                    }
                }
            }
        });
    } catch (error) {
        logging.logError('History,parseHistory', error);         
    }
    return historyReturn;
}

function historyAdd(con, state, historyArray)
{      
    try 
    {
        if (con.history === null)
        {
            con.history = new Object();
            con.history.count = 0;
            con.history.hash = []
            con.history.table = [];
        }
        con.history.count++;
        if (con.history.count === 2) validate(con);
        if (con.history.count > 60) con.history.count = 0;
        
        con.history.resultCount = 0;
        con.history.changed = false;
        for (let i=0; i< historyArray.length; i++)
        {
            let item = historyArray[i];
            let projectUrl = item.project_url[0];
            let result = item.result_name[0];
            let hash = crypto.createHash('md5').update(projectUrl+result).digest("hex");
            let appName  = item.app_name[0];
            let appNameUF= appName;
            
            let found = con.history.hash.indexOf(hash);
            if (found >= 0)
            {
               continue; // already there
            }
            con.history.changed = true;
            let newItem = new Object();
            newItem.computerName = con.computerName;
            newItem.result = result;
            newItem.exit = parseInt(item.exit_status[0]);
            newItem.elapsed = item.elapsed_time[0];
            newItem.cpuTime = item.cpu_time[0];
            newItem.completedTime = item.completed_time[0];
            newItem.createTime = item.create_time[0];
            let projectName = "";
            if (state != null)
            {
                projectName = conState.getProject(con,projectUrl)
                appNameUF = conState.getAppName(con, appName);
            }  
            newItem.appName = appName;
            newItem.appNameUF = appNameUF;
            newItem.projectUrl = projectUrl;            
            newItem.projectName = projectName;
            con.history.table.push(newItem);
            con.history.hash.push(hash);
        }
        if (con.history.changed)
        {
            deleteOld(con);
            historyWrite(con,con.history.table);
        }

        
    } catch (error) {
        logging.logError('History,historyAdd', error);
    }        
}

function getCount(con)
{
    if (functions.isDefined(con.history))
    {
        if(functions.isDefined(con.history.table))
        {
            con.history.resultCount = con.history.table.length;
        }
    }
}

function getProjectName(con)
{
    if (con.state === null) return;
    if (con.history === null) return;

    try {
        let table = con.history.table
        for (let i=0; i< table.length; i++)
    
        if (table[i].projectName === "")
        {
            let item = table[i];
            item.projectName = conState.getProject(con,item.projectUrl)
            item.appNameUF = conState.getAppName(con, item.appName);
        }        
    } catch (error) {
        logging.logError('History,getProjectName', error);             
    }
}

function historyWrite(con, history)
{
    try {
        let computer = convertToValidFilename(con.computerName.toLowerCase());
        backupWrite("settings\\history",computer,history);
    } catch (error) {
        logging.logError('History,historyWrite', error);      
    }
}

function convertToValidFilename(string) {
    return (string.replace(/[\/|\\:*?"<>]/g, " "));
}

function backupWrite(folder, name, data)
{
    try {
        let fn = name + ".json";
        let copy1 = name + "_backup1.json";
        let copy2 = name + "_backup2.json";
        let copy3 = name + "_backup3.json";    
        readWrite.rename(folder,copy2,copy3);
        readWrite.rename(folder,copy1,copy2);
        readWrite.rename(folder, fn,copy1);
        let dataJ = JSON.stringify(data);
        readWrite.write(folder, fn, dataJ);        
    } catch (error) {
        logging.logError('History,backupWrite', error);        
    }
}

function readHistory(con)
{
    try {
        let name = convertToValidFilename(con.computerName.toLowerCase());    
        let fn = name + ".json";
        let data = "";
        try {
            data = JSON.parse(readWrite.read("settings\\history", fn));
        } catch (error) {
            data = "";
        }
        if (data === "")
        {
            try {
                fn = name + "_backup1.json";
                data = JSON.parse(readWrite.read("settings\\history", fn));   
            } catch (error) {
                data = "";
            } 
            if (data === "")       
            {
                try {
                    fn = name + "_backup2.json";
                    data = JSON.parse(readWrite.read("settings\\history", fn));   
                } catch (error) {
                    data = "";
                }   
                if (data === "")       
                {
                    try {
                        fn = name + "_backup3.json";
                        data = JSON.parse(readWrite.read("settings\\history", fn));   
                    } catch (error) {
                        data = "";
                    }             
                }                      
            }
        }

        if (data !== null)
        {
            if (data.length > 0)
            {
                con.history = new Object();
                con.history.count = 0;
                con.history.table = data;
                con.history.hash = [];
                // rebuild the hash table that wasn't stored.
                for (let i=0; i< data.length; i++)
                {
                    let item = data[i];
                    let projectUrl = item.projectUrl;
                    let result = item.result;
                    let hash = crypto.createHash('md5').update(projectUrl+result).digest("hex");
                    con.history.hash.push(hash);
                }
            }
        }
    } catch (error) {
        logging.logError('History,readHistory', error);         
    }
}

// oldest are on top of the table.
function deleteOld(con)
{
    if (con.history === null)  return;
    let last = -1;
    try {
        let present = Date.now() / 1000;
        let days = parseInt(con.historyDelete) + 1;
        let daysD = present - (days * 86400);
        let table = con.history.table;
        for (let i=0; i<table.length;i++)
        {
            if (table[i].completedTime < daysD)
            {
                last = i;
            }
        }
        if (last > 0)   
        {
            table.splice(0,last);
            con.history.hash.splice(0,last);
        }
    } catch (error) {
        logging.logError('History,deleteOld', error);         
    }
    var ii =1;
}

function validate(con)
{
    try {
        let history = con.history;
        for (let i=0;i<history.table.length;i++)
        {
            let item = history.table[i];
            if (item.projectName === btConstants.INITIALIZING)
            {
                history.changed = true;
                let projectName = conState.getProject(con,item.projectUrl)
                item.projectName = projectName;
    
            }
        }        
    } catch (error) {
        logging.logError('History,validate', error);          
    }
}