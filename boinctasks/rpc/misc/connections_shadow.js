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

const Logging = require('../functions/logging');
const logging = new Logging();
const Functions = require('../functions/functions');
const functions = new Functions();

// WARNING, connections.js flushes the array by calling flushSendArray, this should be the only place that flushes the array.
let gSendArrayShadow = [];
let gSendArrayShadowLock = false;
let gSendArrayShadowTimeout = 0;

class ConnectionsShadow
{
    cloneConnection(gb)
    {
        clone(gb)
    }

    init()
    {
//        gSendArrayShadow = [];
    }

    addSendArray(con,req)
    {
        try {
            gSendArrayShadow.push(con.shadow);
            gSendArrayShadow.push(req);            
        } catch (error) {
            logging.logError('ConnectionsShadow,addSendArray', error);           
        }

    }

    flushSendArray()
    {
        if (gSendArrayShadow.length == 0)
        {
            return;
        }
        let time = Date.now();
        if (gSendArrayShadowLock)
        {
            // already in progress
            if (time < gSendArrayShadowTimeout) 
            {
                let dTime = gSendArrayShadowTimeout - time
                logging.logDebug("ConnectionsShadow,sendArrayNextShadow, locked:" + dTime + " mSec");
                return; // locked do nothing;
            }
            // unlock after timeout.
        }
        gSendArrayShadowLock = true;
        gSendArrayShadowTimeout = time + 5000; // locked for 5 seconds
        sendArrayNextShadow("flush");
    }

}
module.exports = ConnectionsShadow;

function clone(gb)
{
    try {
        for(let i=0; i<gb.connections.length;i++)        
        {
            let con = gb.connections[i];
            let conS = new Object;
            conS.computerName = con.computerName;
            conS.ip = con.ip;
            conS.port = con.port;
            conS.passWord = con.passWord;
            conS.client_socket = null;
            conS.auth = false;
            conS.authTimeout = 0;
            conS.lostConnection = false;
            conS.error = '';
            conS.isShadow = true;
            con.shadow = conS;
        }
    } catch (error) {
        logging.logError('ConnectionsShadow,clone', error);      
    }
}

// send in sync after authenticated


function sendArrayNextShadow(event)
{
    try {
        let bFirst;
        if (event == "flush")  // flush = the first
        {
            bFirst = true;
        }
        else
        {
            if (!this.auth)
            {
                logging.logDebug("ConnectionsShadow,sendArrayNextShadow, not athenticated " + this.ip);                               
                gSendArrayShadow = [];
                return;
            } 

            if (functions.isDefined(this.client_callbackS))
            {
                this.client_callbackS('data');
            }
            if (this.client_completeData.indexOf("success") < 0)
            {
                let msg = "No success: " + this.client_completeData;
                logging.logErrorMsg('ConnectionsShadow,sendArrayNextShadow,data', msg);
            }
            bFirst = false;
        }

        let len = gSendArrayShadow.length;
        if (len == 0)
        {
            connectSocketReset(this);
            return;            
        }

        sendSingleShadow(bFirst, gSendArrayShadow[0],gSendArrayShadow[1]);
        gSendArrayShadow.splice(0, 2);        
    } catch (error) {
        logging.logError('ConnectionsShadow,sendArrayNextShadow', error);        
    }
}

function sendSingleShadow(bFirst, con, req)
{
    try {
        con.sendArraytoSend = req;   
        if (bFirst)
        {   
            if(con.clientClass == null)
            {        
                // we must create a socket for every connection
                const BtSocket  = require('./socket');
                const btSocket = new BtSocket();        
                con.clientClass = btSocket;
                con.clientClass.socket(con);            
            }

            const Authenticate = require('./authenticate');
            const athenticate = new Authenticate();
            con.client_callback = connectAuthShadow;        
            athenticate.authorize(con);   
        }
        else
        {
            if (con.auth)
            {
                connectAuthShadow(con);
            }
            else
            {
                logging.logDebug("ConnectionsShadow,sendSingleShadow, not athenticated " + con.ip);                               
                gSendArrayShadow = [];                
            }            
        }
         
         
    } catch (error) {
        logging.logError('ConnectionsShadow,sendSingleShadow', error);        
    }
}

function connectSocketReset(con)
{
    try {
        con.clientClass = null;
        gSendArrayShadowLock = false;
        con.auth = false;
    } catch (error) {
        logging.logError('SendArray,connectSocketReset', error);         
    }
}

function connectAuthShadow(con,status)
{
    try {   
        if (status == "Failed")
        {
            connectSocketReset(con);
            gSendArrayShadow = [];            
            return;
        }
        con.client_callbackI = sendArrayNextShadow;
        con.client_completeData = "";
        functions.sendRequest(con.client_socket, con.sendArraytoSend);            
    } catch (error) {
        logging.logError('SendArray,connectAuthShadow', error);         
    }
}