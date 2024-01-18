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

const AUTH_TIMEOUT = 3; // 3 min

class BtSocket{
    socket(con)
    {
    try {
        this.connected = false;
        let ip = con.ip;
        let port = con.port;

        con.client_completeData = "";

        let net = require("net");
        con.client_socket = new net.Socket();

        con.client_socket.connect(port, ip);       // connect adds listeners that HAVE to be removed.

        con.client_socket.on('connect',function(){
            this.connected = true;
        });

        con.client_socket.on('data', function(data) {
            let dataStr = data.toString(); 
            con.client_completeData += dataStr; 
            if (dataStr.indexOf('\u0003') >= 0 )
            {
                if (con.client_completeData.indexOf('<unauthorized') >=0)
                {
                    if (con.auth === true)
                    {
                        logging.log("Lost connection(unauthorized): " + con.ip);     
                        con.lostConnection = true;                                            
                        con.auth = false;
                    }
                    con.authTimeout = 0;
                }    
                else {
                    con.authTimeout = 0;
                    con.lostConnection = false;
                    let cb = con.client_callbackI;
                    if (cb !== null) con.client_callbackI('data');                    
                }             

            }
        })
        con.client_socket.on('close', function() {
            var ii = 1;
            con.client_socket.end();                 
            con.client_socket.destroy();            
        }); 
/*        
        con.client_socket.on('timeout', function() { 
            con.client_compleData = "";          
            con.auth = false;
            con.mode = 'timeout'; 
            con.client_socket.end();                 
            con.client_socket.destroy();
            // not used, the busy timer handles a timeout.       
        });
*/
        con.client_socket.on('error', (err) => {
            con.client_compleData = "";
            checkAuth(con,"error");
            con.mode = 'error';
            con.client_socket.end();                 
            con.client_socket.destroy();  
        });        
    } catch (error) {
            logging.logError('BtSocket,client', error);
            con.socket_compleData = "";
            con.auth = false;
            con.mode = 'error';
            con.client_socket.end();                 
            con.client_socket.destroy();  
            lostConnection(con,"error2")
        }  
    }
}

module.exports = BtSocket;

function checkAuth(con, id)
{
    if (con.auth === true)
    {            
        con.authTimeout++;
        if (con.authTimeout >= AUTH_TIMEOUT)
        {
            lostConnection(con,id)
        }
    }   
}

function lostConnection(con,id)
{
    if (con.auth === true)
    {
        logging.log("Lost connection(" + id + "): " + con.ip + ", " + con.computerName); 
        con.lostConnection = true;
    }
    con.auth = false; 
}