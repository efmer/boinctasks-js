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

class Transfers{
    getTransfers(con)
    {
        try 
        {   
            con.client_callbackI = transferData;
            con.client_completeData = "";                   
            functions.sendRequest(con.client_socket, "<get_file_transfers/>");                          
        } catch (error) {
            logging.logError('Transfers,getTransfers', error);                        
            con.mode = 'errorc';
            con.error = error;
        }  
    }       
}
module.exports = Transfers;

function transferData()
{
    try 
    {
        var transfers = parseTransfers(this.client_completeData);
        if (transfers == null)
        {
            this.transfers = null;
            this.mode = 'empty';
            return;
        }
        if (functions.isDefined(transfers.file_transfer))
        {
            add(this.computerName,transfers.file_transfer);
            this.transfers = transfers;  
        }
        else 
        {
            this.transfers = null;  
        }
        this.mode = "OK";
    } catch (error) {
        logging.logError('Transfers,transferData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 

function add(computer,transfers)
{
    try {
        for (var i=0;i<transfers.length;i++)
        {
            transfers[i].computerName = computer;
        }
    } catch (error) {
        logging.logError('Transfers,add', error);         
    }    
}

function parseTransfers(xml)
{
    var transferReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, transfer) {
            if (functions.isDefined(transfer))
            {
                var transferArray = transfer['boinc_gui_rpc_reply']['file_transfers'];
                if (functions.isDefined(transferArray))
                {
                    transferReturn = transferArray[0];
                    if (transferReturn.length > 10) return transferReturn;
                }
            }
        });
    } catch (error) {
        logging.logError('Transfers,parseTransfers', error);         
    }
    return transferReturn
}