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

class ProcessTransfers{
    process(connections, sort)
    {
        try{
            var cTable = combine(connections);
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
            return cTable;    
        } catch (error) {
            logging.logError('ProcessTransfers,process', error);  
        }
    }
}
module.exports = ProcessTransfers;


function combine(connections)
{
    var cTable = [];
    try 
    {   
        for (var i=0;i<connections.length;i++)          
        {
            var con = connections[i];
            if (con.mode == "OK")
            {
                if(functions.isDefined(con.transfers))
                {
                    if (functions.isDefined(con['transfers']['file_transfer']))
                    {
                        cTable = cTable.concat(con['transfers']['file_transfer']);
                    }
                }
            }
        }

    } catch (error) {
        logging.logError('ProcessTransfers,combine', error);  
    }
    return cTable;
}

var g_sortColumn;

function sortArray(table, column, dir)
{
    bDir = dir == "up";
    g_sortColumn = column;
    try {
        if (bDir) table.sort(compare).reverse();
        else table.sort(compare);
       
    } catch (error) {
        logging.logError('ProcessTransfers,sortArray', error);  
    }
}

function compare(a,b)
{
    try {
        switch(g_sortColumn)
        {
            case 0: // computer
                if (a.computerName > b.computerName) return 1;
                else if (a.computerName < b.computerName) return -1;
                return 0;
            case 1: // project
                if (a.project > b.project) return 1;
                if (a.project < b.project) return -1;
                return 0;            
            case 2: // file
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;            
            case 3: // progress
                let pa3 = a.persistent_file_xfer[0].last_bytes_xferred / a.nbytes;
                let pb3 = b.persistent_file_xfer[0].last_bytes_xferred / b.nbytes;
                if (pa3 > pb3) return 1;
                if (pa3 < pb3) return -1;
                return 0;            
            case 4: // size
                if (a.nbytes > b.nbytes) return 1;
                if (a.nbytes < b.nbytes) return -1;
                return 0;            
            case 5: // elapsed 
                let pa5 = a.persistent_file_xfer[0]; 
                let pae = pa5.next_request_time - pa5.first_request_time;
                let pb5 = b.persistent_file_xfer[0]; 
                let pbe = pb5.next_request_time - pb5.first_request_time;
                
                if (pae > pbe) return 1;
                if (pae < pbe) return -1;
                return 0;            
            case 6: // speed
                if (a.xfer_speed > b.xfer_speed) return 1;
                if (a.xfer_speed < b.xfer_speed) return -1;
                return 0;
            case 7: // status
            return 0;  
            default:
                return 0;                                                           
        }
       
    } catch (error) {
        logging.logError('ProcessTransfers,compare', error);  
    }
}