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

const Logging = require('./logging');
const logging = new Logging();
const Functions = require('./functions');
const functions = new Functions();
const ReadWrite  = require('./readwrite');
const readWrite = new ReadWrite();

const btConstants = require('./btconstants');

const HEADER_COMPUTERS_LEN = btConstants.COMPUTERS_COLOMN_COUNT;
const HEADER_COMPUTERS_WIDTH = [4,10,20,18,14,20,20,10,20,30,10];

const HEADER_PROJECTS_LEN = btConstants.PROJECTS_COLOMN_COUNT;
const HEADER_PROJECTS_WIDTH = [14,18,28,20,10,10,10,10,10,30,10,10,10,10]; 

const HEADER_TASKS_LEN = btConstants.TASKS_COLOMN_COUNT;
const HEADER_TASKS_WIDTH = [12,18,28,20,10,6,6,10,10,10,20,10,10,10,10,10,10];

const HEADER_TRANSFERS_LEN = btConstants.TRANSFERS_COLOMN_COUNT;
const HEADER_TRANSFERS_WIDTH = [8,8,20,5,10,10,10,20];

const HEADER_MESSAGES_LEN = btConstants.MESSAGES_COLUMN_COUNT;
const HEADER_MESSAGES_WIDTH = [14,6,10,20,40];

const HEADER_HISTORY_LEN = btConstants.HISTORY_COLUMN_COUNT;
const HEADER_HISTORY_WIDTH = [12,12,20,18,8,6,16,12];

class BtHeader{
    getWidth(gb)
    {
        get(gb);
    }

    updateWidth(gb,type,idArray, data, total)    {
        updateHeaderWidth(gb,type,idArray, data, total);
    }
}
module.exports = BtHeader;

function get(gb)
{
    gb.widthComputers = JSON.parse(readWrite.read("settings\\header", "widthComputers.json"));
    if (!functions.isDefined(gb.widthComputers))
    {
        gb.widthComputers = HEADER_COMPUTERS_WIDTH;
    }
    valid(gb.widthComputers,btConstants.COMPUTERS_COLOMN_COUNT);

    gb.widthProjects = JSON.parse(readWrite.read("settings\\header", "widthProjects.json"));
    if (!functions.isDefined(gb.widthProjects))
    {
        gb.widthProjects = HEADER_PROJECTS_WIDTH;
    }
    valid(gb.widthProjects,btConstants.PROJECTS_COLOMN_COUNT);    
  
    gb.widthTasks = JSON.parse(readWrite.read("settings\\header", "widthTasks.json"));
    if (!functions.isDefined(gb.widthTasks))
    {
        gb.widthTasks = HEADER_TASKS_WIDTH;
    }
    valid(gb.widthTasks,btConstants.TASKS_COLOMN_COUNT);

    gb.widthTransfers = JSON.parse(readWrite.read("settings\\header", "widthTransfers.json"));
    if (!functions.isDefined(gb.widthTransfers))
    {
        gb.widthTransfers = HEADER_TRANSFERS_WIDTH;
    }
    valid(gb.widthTransfers,btConstants.TRANSFERS_COLOMN_COUNT);

    gb.widthMessages = JSON.parse(readWrite.read("settings\\header", "widthMessages.json"));
    if (!functions.isDefined(gb.widthMessages))
    {
        gb.widthMessages = HEADER_MESSAGES_WIDTH;
    }
    valid(gb.widthMessages,btConstants.MESSAGES_COLOMN_COUNT);

    gb.widthHistory = JSON.parse(readWrite.read("settings\\header", "widthHistory.json"));
    if (!functions.isDefined(gb.widthHistory))
    {
        gb.widthHistory = HEADER_HISTORY_WIDTH;
    }
    valid(gb.widthHistory,btConstants.HISTORY_COLOMN_COUNT);
}

function valid(table,len)
{
    for(let i=0;i< len;i++)
    {
        let item = table[i];
        if (functions.isDefined(item))
        {
            if (item < 2)
            {
                table[i] = 8;
            }
        }
        else 
        {
            table[i]= 8;
        }
    }
}

function updateHeaderWidth(gb,type, idArray, data, total)
{
    try {
        if (type !== gb.selectedTab) return;

        switch(type)
        {
            case btConstants.TAB_COMPUTERS:
                writeHeader(gb,'widthComputers', HEADER_COMPUTERS_LEN, idArray, data, total );
            break;        
            case btConstants.TAB_PROJECTS:
                writeHeader(gb,'widthProjects', HEADER_PROJECTS_LEN, idArray, data, total );
            break;        
            case btConstants.TAB_TASKS:
                writeHeader(gb,'widthTasks', HEADER_TASKS_LEN, idArray, data, total );
            break;
            case btConstants.TAB_TRANSFERS:
                writeHeader(gb,'widthTransfers', HEADER_TRANSFERS_LEN, idArray, data, total );
            break;        
            case btConstants.TAB_MESSAGES:
                writeHeader(gb,'widthMessages', HEADER_MESSAGES_LEN, idArray, data, total );
            break; 
            case btConstants.TAB_HISTORY:
                writeHeader(gb,'widthHistory', HEADER_HISTORY_LEN, idArray, data, total );
            break;                        
        }        
    } catch (error) {
        logging.logError('BtHeader,updateHeaderWidth', error);  
    }
}

function writeHeader(gb,id, len, idArray, data, total)
{
    try {
        validate(data, len)
        data2 = [];
        for (let i=0;i<idArray.length;i++)
        {
            let id = idArray[i]
            data2[id] = data[i];
        }
        gb[id] = data2;
    
        readWrite.write("settings\\header",id + ".json",JSON.stringify(data2));   
    } catch (error) {
        logging.logError('BtHeader,writeHeader', error);          
    }
}

function validate(data,len,defaultWidth)
{
    if (!functions.isDefined(data))
    {
        data = defaultWidth;
        return;
    }

    let dataLen = data.length;
    for (let i=0; i<dataLen;i++)
    {
        if (data[i] < 0.1) 
        {
            data[i] = 10;
        }
    }    
    if (dataLen < len)
    {
        for (let j=dataLen;j<len;j++)
        {
            data[j] = 10;
        }       
    }
}