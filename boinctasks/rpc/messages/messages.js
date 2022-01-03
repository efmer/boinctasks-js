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

class MessageItems
{
    add(con, messages)
    {
        try 
        {
            this.msg = messages.msg;
            if (this.msg === void 0) return null;
            let len = this.msg.length;
            let conMsg = con.messages;
            let seqnoPrevHigh = 1;
            let seqnoHigh = 1;
            let i = 0;
            if (functions.isDefined(conMsg))
            {
                this.msgTable = conMsg.msgTable;
                if (len > 0)
                {
                    seqnoHigh = parseInt(this.msg[len-1].seqno);
                }
                seqnoPrevHigh = con.msgSeqnoHigh;
                i = seqnoPrevHigh;
            }
            else
            {
                con.msgSeqnoHigh = 0; 
                this.msgTable = [];
            }
 
            if (this.msgTable.length === 0)
            {
                i = 0;
            }

            let seqno = seqnoHigh;
            let bAdd = false;
            for (i; i< len; i++)
            {
                let item = this.msg[i];
                let time = parseInt(item.time);
                seqno = parseInt(item.seqno); 
                let timeS = functions.getFormattedTime(time);
                let messageItem = new Object();
                messageItem.computer = con.computerName;                
                messageItem.seqno = seqno;
                messageItem.project = item.project.toString();
                messageItem.pri = parseInt(item.pri);
                messageItem.time = time;
                messageItem.timeS = timeS;
                messageItem.body = item.body.toString();

                this.msgTable.push(messageItem);
                bAdd = true;
            }
            
            if (bAdd)            
            {                             
                let sLen = this.msgTable.length;
                if (sLen > 0)
                {
                    let seqArray = [];
                    for (let s=0;s<sLen;s++)
                    {
                        seqArray.push(parseInt(this.msgTable[s].seqno));
                    }
                    seqArray.sort(sortSeqCompare);  // sort the list because it may be out of sequence.

                    // Check for a gap in the sequence.
                    let sSeqNo = seqArray[0];
                    for (let s=1;s<sLen;s++)
                    {
                        let sSeqRead = seqArray[s];
                        let sSeqOffset = Math.abs(sSeqRead - sSeqNo);
                        if (sSeqOffset !== 1)
                        {
                            // something is wrong
                            con.msgSeqnoHigh = 0; 
                            this.msgTable = [];
                            return null;                    
                        }
                        sSeqNo = seqArray[s];                    
                    }
                }
                else seqno = 0;                
            }        

            con.msgSeqnoHigh = seqno;
        } catch (error) {
            logging.logError('Messages,add', error);             
            return null;
        }        
    }

    getTable()
    {
        return this.messagesTable;
    } 
}
class Messages{
    getMessages(con)
    {
        try 
        {  
            con.client_callbackI = messagesData;
            con.client_completeData = "";
            var messages = con.messages;
            let request = '';
            if (messages == null)
            {
                request = "<get_messages/>\n";
            }
            else
            {
                let seqno = messages.seqno-1;
                if (seqno < 1) seqno = 1;
                request = "<get_messages><seqno>" + seqno + "</seqno></get_messages>";
            }
            functions.sendRequest(con.client_socket, request);            
        } catch (error) {           
            con.mode = 'error';
            con.error = error;            
            logging.logError('Messages,getMessages', error);                   
        }  
    }        
}
module.exports = Messages;

function messagesData()
{
    try 
    {                  
        var messages = parseMessages(this.client_completeData);
        if (messages == null)
        {
            this.messages = null;
            this.mode = 'empty';
            return;
        }
        var messageItems = new MessageItems();
        messageItems.add(this, messages)
        this.messages = messageItems;  
        this.mode = "OK";
    } catch (error) {
        logging.logError('Messages,messagesData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 


function parseMessages(xml)
{
    let messagesReturn = null;
    try {
        let bConvert = true;
        
        // message has illegal xml characters in download link.
        while (bConvert)
        {
            bConvert = false;
            let linkB = xml.indexOf("<a");
            if (linkB >=0)
            {
                let linkE = xml.indexOf("</a>")
                let linkS = xml.substring(linkB, linkE+4);
                linkS = linkS.replace("<a ","[");
                linkS = linkS.replace("</a>", "]");
                linkS = linkS.replace(">", "]");
                bConvert = true;

                let left = xml.substring(0,linkB);
                let right = xml.substring(linkE+4)

                xml = left + linkS + right;
            }
        }
//        xml = xml.replace("\u0003", "");
        let parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {        
            if (functions.isDefined(result))
            {
                let messagesArray = result['boinc_gui_rpc_reply']['msgs'];
                if (functions.isDefined(messagesArray))
                {
                    messagesReturn = messagesArray[0];
                    return messagesReturn;
                }
            }
            return null;
        });
    } catch (error) {
        logging.logError('Messages,parseMessages', error);              
        return null;
    }
    return messagesReturn
}

function sortSeqCompare(a,b)
{
    try {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
    } catch (error) {
        logging.logError('Messages,sortSeqCompare', error); 
    }
}