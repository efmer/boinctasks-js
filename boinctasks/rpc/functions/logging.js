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

const btConstants = require('./btconstants');

const os = require('os');
const { app } = require('electron')

var g_logMsg = "";
var g_logDebugMsg = "";
var g_logErrorMsg = "";

class Logging{
    setVersion(versionIn)
    {
        try {
            this.log(versionIn);
            this.logDebug(versionIn);        
            g_logErrorMsg = versionIn;
    
            let sys = "System running on platform: " + os.platform() + " ,architecture: " + os.arch();
            this.log(sys);
            this.logDebug(sys);
    
            let path = "Folder app: " + app.getPath("home");
            this.logDebug(path);        
            path = "Folder data: " + app.getPath("appData");
            this.logDebug(path);            
        } catch (error) {
            var ii = 1;
        }
    }

    log(msg)
    {
        try {
            var time = getTime();            
            g_logMsg += time + " " + msg + ".</br>";
        } catch (error) {
            var ii = 1;
        }   
    }

    logGet(type)
    {
        switch(type)
        {
            case btConstants.LOGGING_NORMAL:
                return g_logMsg;          
            case btConstants.LOGGING_DEBUG:
                return g_logDebugMsg;   
            case btConstants.LOGGING_ERROR:
                return g_logErrorMsg;     
            break;
        }
    }

    logTitle(type)
    {
        switch(type)
        {
            case btConstants.LOGGING_NORMAL:
                return "Logging"          
            case btConstants.LOGGING_DEBUG:
                return "Debug Logging";   
            case btConstants.LOGGING_ERROR:
                return "Error Logging";     
        }
        return "??";
    }

    logClear(type)
    {
        switch(type)
        {
            case btConstants.LOGGING_NORMAL:
                g_logMsg = "";
            break;
            case btConstants.LOGGING_DEBUG:
                g_logDebugMsg = "";
            break;
            case btConstants.LOGGING_ERROR:
                g_logErrorMsg = "";
            break;            
        }      
    }

    logDebug(msg)
    {
        try {
            var time = getTime();            
            g_logDebugMsg += time + " " + msg + ".</br>";    
        } catch (error) {
            var  ii =1;
        }        
    }

    logError(from,error)
    {
        try {
            var time = getTime();
            let msg = error.message;
            msg += "<br>" + error.stack;
            g_logErrorMsg += time + " Error: [" + from + "] " + msg + ".</br>"; 
        } catch (error) {
            var  ii =1;            
        }        
    }   

    logErrorMsg(from,msg)
    {
        msg = msg.replaceAll("<","&#60;")        
        msg = msg.replaceAll(">","&#62;")
        var time = getTime();
        g_logErrorMsg += time + " Error: [" + from + "] " + msg + ".</br>";     
    }
}

module.exports = Logging;

function getTime()
{
    try {

        var date = new Date();
        var txt = date.toLocaleTimeString();
        return txt;
    } catch (error) {
        var ii  = 1;
    }    
}