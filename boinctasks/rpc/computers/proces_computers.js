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

class ProcessComputers{

    process(con, sort)
    {
        try {
            var cTable = [];            
            cTable = con;

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
            logging.logError('ProcessComputers,process', error);            
        }
        return cTable;         
    }
}
module.exports = ProcessComputers;

var g_sortColumn;

function sortArray(table, column, dir)
{
    bDir = dir == "up";
    g_sortColumn = column;
    try {
        if (bDir) table.sort(compare).reverse();
        else table.sort(compare);
       
    } catch (error) {
        logging.logError('ProcessComputers,sortArray', error);  
    }
}

function compare(a,b)
{
    try {
        switch(g_sortColumn)
        {           
            case 2: // computer
                if (a.computerName > b.computerName) return 1;
                else if (a.computerName < b.computerName) return -1;
                return 0;
            case 3: // ip
                if (a.ip > b.ip) return 1;
                if (a.ip < b.ip) return -1;
                return 0;            
            case 4: // mac
                if (a.mac > b.mac) return 1;
                if (a.mac < b.mac) return -1;
                return 0;            
            case 5: // port
                if (a.port > b.port) return 1;
                if (a.port < b.port) return -1;
                return 0;            
            case 7: // boinc
                if (a.boinc > b.boinc) return 1;
                if (a.boinc < b.boinc) return -1;
                return 0;            
            case 8: // platform
                if (a.platform> b.platform) return 1;
                if (a.platform < b.patform) return -1;
                return 0;            
            case 9: // status
                if (a.status > b.status) return 1;
                if (a.status < b.status) return -1;
                return 0;
            default:
                return 0;                                                           
        }
       
    } catch (error) {
        logging.logError('ProcessComputers,compare', error);  
    }
}