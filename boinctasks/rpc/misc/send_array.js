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
const BtSocket  = require('./socket'); 
const Authenticate = require('./authenticate');
const athenticate = new Authenticate();

gSendArray = [];
gLastClient = null;

// use connections shadow whenever you can

class SendArray
{
    addSendArray(conIn,send)
    {
        let con = new Object();
        con.ip = conIn.ip;
        con.computerName = conIn.computerName;        
        con.port = conIn.port;
        con.passWord = conIn.passWord;
        con.sendArraytoSend = send;
        gSendArray.push(con);
    }

    send(conIn,send, callback=null) 
    {
        let con = new Object();
        con.ip = conIn.ip;
        con.computerName = conIn.computerName;        
        con.port = conIn.port;
        con.passWord = conIn.passWord;
        con.sendArraytoSend = send;
        con.client_callbackS = callback;
        con.conIn = conIn;
        gSendArray = [];

        sendSingle(con);
        return con;
    }    

    flushSendArray()
    {
        sendArrayNext(null);
    }
}
module.exports = SendArray;

function sendSingle(con)
{
    try {
        con.client_socket = new BtSocket();  
        con.client_socket.socket(con);
        con.client_callback = sendArrayAuthenticated;
        athenticate.authorize(con); //connectAuth);        
    } catch (error) {
        logging.logError('SendArray,sendSingle', error);        
    }
}

function sendArrayAuthenticated(con)
{
    try {
        con.client_callbackI = sendArrayNext;
        con.client_completeData = "";
        functions.sendRequest(con.client_socket, con.sendArraytoSend);            
    } catch (error) {
        logging.logError('SendArray,sendArrayAuthenticated', error);         
    }
}

function sendArrayNext(event)
{
    try {
        if (event != null)
        {
            if (functions.isDefined(this.client_callbackS))
            {
                this.client_callbackS('data');
            }
        }

        if (gSendArray.length == 0)
        {

            gLastClient = null;
            return;            
        }

        sendSingle(gSendArray[0]);
        gSendArray.splice(0, 1);        
    } catch (error) {
        logging.logError('SendArray,sendArrayNext', error);        
    }
}