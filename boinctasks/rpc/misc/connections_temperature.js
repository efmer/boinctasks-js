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
//const Functions = require('../functions/functions');
//const functions = new Functions();

class ConTemp
{
    send(con)
    {
        if (con.auth)
        {
            send(con)
        }
    }
}
module.exports = ConTemp;

function send(con)
{
    try {        
        if(con.temp.clientClass == null)
        {        
            // we must create a socket for every connection
            const TempSocket  = require('./socket_temperature');
            const tempSocket = new TempSocket();        
            con.temp.clientClass = tempSocket;
            con.temp.clientClass.socket(con);            
        }
        con.temp.client_compleData = "";
        con.temp.client_callback = connectTemperature;
        con.temp.client_socket.write("<BT>", "utf8");                      
    } catch (error) {
        con.temp.clientClass = null;
        logging.logError('ConTemp,send', error);        
    }
}

function connectTemperature(con)
{
    try {
        let data = this.client_completeData;
        this.client_completeData = "";
        this.cpu = -1;
        this.gpu = [];
        this.gpuP = [];         
        this.cpuT = -1;
        this.gpuT = -1;       
        let split = data.split('>')
        let bActiveF = false;
        let bActive = true;
        if (split.length > 2) 
        {
            if (split[0] === "<TThrottle")
            {
                let pos;
                for (let i=3; i<split.length;i++)
                {
                    if (!bActiveF)
                    {
                        pos = split[i].indexOf("<AC");
                        if (pos >=0)
                        {
                            bActiveF = true;
                            let active = split[i].substring(4);
                            if (active == "0") bActive = false;
                        }
                    }

                    if (bActive && this.cpuT < 0)
                    {
                        pos = split[i].indexOf("<DC");
                        if (pos >=0)
                        {
                            this.cpuT = split[i].substring(4); 
                        }
                    }
                    if (bActive &&this.gpuT < 0)
                    {
                        pos = split[i].indexOf("<DG");
                        if (pos >=0)
                        {
                            this.gpuT = split[i].substring(4); 
                        }         
                    }                    

                    pos = split[i].indexOf("<CT");  // CPU temp       
                    if (pos >=0)
                    {
                        let core = 0;
                        while (pos >=0)
                        {
                            pos = split[i].indexOf("<CT"+core);
                            if (pos >= 0)
                            {
                                let val = split[i].substring(5);
                                if (val > this.cpu) this.cpu = val;
                                core++;
                                i++;                                
                            }
                        }
                        pos = split[i].indexOf("<GT"); // GPU temp
                        if (pos >=0)
                        {
                            let core = 0;
                            while (pos >=0)
                            {
                                pos = split[i].indexOf("<GT"+core);
                                if (pos >= 0)
                                {
                                    this.gpu.push(split[i].substring(5));
                                    core++;
                                    i++;
                                }
                            }
                        }
                        pos = split[i].indexOf("<GP");
                        if (pos >=0)
                        {
                            let core = 0;
                            while (pos >=0)
                            {
                                pos = split[i].indexOf("<GP"+core); // GPU run %
                                if (pos >= 0)
                                {
                                    this.gpuP.push(split[i].substring(5));
                                    core++;
                                    i++;
                                }
                            }
                        }                        
                        break;
                    }
                }
            }
        }
    } catch (error) {
        logging.logError('ConTemp,connectTemperature', error);         
    }
}