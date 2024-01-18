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
const btconstants = require('../functions/btconstants');

class TempSocket{
    socket(con)
    {
    try {
        con.temp.connected = false;
        let ip = con.ip;
        let port = con.temp.port;

        con.temp.client_completeData = "";

        let net = require("net");
        con.temp.client_socket = new net.Socket();

        con.temp.client_socket.connect(port, ip);       // connect adds listeners that HAVE to be removed.

        con.temp.client_socket.on('connect',function(){
            con.temp.connected = true;
            let msg = btconstants.TL.MSG_GENERAL.MSG_COMPUTER_CONNECTED + " °C " + ip + ':' + port + "," + con.computerName;
            logging.log(msg);
        });

        con.temp.client_socket.on('data', function(data) {
            let dataStr = data.toString(); 
            con.temp.client_completeData += dataStr; 
            if (dataStr.indexOf(0) >= 0 )
            {
                con.temp.client_callback('data');
            }                         
        })
        con.temp.client_socket.on('close', function() {
            con.temp.clientClass = null;
            invalidate(con);            
        }); 
        con.temp.client_socket.on('error', (err) => {
            con.temp.client_socket.end();                 
            con.temp.client_socket.destroy();
            con.temp.clientClass = null;
            invalidate(con);
        });        
    } catch (error) {
        logging.logError('TempSocket,client', error);
        con.temp.client_socket.end();
        con.temp.client_socket.destroy();
        con.temp.clientClass = null;
        invalidate(con);
        lostConnectionTemp(con,"error2")
    }
    }
}

module.exports = TempSocket;

function invalidate(con)
{
    try {
        if (con.temp.connected)
        {
            let msg = btconstants.TL.MSG_GENERAL.MSG_COMPUTER_LOST + " °C " + con.ip + ':' + con.temp.port + "," + con.computerName;
            logging.logDebug(msg);         
        }

        con.temp.connected = false;
        con.temp.cpu = void 0;
        con.temp.gpu = void 0;
        con.temp.cpuT= void 0;
        con.temp.gpuT= void 0;
    } catch (error) {
        logging.logError('TempSocket,invalidate', error);        
    }
}