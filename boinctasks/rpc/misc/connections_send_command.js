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
let gSendArray = [];
let gSendArrayLock = false;
let gSendArrayTimeout = 0;
let gSendTimeout = 0;

class ConnectionsSend
{
    addSendArray(con,req)
    {
        try {
            gSendArray.push(con);
            gSendArray.push(req);
        } catch (error) {
            logging.logError('Connections_send_command,addSendArray', error);           
        }
    }

    SendArray()
    { 
        try {
            let time = Date.now();
            if (gSendArray.length == 0)
            {
                return;
            }
            gSendArrayLock = true;
            gSendArrayTimeout = time + 2000; // locked for 2 seconds
            sendArrayNext("first");
        } catch (error) {
            logging.logError('Connections_send_command,SendArray', error);           
        }        
    }

    busy()
    {
        try {
            if (gSendArrayLock)
            {
                let time = Date.now();            
                if (time > gSendArrayTimeout) 
                {
                    let dTime = gSendArrayTimeout - time
                    logging.logDebug("Connections_send_command,busy, unlocked:" + dTime + " mSec");
                    gSendArrayLock = false;
                }
                // unlock after timeout.            
            }

            return gSendArrayLock;
        } catch (error) {
            logging.logError('Connections_send_command,busy', error);           
        }      
        return false;   
    }

}
module.exports = ConnectionsSend;

function sendArrayNext(event)
{
    try {
        if (event != "first")
        {
            if (!this.auth)
            {
                logging.logDebug("Connections_send_command,sendArrayNext, not athenticated " + this.ip);                               
                gSendArray = [];
                return;
            }

            if (functions.isDefined(this.client_callbackS))
            {
                this.client_callbackS('data');
            }
            if (this.client_completeData.indexOf("success") < 0)
            {
                let msg = "No success: " + this.client_completeData;
                logging.logErrorMsg('Connections_send_command,sendArrayNext,data', msg);
            }
        }
        
        let len = gSendArray.length;
        if (len == 0)
        {
            gSendArrayLock = false;
            return;            
        }

        sendSingle(gSendArray[0],gSendArray[1]);
        gSendArray.splice(0, 2);        
    } catch (error) {
        logging.logError('Connections_send_command,sendArrayNext', error);        
    }
}

function sendSingle(con, req)
{
    try {
        con.sendArraytoSend = req;   
        if (con.auth)
        {
            con.client_callbackI = sendArrayNext;
            con.client_completeData = "";
            functions.sendRequest(con.client_socket, con.sendArraytoSend); 
        }
        else
        {
            logging.logDebug("Connections_send_command,sendSingle, not athenticated " + con.ip);                               
            gSendArray = [];                
        }
    } catch (error) {
        logging.logError('Connections_send_command,sendSingle', error);        
    }
}