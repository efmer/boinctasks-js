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
const parseString = require('xml2js').parseString;

class State{
    getState(con)
    {
    try {   
        con.state = null;
        con.stateClass = null;
        con.stateClass = new ProcessState();
        con.stateClass.getState(con);
        let ii = 1;
        } catch (error) {
            logging.logError('State,getState', error);  
            con.auth = false;                        
        }
    }

    getAppUf(con, name)
    {
        con.stateClass = null;        
        let appUf = "???"
        try {
            let pos = con.cacheAppWu.indexOf(name);
            if (pos >= 0)
            {
                appUf = con.cacheAppAppUf[pos];                
                return appUf;
        }                
        } catch (error) {  
            logging.logError('State,getApp', error);              
        }
        con.needState = true;
        con.stateClass = null;
        return btC.INITIALIZING;
    }

    getApp(con, name)
    {
        con.stateClass = null;        
        let appNf = "??";
        try {
            let pos = con.cacheAppWu.indexOf(name);
            if (pos >= 0)
            {
                appNf = con.cacheAppApp[pos];
                return appNf;
            }    
        } catch (error) {  
            logging.logError('State,getAppRule', error);              
        }
        con.needState = true;
        con.stateClass = null;
        return appNf;
    }
    
    getProject(con, url)
    {
        //con.needState = true; //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< testing only 
        var project = "??";
        try {         
            con.stateClass = null;
            let pos = -1;
            // backup if the project mixes https and http, this might never happen....
            let urlS = url.split("//"); 
            if (urlS.length === 2)
            {
                let url2 = urlS[1];
                const ismatch = (element) => element.includes(url2);
                pos = con.cacheProjectUrl.findIndex(ismatch)
                if (pos >= 0)
                {
                    let ret = new Object();
                    ret.project = con.cacheProjectProject[pos];
                    ret.non = con.cacheProjectNon[pos]
                    return ret;
                }
                else
                {
                    project = btC.INITIALIZING;
                }
            }
        } catch (error) {
            logging.logError('State,getProject', error);              
        }
        con.needState = true;
        let ret = new Object();
        ret.project = project;
        ret.non = false;
        return ret;
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
                    let appName = con.state.app[i].user_friendly_name[0];
                    return appName;
                }
            }
            return app;
        } catch (error) {
            logging.logError('State,getAppName', error);          
        }
    }
}    

module.exports = State;

class ProcessState
{
    getState(con)
    {
        try 
        {
            con.client_callbackI = this.stateData;
            con.client_completeData = "";
            functions.sendRequest(con.client_socket, "<get_state/>\n");
        } catch (error) {
            logging.logError('State,getState', error);           
            this.modeState = 'errorc';
            this.error = error;
            this.stateClass = null;
        }        
    }

    stateData()
    {
        // this = con
        try 
        {
            if (this.client_completeData.indexOf('unauthorized') >=0)
            {
                this.con.auth = false;
            }                    
            else
            {
                let data = this.client_completeData;
                this.client_completeData = null;            
                this.stateClass.processState(this,data)
                data = null;
                this.stateClass = null;
            }
        } catch (error) {
            logging.logError('State,stateData', error);           
            this.modeState = 'errorc';
            this.error = error;
            this.stateClass = null;
        }
    } 

    processState(con, data)
    {
        try 
        {
            con.state = this.parseState(data);
            data = null;
            this.buildCache(con)
            con.needState = false;
            con.mode = "OK";
            return;
        } catch (error) {
            logging.logError('State,stateData', error);           
            this.modeState = 'errorc';
            this.error = error;
            this.stateClass = null;
    }        
    }

    parseState(xml)
    {
        let stateReturn = null;
        try {

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
    //                    return stateReturn;
                    }
                }
            }
            xml = null;
            result = null;
            });
            return stateReturn;            
        } catch (error) {
            logging.logError('State,parseState', error);          
            return null;
        }
    }

    buildCache(con)
    {
        // warning do not use [] on any object in con object this causes memory leaks
        try {
            if (con.state !== null)
            {
                let projectState = con.state.project; 
                for (var i =0; i< projectState.length; i++)
                {
                    let pState = projectState[i]
                    let url = pState.master_url[0];
                    let pos = con.cacheProjectUrl.indexOf(url);
                    if (pos < 0)
                    {
                        let pNon = false;
                        if (pState.non_cpu_intensive != void 0)
                        {
                            pNon = true;
                        }
                        let pName = pState.project_name[0];                    
                        if (pName.length > 1)
                        {
                            con.cacheProjectUrl.push(url);
                            con.cacheProjectProject.push(pName); 
                            con.cacheProjectNon.push(pNon);
                            logging.logDebug('buildCache add: ' + con.computerName + " URL: " + url + " -> " + pName);                                              
                        }
                        else
                        {
                            logging.logDebug('buildCache poject name short: ' + con.computerName + " URL: " + url + " -> " + pName); 
                        }                      
                    }
                }
  
                // update app cache
                
                if (con.state.workunit === void 0) return;
    
                for (let w =0; w< con.state.workunit.length; w++)
                {
                    let wuName = con.state.workunit[w].name[0];
                    let pos = con.cacheAppWu.indexOf(wuName);
                    if (pos < 0)
                    {                        
                        let appWu = con.state.workunit[w].app_name[0];
                        let app = con.state.app;
                        let appUf = "??";
                        let appNf = "??";
    
                        for (let i =0; i< app.length; i++)
                        {
                            let aName = app[i].name[0];
                            if (appWu === aName)
                            {
                                con.cacheAppWu.push(wuName);                                
                                appUf = app[i].user_friendly_name[0];
                                appNf = app[i].name[0];
                                con.cacheAppApp.push(appNf);
                                con.cacheAppAppUf.push(appUf);                                
                                break;
                            }                        
                        }
                    }
                }
                // check for cache wu that are no longer in state
                for (let c = con.cacheAppWu.length-1; c>=0 ; c--)
                {
                    let cache = con.cacheAppWu[c];
                    let bFound = false;
                    for (let w =0; w< con.state.workunit.length; w++)
                    {
                        let wu = con.state.workunit[w].name[0];
                        if (cache ==wu)
                        {
                            bFound = true;
                            break;
                        }
                    }
                    if (!bFound)
                    {
                        con.cacheAppWu.splice(c, 1)
                        con.cacheAppApp.splice(c, 1)
                        con.cacheAppAppUf.splice(c, 1)
                    }
                }        
            }
        } catch (error) {
            logging.logError('State,buildCache', error);              
        }  
    }

}
