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

const btconstants = require('../functions/btconstants');
const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();

class Authenticate{
    authorize(con)
    {
        try 
        {
            con.client_socket.clear
            con.client_callbackI = this.auth1;
            con.client_completeData = "";              
            functions.sendRequest(con.client_socket, "<auth1/>\n");    
        } catch (error) {
            logging.logError('Authenticate,Authenticate', error);        
            con.auth = false;
            con.mode = 'error'           
        } 
    }

    auth1(event)
    {
        try {
            switch(event)
            {
                case "data":
                    const nonce = parseAuth1(this.client_completeData);
                    if (nonce.length == 0)
                    {
                        this.auth = false;
                        this.mode = 'failed_auth1';
                        return;
                    } 
                    const crypto = require('crypto')
                    let np = nonce + this.passWord;
                    let hash =  crypto.createHash('md5').update(np).digest("hex")
                    this.client_callbackI = auth2;                
                    var send =  "<auth2>\n<nonce_hash>" + hash + "</nonce_hash>\n</auth2>\n"
                    this.client_completeData = "";
                    functions.sendRequest(this.client_socket,send);
                break;
            }  
        } catch (error) {
            logging.logError('Authenticate,auth1', error);       
        }        
    }


}

module.exports = Authenticate;

function auth2(event)
{
    try {
        switch(event)
        {
            case "data":        
                const reply = parseAuth2(this.client_completeData);                 
                this.auth = reply;
                if (!reply)
                {
                    this.mode = 'failed_auth2';
                }
                else
                {
                    let ipc =  this.ip + ':' + this.port + ", " + this.computerName;
                    if (this.isShadow)
                    {
                        logging.logDebug("Authenticated (shadow): " + ipc);
                    }
                    else
                    {
                        logging.log(btconstants.TL.MSG_GENERAL.MSG_COMPUTER_CONNECTED + " " + ipc);
                    }
                    this.client_callback(this);
                }
            break;        
        }
    } catch (error) {
        logging.logError('Authenticate,auth2', error);
    }         
}



function parseAuth1(xml)
{
    var nonce = "";
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            var nonceArray = result['boinc_gui_rpc_reply']['nonce'];
            if (functions.isDefined(nonceArray))
            {
                nonce = nonceArray[0];
                return nonce;
            }
            return "";
        });
    } catch (error) {
        logging.logError('Authenticate,parseAuth1', error);  
    }
    return nonce;
}

function parseAuth2(xml,nonce)
{
    var auth2 = false
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
        var auth = result['boinc_gui_rpc_reply']['authorized'];
        auth2 = functions.isDefined(auth);
        });
    } catch (error) {
        logging.logError('Authenticate,parseAuth2', error);          
    }
    return auth2;
}