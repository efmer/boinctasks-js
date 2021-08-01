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

class ProcessProjects{
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
            logging.logError('ProcessProjects,process', error);  
        }
    }
}
module.exports = ProcessProjects;


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
                if (functions.isDefined(con['projects']))
                {
                    cTable = cTable.concat(con['projects']['projectTable']);
                }
            }
        }

    } catch (error) {
        logging.logError('ProcessProjects,combine', error);  
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
        logging.logError('ProcessProjects,sortArray', error);  
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
            case 2: // account
                if (a.account > b.account) return 1;
                if (a.account < b.account) return -1;
                return 0;            
            case 3: // team
                if (a.team > b.team) return 1;
                if (a.team < b.team) return -1;
                return 0;            
            case 4: // credits
                if (a.credits > b.credits) return 1;
                if (a.credits < b.credits) return -1;
                return 0;            
            case 5: // creditsAvg
                if (a.creditsAvg > b.creditsAvg) return 1;
                if (a.creditsAvg < b.creditsAvg) return -1;
                return 0;            
            case 6: // creditsHost
                if (a.creditsHost > b.creditsHost) return 1;
                if (a.creditsHost < b.creditsHost) return -1;
                return 0; 
            case 7: // creditsHostAvg
                if (a.creditsHostAvg > b.creditsHostAvg) return 1;
                if (a.creditsHostAvg < b.creditsHostAvg) return -1;
            return 0;                                                                                         
            case 8: // share
                if (a.share > b.share) return 1;
                if (a.share < b.share) return -1;
                return 0;            
            case 9: // status
                if (a.status > b.status) return 1;
                if (a.status < b.status) return -1;
                return 0; 
            case 10: // REC
                if (a.rec > b.rec) return 1;
                if (a.rec < b.rec) return -1;
                return 0;
            case 11: // VENUE
                if (a.venue > b.venue) return 1;
                if (a.venue < b.venue) return -1;
                return 0;                                  
            default:
                return 0;                                                           
        }
       
    } catch (error) {
        logging.logError('ProcessProjects,compare', error);  
    }
}