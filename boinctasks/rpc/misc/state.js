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
const btConstants = require('../functions/btconstants');

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

    getApp(con, name, state)
    {
        var bFound = false;
        var appFriendly = " Initializing .....";
        try {
            if (con.state == null)
            {
                con.needState = true;
                 return appFriendly;
            }
            for (var w =0; w< con.state.workunit.length; w++)
            {
                var wuName = con.state.workunit[w].name[0];
                if (wuName == name)
                {
                   var appWu = con.state.workunit[w].app_name[0];
                   var app = con.state.app;
                    for (var i =0; i< app.length; i++)
                    {
                      var aName = app[i].name[0];
                      if (appWu === aName)
                      {
                        appFriendly = app[i].user_friendly_name[0];
                        return appFriendly;
                      }
                    }
                }
            }          
        } catch (error) {  
            logging.logError('State,getApp', error);              
        }
        if (!bFound)
        {
            con.needState = true;
        }
        return appFriendly;
    }
    
    getProject(con, url)
    {
        var bFound = false;

        var project = " Initializing .....";
        try {
          if (con.state == null) return project;          
          var projectState = con.state.project;
      
          for (var i =0; i< projectState.length; i++)
          {
            if (projectState[i]['master_url'][0] == url)
            {
                project = projectState[i]['project_name'][0];
                bFound = true;
                break;
            }
          }
        } catch (error) {
            logging.logError('State,getProject', error);              
        }
        if (!bFound)
        {
            con.needState = true;
        }        
        return project;
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
            let reply = result['boinc_gui_rpc_reply'];
            if (functions.isDefined(reply))
            {
                let stateArray = result['boinc_gui_rpc_reply']['client_state'];
                if (functions.isDefined(stateArray))
                {
                    stateReturn = stateArray[0];
                    return stateReturn;
                }
            }
        }
        return null;
        });
    } catch (error) {
        logging.logError('State,parseState', error);          
        return null;
    }
    return stateReturn
}

