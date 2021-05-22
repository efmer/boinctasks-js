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

class ProcessMessages{
//    process(con, filter, sort)
//    {
//        var cTable = sort(con);
//        return cTable;
//    } 
    process(con, sort)
    {
        cTable = [];
        try 
        {       
            var msg = con.messages;
            if (!functions.isDefined(msg)) return cTable;
            var cTable = msg.msgTable;
            if (cTable === void 0) return cTable;
            if (sort != null)
            {
                var col = sort.tCol;
                var dir = sort.tDir;
                if (col >=0 && dir!=null)
                {
                    sortArray(cTable,col,dir);
                }

                col = sort.sCol;
                dir = sort.sDir;
                if (col >=0 && dir!=null)
                {
                    sortArray(cTable,col,dir);
                }

                // 1e last
                col = sort.pCol;
                dir = sort.pDir;
                if (col >=0 && dir!=null)
                {
                    sortArray(cTable,col,dir);
                }
            }
        } catch (error) {
            logging.logError('ProcessMessages,process', error);   
        }        
        return cTable;
    }                
}
module.exports = ProcessMessages;

var g_sortColumn;

function sortArray(table, column, dir)
{
    bDir = dir == "up";
    g_sortColumn = column;
    try {
        if (bDir) table.sort(compare).reverse();
        else table.sort(compare);
       
    } catch (error) {
        logging.logError('ProcessMessages,sortArray', error);  
    }
}

function compare(a,b)
{
    try {
        switch(g_sortColumn)
        {
            case 1: // nr
                if (a.seqno > b.seqno) return 1;
                if (a.seqno < b.seqno) return -1;
                return 0;            
            case 2: // project
                if (a.project > b.project) return 1;
                if (a.project < b.project) return -1;
                return 0;            
            case 3: // time
                if (a.time > b.time) return 1;
                if (a.time < b.time) return -1;
                return 0;            
            case 4: // message
                if (a.body > b.body) return 1;
                if (a.body < b.body) return -1;
                return 0;                        
            default:
                return 0;                                         
        }
       
    } catch (error) {
        logging.logError('ProcessMessages,compare', error); 
    }
}