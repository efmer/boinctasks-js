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

class Computers{
    getComputers(con)
    {
        try 
        {
            con.client_callbackI = computerData;
            con.client_completeData = "";    
            functions.sendRequest(con.client_socket, "<get_host_info/>\n");                
        } catch (error) {         
            con.mode = 'error';
            con.error = error;
            logging.logError('Computer,getComputer', error);             
        }  
    }        
}
module.exports = Computers;

function computerData()
{
    try 
    {
        if (this.client_completeData.indexOf('unauthorized') >=0)
        {
            this.con.auth = false;
        }                    
        else
        {
            if (this.state != null)
            {
                this.boinc = this.state.core_client_major_version.toString() + "." +  this.state.core_client_minor_version.toString() + "." + this.state.core_client_release.toString();
                this.platform = this.state.platform_name.toString();
            }
            // connection
            var computer = parseComputer(this.client_completeData);
            if (computer == null)
            {                     
                this.mode = 'empty'
                return;
            }

            this.mode = "OK";
        }
    } catch (error) {
        logging.logError('Computer,computerData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
}

function parseComputer(xml)
{
    var computerReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
        if (functions.isDefined(result))
        {
            var computerArray = result['boinc_gui_rpc_reply']['host_info'];
            if (functions.isDefined(computerArray))
            {
                computerReturn = computerArray[0];
                return computerReturn;
            }
        }
        return null;
        });
    } catch (error) {
        logging.logError('Computer,parseComputer', error);        
    }
    return computerReturn
}