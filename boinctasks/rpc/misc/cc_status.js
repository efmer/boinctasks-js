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

class CcStatus{
    getCcStatus(con)
    {
        try 
        {  
            con.client_callbackI = ccData;
            con.client_completeData = "";            
            functions.sendRequest(con.client_socket, "<get_cc_status/>");        
        } catch (error) {
            logging.logError('CcStatus,getCcStatus', error);             
            client.destroy();                      
            completeData = "";
        }  
    }       
}
module.exports = CcStatus;

function ccData()
{
    try 
    {
        var status = parseCcStatus(this.client_completeData);
        if (status == null)
        {
            this.cc_status = null;
            return;
        }
        this.ccstatus = status;  
        this.client_callback(this);     // next get results
    } catch (error) {
        logging.logError('CcStatus,ccData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 

function parseCcStatus(xml)
{
    var statusReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (functions.isDefined(result))
            {
                var statusArray = result['boinc_gui_rpc_reply']['cc_status'];
                if (functions.isDefined(statusArray))
                {
                    statusReturn = statusArray[0];
                }
            }
        });
        } catch (error) {
            logging.logError('CcStatus,parseCcStatus', error);           
            return null;
        }
    return statusReturn
}