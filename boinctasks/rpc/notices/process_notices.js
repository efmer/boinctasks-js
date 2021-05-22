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

class ProcessNotices{
    process(connections, btNotices)
    {
        let table = [];
        try{
            if (btNotices !== null)
            {
                table = table.concat(btNotices);
            }
            let cTable = combine(connections);
            condense(cTable);
            table = table.concat(cTable);
        } catch (error) {
            logging.logError('ProcessNotices,process', error);  
        }
        return table;
    }
}
module.exports = ProcessNotices;

function combine(connections)
{
    let cTable = [];
    try 
    {   
        for (let i=0;i<connections.length;i++)          
        {
            let con = connections[i];
            if (con.mode == "OK")
            {
                if (functions.isDefined(con['notice']))
                {
                    cTable = cTable.concat(con.notice);
                }
            }
        }
//        let bt = btNotice
//        cTable = cTable.concat(con.notice);
    } catch (error) {
        logging.logError('ProcessProjects,combine', error);  
    }
    return cTable;
}

function condense(cTable)
{
    try {
        for (let i=0;i<cTable.length;i++)
        {
            let hash = cTable[i].hash;
            for(let j=cTable.length-1;j>i;j--)
            {
                if (cTable[j].hash === hash)
                {
                    cTable[i].computer += ", " + cTable[j].computer;
                    cTable.splice(j,1);
                }
            }
        }      
    } catch (error) {
        logging.logError('ProcessProjects,condense', error);      
    }
}