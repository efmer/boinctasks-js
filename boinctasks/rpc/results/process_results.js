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

let gReadyToReport = 0;

class ProcessResults{
    process(connections, filter, sort)
    {
        let ret = new Object();
        ret.cTable = [];
        ret.resultCount = 0;
        try 
        {       
            ret = new Object();
            combine(connections, ret);

            if (sort != null)
            {
                var col = sort.tCol;
                var dir = sort.tDir;
                if (col >=0 && dir!=null)
                {
                    sortArray(ret.cTable,col,dir);
                }

                col = sort.sCol;
                dir = sort.sDir;
                if (col >=0 && dir!=null)
                {
                    sortArray(ret.cTable,col,dir);
                }

                // 1e last
                col = sort.pCol;
                dir = sort.pDir;
                if (col >=0 && dir!=null)
                {
                    sortArray(ret.cTable,col,dir);
                }
            }
            ret.cTable.unshift(filter);
        } catch (error) {
            logging.logError('ProcessResults,process', error);   
        }
        return ret;
    }
    readyToReport()
    {
        return gReadyToReport;
    }
}
module.exports = ProcessResults;


function combine(connections, obj)
{
    gReadyToReport = 0;
    obj.cTable = [];
    obj.resultCount = 0;
    try 
    {   
        for (var i=0;i<connections.length;i++)          
        {
            var con = connections[i];
            if (con.mode == "OK")
            {
                if (functions.isDefined(con['results']))                
                {                
                    let lenR = con.toReport.url.length 
                    if (lenR > 0)
                    {
                        for (let tr=0; tr < lenR; tr++)
                        {
                            gReadyToReport += con.toReport.count[tr];
                        }                        
                    }
                    obj.cTable = obj.cTable.concat(con['results']['resultTable']);
                    obj.resultCount += con.results.resultCount
                }
            }
        }

    } catch (error) {
        logging.logError('ProcessResults,combine', error);           
    }
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
        logging.logError('ProcessResults,sortArray', error);  
    }
}

function compare(a,b)
{
    try {
        switch(g_sortColumn)
        {
            case 0: // computer
                if (a.computerName > b.computerName) return 1;
                if (a.computerName < b.computerName) return -1;
                return 0;
            case 1: // project
                if (a.project > b.project) return 1;
                if (a.project < b.project) return -1;
                return 0;            
            case 2: // application
                if (a.app > b.app) return 1;
                if (a.app < b.app) return -1;
                return 0;            
            case 3: // name = wu
                if (a.wu > b.wu) return 1;
                if (a.wu < b.wu) return -1;
                return 0;            
            case 4: // elapsed
                if (a.elapsed > b.elapsed) return 1;
                if (a.elapsed < b.elapsed) return -1;
                return 0;            
            case 5: // cpu
                if (a.cpu > b.cpu) return 1;
                if (a.cpu < b.cpu) return -1;
                return 0;            
            case 6: // progress
                if (a.fraction > b.fraction) return 1;
                if (a.fraction < b.fraction) return -1;
                return 0; 
            case 7: // timeleft
                if (a.remaining > b.remaining) return 1;
                if (a.remaining < b.remaining) return -1;
            return 0;                                                                                         
            case 8: // deadline
                if (a.deadline > b.deadline) return 1;
                if (a.deadline < b.deadline) return -1;
                return 0;            
            case 9: // resources
                if (a.resources > b.resources) return 1;
                if (a.resources < b.resources) return -1;
                return 0;  
            case 10: // status
                if (a.statusS > b.statusS) return 1;
                if (a.statusS < b.statusS) return -1;
                return 0; 
            case 11: // checkpoint
                if (a.checkpoint > b.checkpoint) return 1;
                if (a.checkpoint < b.checkpoint) return -1;
                return 0;
            case 12: // recieved
                if (a.received > b.received) return 1;
                if (a.received < b.received) return -1;
                return 0;
            case 13: // swap mem v
                if (a.swap > b.swap) return 1;
                if (a.swap < b.swap) return -1;
                return 0;
            case 14: // mem
                if (a.memory > b.memory) return 1;
                if (a.memory < b.memory) return -1;
                return 0;                
            default:             
                return 0;                                         
        }
       
    } catch (error) {
        logging.logError('ProcessResults,compare', error); 
    }
}