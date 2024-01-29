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

gBoincTasksNotice = null;

let TESTREAD = false;

class BtNotices{
    init()
    {
        setTimeout(readNotice, 4000);
        setTimeout(checkNotice, 10000);        
    }

    read()
    {
        return gBoincTasksNotice;
    }
}  
module.exports = BtNotices;

function readNotice()
{
    try {
        setTimeout(readNotice, 3600000)     // every hour
        // test begin
        if (TESTREAD)
        {
            let xml = testRead();
            gBoincTasksNotice = parseNotices(xml.toString()); 
            let ii = 1;
        // test end
        }
        else
        {
            readNoticesUrl();
        }
    } catch (error) {
        logging.logError('BtNotices,readNotice', error);       
    }
}

function checkNotice()
{
    if (gBoincTasksNotice === null)
    {
        // still no BoincTasks Js notices / Internet connection.
        readNotice();
        setTimeout(checkNotice, 10000);  // try again in 10 seconds
    }
}

function parseNotices(xml)
{
    xml = xml.replaceAll("&", "&#38;")
    let noticesReturn = null;
    try {
        let parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (functions.isDefined(result))
            {
                let noticeArray = result['notices']['notice'];
                if (functions.isDefined(noticeArray))
                {
                    noticesReturn = noticeArray;
                }
                noticeArray = result['notices']['notice2'];
                if (functions.isDefined(noticeArray))
                {
                    noticesReturn.push(noticeArray[0]);
                }
                return noticesReturn;                
            }
        });
    } catch (error) {
        logging.logError('BtNotices,parseNotices', error);         
    }
    return noticesReturn
}

function readNoticesUrl()
{
    try {
        const https = require('https')
        const options = {
          hostname: 'efmer.eu',
          port: 443,
          path: '/download/boinc/boinc_tasks_js/notices/notice.xml',
          method: 'GET'
        }

        const req = https.request(options, res => {
//          console.log(`statusCode: ${res.statusCode}`)        
          res.on('data', xml => {
            gBoincTasksNotice = parseNotices(xml.toString()); 
          })
        })
        
        req.on('error', error => {
            logging.logDebug("Unable to read BT notice: " + error); 
        })
        
        req.end()    
    } catch (error) {
        logging.logError('BtNotices,readNoticesUrl', error);         
    }
}

function testRead()
{
    try {
        const fs = require('fs');        
        return fs.readFileSync("D:\\Programma\\BoincTasks\\BoincTasks-Js\\download\\notices\\notice.xml");
        
    } catch (error) {
        return null;    
    }        
}
