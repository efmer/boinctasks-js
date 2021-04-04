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

let gSendArrayShadow = [];

class ConnectionsShadow
{
    cloneConnection(gb)
    {
        clone(gb)
    }

    init()
    {
        gSendArrayShadow = [];
    }

    addSendArray(gb,con,req)
    {
        try {
            for (let i=0;i<gb.connections.length;i++)
            {
                if (con.computerName === gb.connectionsShadow[i].computerName)
                {
                    gSendArrayShadow.push(gb.connectionsShadow[i]);
                    gSendArrayShadow.push(req);
                }
            }            
        } catch (error) {
            logging.logError('ConnectionsShadow,addSendArray', error);           
        }

    }

    flushSendArray()
    {
        sendArrayNextShadow(null);
    }

}
module.exports = ConnectionsShadow;

function clone(gb)
{
    try {
        gb.connectionsShadow = []
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
            gb.connectionsShadow.push(conS);
        }
    } catch (error) {
        logging.logError('ConnectionsShadow,clone', error);      
    }
}

// send in sync after authenticated


function sendArrayNextShadow(event)
{
    try {
        if (event != null)
        {
            if (functions.isDefined(this.client_callbackS))
            {
                this.client_callbackS('data');
            }
        }

        if (gSendArrayShadow.length == 0)
        {
            return;            
        }

        sendSingleShadow(gSendArrayShadow[0],gSendArrayShadow[1]);
        gSendArrayShadow.splice(0, 2);        
    } catch (error) {
        logging.logError('ConnectionsShadow,sendArrayNextShadow', error);        
    }
}

function sendSingleShadow(con, req)
{
    try {
        con.sendArraytoSend = req;        
        if(con.clientClass == null)
        {        
            // we must create a socket for every connection
            const BtSocket  = require('./socket');
            const btSocket = new BtSocket();        
            con.clientClass = btSocket;
            con.clientClass.socket(con);            
        }
        if (con.auth)
        {
            connectAuthShadow(con);
            return;
        }
         
        const Authenticate = require('./authenticate');
        const athenticate = new Authenticate();
        con.client_callback = connectAuthShadow;        
        athenticate.authorize(con);            
    } catch (error) {
        logging.logError('ConnectionsShadow,sendSingleShadow', error);        
    }
}

function connectAuthShadow(con)
{
    try {
        con.client_callbackI = sendArrayNextShadow;
        con.client_completeData = "";
        functions.sendRequest(con.client_socket, con.sendArraytoSend);            
    } catch (error) {
        logging.logError('SendArray,connectAuthShadow', error);         
    }
}