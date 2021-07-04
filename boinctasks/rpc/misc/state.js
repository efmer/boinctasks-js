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
const btC = require('../functions/btconstants');

class State{
    getState(con)
    {
    try {    
        con.client_callbackI = stateData;
        con.client_completeData = "";            
        functions.sendRequest(con.client_socket, "<get_state/>\n");         
        } catch (error) {
            logging.logError('State,getState', error);  
            con.auth = false;                        
        }  
    }

    getAppUf(con, name)
    {
        var appUf = btC.INITIALIZING;
        try {
            if (con.cacheApp !== null)
            {
                let pos = con.cacheApp.wu.indexOf(name);
                if (pos >= 0)
                {
                    return con.cacheApp.appUf[pos];
                }
            }        
        } catch (error) {  
            logging.logError('State,getApp', error);              
        }
        con.needState = true;
        return appUf;
    }

    getApp(con, name)
    {
        var appNf = "";
        try {
            if (con.cacheApp !== null)
            {
                let pos = con.cacheApp.wu.indexOf(name);
                if (pos >= 0)
                {
                    return con.cacheApp.app[pos];
                }
            }        
        } catch (error) {  
            logging.logError('State,getAppRule', error);              
        }
        con.needState = true;
        return appNf;
    }
    
    getProject(con, url)
    {
        var project = btC.INITIALIZING;
        try {         
            if (con.cacheProject !== null)
            {
                let pos = con.cacheProject.url.indexOf(url);
                pos = -1;
                if (pos >= 0)
                {
                    return con.cacheProject.project[pos];
                }
                else
                {
                    // backup if the project mixes https and http, this might never happen....
                    let urlS = url.split("//"); 
                    if (urlS.length === 2)
                    {
                        let url2 = urlS[1];
                        const ismatch = (element) => element.includes(url2);
                        pos = con.cacheProject.url.findIndex(ismatch)
                        if (pos >= 0)
                        {
                            return con.cacheProject.project[pos];
                        }
                    }
                }
            }
        } catch (error) {
            logging.logError('State,getProject', error);              
        }
        con.needState = true;      
        return project;
    }

    getProjectUrl(con,project)
    {
        let url = "";
        try {
            let pos = con.cacheProject.project.indexOf(project);
            if (pos >=0)
            {
                url = con.cacheProject.url[pos];
            }
        } catch (error) {
            logging.logError('State,getProjectUrl', error);    
        }
        return url;
    }
    
    getAppName(con,app)
    {
        try {
            if (con.state == null) return app;  
            for (let i=0;i<con.state.app.length;i++)
            {
                let appc = con.state.app[i].name[0];
                if (appc === app)
                {
                    return con.state.app[i].user_friendly_name[0];
                }
            }
            return app;
        } catch (error) {
            logging.logError('State,getAppName', error);          
        }
    }
}    

module.exports = State;


function stateData()
{
    try 
    {
        if (this.client_completeData.indexOf('unauthorized') >=0)
        {
            this.con.auth = false;
        }                    
        else
        {
            this.state = parseState(this.client_completeData);
            buildCache(this)
            this.needState = false;
            this.mode = "OK";
            return;
        }    
    } catch (error) {
        logging.logError('State,stateData', error);           
        this.modeState = 'errorc';
        this.error = error;
    }
} 

function parseState(xml)
{
    let stateReturn = null;
    try {
        let parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
        if (functions.isDefined(result))
        {
            let reply = result.boinc_gui_rpc_reply;
            if (functions.isDefined(reply))
            {
                let stateArray = reply.client_state;
                if (functions.isDefined(stateArray))
                {
                    stateReturn = stateArray[0];
                    return stateReturn;
                }
            }
        }
        return stateReturn;
        });
    } catch (error) {
        logging.logError('State,parseState', error);          
        return null;
    }
    return stateReturn
}

function buildCache(con)
{
    try {
        if (con.state !== null)
        {
            let projectState = con.state.project;            
            
            if (con.cacheProject === null)
            {
                con.cacheProject = new Object
                con.cacheProject.url = [];
                con.cacheProject.project = [];
            }

            for (var i =0; i< projectState.length; i++)
            {
                let url = projectState[i].master_url[0];
                let pos = con.cacheProject.url.indexOf(url);
                if (pos < 0)
                {
                    let pName = projectState[i].project_name[0];                    
                    if (pName.length > 1)
                    {
                        con.cacheProject.url.push(url);
                        con.cacheProject.project.push(pName); 
                        logging.logDebug('buildCache add: ' + con.computerName + " URL: " + url + " -> " + pName);                                              
                    }
                    else
                    {
                        logging.logDebug('buildCache poject name short: ' + con.computerName + " URL: " + url + " -> " + pName); 
                    }
                }
            }

            // app 

            if (con.cacheApp === null)
            {
                con.cacheApp = new Object
                con.cacheApp.wu = [];
                con.cacheApp.app = []; 
                con.cacheApp.appUf = [];                
            }
            else
            {
                if (con.cacheApp.wu.length > 10000)
                {
                    con.cacheApp.wu = [];
                    con.cacheApp.app = []; 
                    con.cacheApp.appUf = [];                    
                }
            }

            if (con.state.workunit === void 0) return;

            for (let w =0; w< con.state.workunit.length; w++)
            {
                let wuName = con.state.workunit[w].name[0];
                let pos = con.cacheApp.wu.indexOf(wuName);
                if (pos < 0)
                {
                    con.cacheApp.wu.push(wuName);
                    let appWu = con.state.workunit[w].app_name[0];
                    let app = con.state.app;
                    let appUf = "";
                    let appNf = "";

                    for (let i =0; i< app.length; i++)
                    {
                        let aName = app[i].name[0];
                        if (appWu === aName)
                        {
                            appUf = app[i].user_friendly_name[0];
                            appNf = app[i].name[0];
                            break;
                        }                        
                    }
                    con.cacheApp.app.push(appNf);
                    con.cacheApp.appUf.push(appUf);
                } 
            }
        }
    } catch (error) {
        logging.logError('State,buildCache', error);              
    }  
}