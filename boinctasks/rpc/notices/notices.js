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

const crypto = require('crypto')
const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();

class Notices{
    getNotices(con)
    {
        try 
        {  
            con.client_callbackI = noticeData;
            con.client_completeData = "";            
            functions.sendRequest(con.client_socket, "<get_notices>\n</get_notices>");            
        } catch (error) {
            logging.logError('Notices,getNotices', error);               
            this.mode = 'errorc';
            this.error = error;
        }  
    }       
}
module.exports = Notices;

function noticeData()
{
    try 
    {
        let notices = parseNotices(this.client_completeData);
        if (notices === null)
        {
            this.notices = null;
            this.mode = 'empty';
            return;
        }
        let notice = notices.notice;
        if (notice === void 0)
        {
            this.notices = null;
            this.mode = 'empty';
            return;
        }
        for (let i=0;i<notice.length;i++)
        {
            notice[i].computer = this.computerName;
            let s = notice[i].title[0] + notice[i].description[0];
            notice[i].hash =  crypto.createHash('md5').update(s).digest("hex");
        }

        this.notice = notice;  
        this.mode = "OK";                  
    } catch (error) {
        logging.logError('Notices,noticeData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 

function parseNotices(xml)
{
    xml = xml.replaceAll("&", "&#38;")
    var noticesReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (functions.isDefined(result))
            {
                var noticeArray = result['boinc_gui_rpc_reply']['notices'];
                if (functions.isDefined(noticeArray))
                {
                    noticesReturn = noticeArray[0];
                    return noticesReturn;
                }
            }
        });
    } catch (error) {
        logging.logError('Notices,parseNotices', error);         
    }
    return noticesReturn
}