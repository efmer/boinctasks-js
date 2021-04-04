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

class ProcessHistory{
    process(connections, sort)
    {
        let ret = new Object();
        ret.cTable = [];
        ret.resultCount = 0;        
        try{
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
        } catch (error) {
            logging.logError('ProcessProjects,process', error);  
        }
        return ret;
    }
}
module.exports = ProcessHistory;

function combine(connections, obj)
{
    obj.cTable = [];
    obj.resultCount = 0;    
    try 
    {   
        for (var i=0;i<connections.length;i++)          
        {
            var con = connections[i];
            if (con.sidebar || con.sidebarGrp)
            {
                if (functions.isDefined(con['history']))
                {
                    obj.cTable = obj.cTable.concat(con['history']['table']);
                    if (functions.isDefined(con.history.resultCount))
                    {
                        obj.resultCount += con.history.resultCount;
                    }
                }
            }
        }

    } catch (error) {
        logging.logError('ProcessHistory,combine', error);  
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
        logging.logError('ProcessHistory,sortArray', error);  
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
                if (a.projectName > b.projectName) return 1;
                if (a.projectName < b.projectName) return -1;
                return 0;            
            case 2: // app
                if (a.appNameUF > b.appNameUF) return 1;
                if (a.appNameUF < b.appNameUF) return -1;
                return 0;            
            case 3: // name
                if (a.result > b.result) return 1;
                if (a.result < b.result) return -1;
                return 0;            
            case 4: // elapsed
                let ai = parseInt(a.elapsed);
                let bi = parseInt(b.elapsed);
                if (ai > bi) return 1;
                if (ai < bi) return -1;
                return 0;            
            case 5: // cpu
                let cpua =  (a.cpuTime/a.elapsed);
                let cpub =  (b.cpuTime/b.elapsed)                

                if (cpua > cpub) return 1;
                if (cpua < cpub) return -1;
                return 0;            
            case 6: // completed
                if (a.completedTime > b.completedTime) return 1;
                if (a.completedTime < b.completedTime) return -1;
                return 0; 
            case 7: // status
                if (a.exit > b.exit) return 1;
                if (a.exit < b.exit) return -1;
            return 0;
            default:
                return 0;                                                           
        }
       return 0;
       
    } catch (error) {
        logging.logError('ProcessHistory,compare', error);  
    }
}