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
const btConstants = require('../functions/btconstants');

class RowSelect{
    init(gb)
     {
        gb.rowSelect = new Object;
        gb.rowSelect.computers = new Object;
        gb.rowSelect.computers.rowSelected = [];
        gb.rowSelect.computers.present = [];
        gb.rowSelect.computers.lastSel = "";

        gb.rowSelect.projects = new Object;
        gb.rowSelect.projects.rowSelected = [];
        gb.rowSelect.projects.present = [];
        gb.rowSelect.projects.lastSel = "";


        gb.rowSelect.results = new Object;
        gb.rowSelect.results.rowSelected = [];
        gb.rowSelect.results.present = [];
        gb.rowSelect.results.lastSel = "";

        gb.rowSelect.transfers = new Object;
        gb.rowSelect.transfers.rowSelected = [];
        gb.rowSelect.transfers.present = [];
        gb.rowSelect.transfers.lastSel = "";

        gb.rowSelect.messages = new Object;
        gb.rowSelect.messages.rowSelected = [];
        gb.rowSelect.messages.present = [];
        gb.rowSelect.messages.lastSel = "";      

        gb.rowSelect.history = new Object;
        gb.rowSelect.history.rowSelected = [];
        gb.rowSelect.history.present = [];
        gb.rowSelect.history.lastSel = "";          
     }

     clickOnRow(gb, idA, shift, alt, ctrl)
     {
        let sel;
        let id = idA[1];
        try {
            switch (gb.currentTable.name)
            {
                case btConstants.TAB_COMPUTERS:
                    sel = gb.rowSelect.computers;
                    id = idA[3];
                break;
                case btConstants.TAB_PROJECTS:
                    sel = gb.rowSelect.projects;                    
                break;
                case btConstants.TAB_TASKS:
                    sel = gb.rowSelect.results;                    
                break;
                case btConstants.TAB_TRANSFERS:
                    sel = gb.rowSelect.transfers;                    
                break;
                case btConstants.TAB_MESSAGES:
                    sel = gb.rowSelect.messages;                    
                break;                
                default:
                    sel = gb.rowSelect.history;                      
            }
            if(ctrl)
            {
                let pos = sel.rowSelected.indexOf(id);
                if (pos >= 0)
                {
                    sel.rowSelected.splice(pos, 1); 
                    sel.present.splice(pos, 1);                     
                }
                else
                {
                    sel.rowSelected.push(id);
                    sel.present.push(true); 
                }
                return;
            }
            else
            {
                if (shift)
                {            
                    if (sel.lastSel !== "" )
                    {
                        clickShift(gb,id);
                    }
                    return;
                }
                else
                {
                    sel.rowSelected = [];
                    sel.present = [];
                    sel.rowSelected.push(id);
                    sel.present.push(true);
                    sel.lastSel = id;
                }
            }


        } catch (error) {
            logging.logError('RowSelect,clickOnRow', error); 
        }          
     }
   }
   
   module.exports = RowSelect;

function clickShift(gb, id)
{
    try {
        switch (gb.currentTable.name)
        {
            case btConstants.TAB_COMPUTERS:
                sel = gb.rowSelect.computers;
                id = idA[3];
            break;
            case btConstants.TAB_PROJECTS:
                clickShiftProject(gb,id);
            break;
            case btConstants.TAB_TASKS:
                clickShiftResults(gb,id);
            break;
            case btConstants.TAB_TRANSFERS:
                clickShiftTransfers(gb,id);                   
            break;
            case btConstants.TAB_MESSAGES:
                clickShiftMessages(gb,id);                
            break;                
            default:
                clickShiftHistory(gb,id);                     
        }           
    } catch (error) {
        logging.logError('RowSelect,clickShift', error);     
    }
}

function clickShiftProject(gb,id)
{
    let table;
    let bFoundSelect = false;
    let bFoundEnd = false;
    sel = gb.rowSelect.projects; 
    table = gb.currentTable.projectTable
    sel.rowSelected = [];
    sel.present = [];
    for (let i = 1; i< table.length;i++)
    {
        let project = table[i];
        let selId = btConstants.SEPERATOR_SELECT +  project.computerName + btConstants.SEPERATOR_SELECT + project.projectUrl;
           
        if (selId === sel.lastSel)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;         
        }
        if (selId === id)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;        
        }
        if (bFoundSelect)
        {
            sel.rowSelected.push(selId);
            sel.present.push(true);
            if (bFoundEnd)
            {
                return;
            }
        }
    }   
}

function clickShiftResults(gb,id)
{
    let table;
    let bFoundSelect = false;
    let bFoundEnd = false;
    sel = gb.rowSelect.results; 
    table = gb.currentTable.resultTable
    let filter = table[0];
    sel.rowSelected = [];
    sel.present = [];
    for (let i = 1; i< table.length;i++)
    {
        let result = table[i];
        let selId = result.wuName + btConstants.SEPERATOR_SELECT + result.computerName + btConstants.SEPERATOR_SELECT + result.projectUrl;
        if (result.filtered)
        {
            let bFound = false;
            // Handle filter table
            for (var f=0;f<filter.length;f++)
            {
                let app = result.app+result.statusS;
                if (app === filter[f])
                {
                    bFound = true;
                    var rtf = result.resultTable;
                    for (var rt=0;rt<rtf.length;rt++)
                    { 
                        let resultF = rtf[rt];
                        let selIdF = resultF.wuName + btConstants.SEPERATOR_SELECT + resultF.computerName + btConstants.SEPERATOR_SELECT + resultF.projectUrl;
                        if (selIdF === sel.lastSel)
                        {
                            if (bFoundSelect)
                            {
                                bFoundEnd = true;
                            }
                            bFoundSelect = true;
                        }
                        if (selIdF === id)
                        {
                            if (bFoundSelect)
                            {
                                bFoundEnd = true;
                            }
                            bFoundSelect = true;
                        }
                        if (bFoundSelect)
                        {
                            sel.rowSelected.push(selIdF);
                            sel.present.push(true);
                            if (bFoundEnd)
                            {
                                return;
                            }
                        }
                    }
                }
            }            
            selId += result.app + "," + result.computerName;
        }
        if (selId === sel.lastSel)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;         
        }
        if (selId === id)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;        
        }
        if (bFoundSelect)
        {
            sel.rowSelected.push(selId);
            sel.present.push(true);
            if (bFoundEnd)
            {
                return;
            }
        }
    }
}

function clickShiftTransfers(gb,id)
{
    let table;
    let bFoundSelect = false;
    let bFoundEnd = false;
    sel = gb.rowSelect.transfers; 
    table = gb.currentTable.transfersTable
    sel.rowSelected = [];
    sel.present = [];
    for (let i = 0; i< table.length;i++)
    {
        let transfer = table[i];
        let selId = transfer.name + btConstants.SEPERATOR_SELECT + transfer.computerName + btConstants.SEPERATOR_SELECT + transfer.project_url;       
        if (selId === sel.lastSel)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;         
        }
        if (selId === id)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;        
        }
        if (bFoundSelect)
        {
            sel.rowSelected.push(selId);
            sel.present.push(true);
            if (bFoundEnd)
            {
                return;
            }
        }
    }   
}

function clickShiftMessages(gb,id)
{
    let table;
    let bFoundSelect = false;
    let bFoundEnd = false;
    sel = gb.rowSelect.messages; 
    table = gb.currentTable.messageTable
    sel.rowSelected = [];
    sel.present = [];
    for (let i = 0; i< table.length;i++)
    {
        let message = table[i];
        let selId =  message.seqno + btConstants.SEPERATOR_SELECT + message.computer + btConstants.SEPERATOR_SELECT + "";        
        if (selId === sel.lastSel)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;         
        }
        if (selId === id)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;        
        }
        if (bFoundSelect)
        {
            sel.rowSelected.push(selId);
            sel.present.push(true);
            if (bFoundEnd)
            {
                return;
            }
        }
    }   
}

function clickShiftHistory(gb,id)
{
    let table;
    let bFoundSelect = false;
    let bFoundEnd = false;
    sel = gb.rowSelect.history; 
    table = gb.currentTable.historyTable
    sel.rowSelected = [];
    sel.present = [];
    for (let i = 0; i< table.length;i++)
    {
        let history = table[i];  
        let selId = history.result + btConstants.SEPERATOR_SELECT + history.computerName + btConstants.SEPERATOR_SELECT + history.projectUrl;     
        if (selId === sel.lastSel)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;         
        }
        if (selId === id)
        {
            if (bFoundSelect)
            {
                bFoundEnd = true;
            }
            bFoundSelect = true;        
        }
        if (bFoundSelect)
        {
            sel.rowSelected.push(selId);
            sel.present.push(true);
            if (bFoundEnd)
            {
                return;
            }
        }
    }   
}