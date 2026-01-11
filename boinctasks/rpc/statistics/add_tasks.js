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

const State = require('../misc/state');
const conState = new State();
const Logging = require('../functions/logging');
const logging = new Logging();
const btC = require('../functions/btconstants');

let gTasksItems = []; // computer // tasks
let gTasksMaxNumberTotal = 1;
let gTasksMaxNumberWeek = 1;
let gTasksMaxNumberDay = 1;

class AddTasks{
    addTaskCount(con)
    {
      return doAddTaskCount(con);
    }
    addTaskHistoryCount(con,graphItem)
    {
      return doAddTaskHistoryCount(con,graphItem)
    }

    // we get here for every single project item
    getTasksComputer(con,projectItem)
    {
        try {
            if (!btC.PROJECT_SHOW_TASKS_COLUMN)
            {
              return "";
            }
            let computer = con.computerName;
            let project = projectItem.project;
            if (project == btC.INITIALIZING)
            {
                return "";
            }
            let computerItem = null;
            let bFound = false;
            let len = gTasksItems.length;
            for (let i=0;i<len;i++)
            {
                computerItem = gTasksItems[i];
                if (computerItem.computer == computer)
                {
                    bFound = true;
                    break;
                }
            }        
            if (!bFound)
            {
                computerItem = new Object(); 
                computerItem.computer = computer;
                computerItem.taskItem  = null;  
                gTasksItems.push(computerItem);
            }
 
            let taskItem = this.addTaskCount(con);
            this.addTaskHistoryCount(con,taskItem);      
            if (taskItem != null)
            {
                computerItem.taskItem = taskItem;
            }
            else
            {
                return "";
            }
            let taskString = getTaskString(computerItem,project);         
            return taskString; 
        } catch (error) {
            logging.logError('AddTasks,getTasksComputer', error);    
        }     
    }
  }
  module.exports = AddTasks;

function getTaskString(computerItem,project)
{
    try {
        let taskItem = computerItem.taskItem;
        if (taskItem == void 0)
        {
            return "?";
        }
        let now = new Date();
        let dayCount = 0;
        let weekCount = 0;
        let total = 0;
        let itemProject = null;
        for(let i=0; i<taskItem.length; i++)
        {
            itemProject = taskItem[i];
            if (itemProject.project == project)
            {                
                let received = itemProject.received;
                let lenRec = received.length;
                for (let rc=0;rc<lenRec;rc++)
                {
                    let receivedItem  = received[rc];
                    if (isToday(now,receivedItem))
                    {
                        dayCount++;
                        weekCount++;
                        total++;
                    }
                    else
                    {
                        if (isLast7Days(now,receivedItem))
                        {
                            weekCount++;
                            total++;
                        }
                        else
                        {
                            total++;
                        }
                    }
                }
                break;
            }
        }
        total = total.toString();
        weekCount = weekCount.toString();
        dayCount = dayCount.toString();        
        let tasks = total.padStart(gTasksMaxNumberTotal, "_") + "\u00A0|\u00A0" + weekCount.padStart(gTasksMaxNumberWeek, "_") + "\u00A0|\u00A0" + dayCount.padStart(gTasksMaxNumberDay, "_");
        if (total.length > gTasksMaxNumberTotal)
        {
            gTasksMaxNumberTotal = total.length;
        }
        if (weekCount.length > gTasksMaxNumberWeek)
        {
            gTasksMaxNumberWeek = weekCount.length;
        }
        if (dayCount.length > gTasksMaxNumberDay)
        {
            gTasksMaxNumberDay = dayCount.length;
        }                
        return tasks;
    } catch (error) 
    {
        logging.logError('AddTasks,getTaskString', error);    
    }   
}

function isToday (now, received)
{  
    let receivedDate = new Date(received);
    return receivedDate.getDate() === now.getDate() && receivedDate.getMonth() === now.getMonth() && receivedDate.getFullYear() === now.getFullYear();
}

function isLast7Days(now, received)
{  
    let week = 604800 * 1000;
    let receivedTime = new Date(received).getTime() + week;
    let nowTime = now.getTime();
    if (receivedTime > nowTime)
    {
        return true;        
    }
    return false;
}

function doAddTaskCount(con)
{
  try {
      let computer = con.computerName;
      var graphItem = []; 

      let results = con.results;
      if (results == null)
      {
        return null;
      }
      let table = results.resultTable;
      for (var i=0; i< table.length; i++)
      {
        if (table[i].filtered)
        {
            let tablef = table[i].resultTable;                
            for (var tf=0; tf< tablef.length; tf++)
            {
                processTable(con,graphItem,computer,tablef[tf]);
            }
        }
        else
        {
            processTable(con,graphItem,computer,table[i]);
        }
      }
      return graphItem;
  } catch (error) {
      logging.logError('AddTasks,addTaskCount', error);    
  }  
}

function processTable(con,graphItem,computer,tableItem)
{
  try {
    let projectUrl = tableItem.projectUrl;
    let ret = conState.getProject(con,projectUrl)
    let project = ret.project;   
          
    let recToDay = tableItem.received;  
    let receivedDate = new Date(recToDay*1000);
    receivedDate.setHours(0);
    receivedDate.setMinutes(0);
    receivedDate.setSeconds(0);
    receivedDate.setMilliseconds(0);
    let received = new Date(receivedDate).getTime()

    // check if we already have the project
    let iFound = -1;
    for (var gi=0; gi< graphItem.length; gi++)
    {
      if (graphItem[gi].project == project)
      {
        iFound = gi;
        break;
      }
    }
    if (iFound >=0)
    {
      graphItem[gi].received.push(received);
    }
    else
    {        
      newItem = new Object(); 
      newItem.computer = computer;        
      newItem.project = project;        
      newItem.received = [];
      newItem.received.push(received);        
      graphItem.push(newItem);
    } 

    let ii = 1;
  } catch (error) {
      logging.logError('AddTasks,processTable', error);    
  }   
}

function doAddTaskHistoryCount(con,graphItem)
{
  try {
    let computer = con.computerName;
    if (graphItem == null)
    {
      graphItem = []; 
    }
    let history = con.history;
    if (history == null)
    {
      return null;
    }
    let historyTable = history.table;
    if (historyTable == null)
    {
      return null;
    }

    for (var i=0; i< historyTable.length; i++)
    {
      processHistoryTable(con,graphItem,computer,historyTable[i]);
    }
    
    return graphItem;
    } catch (error) {
        logging.logError('AddTasks,addTaskHistoryCount', error);    
  }  
}

function processHistoryTable(con,graphItem,computer,tableItem)
{
  try {
    let project = tableItem.projectName
          
    let recToDay = tableItem.createTime;  
    let receivedDate = new Date(recToDay*1000);
    receivedDate.setHours(0);
    receivedDate.setMinutes(0);
    receivedDate.setSeconds(0);
    receivedDate.setMilliseconds(0);
    let received = new Date(receivedDate).getTime()

    // check if we already have the project
    let iFound = -1;
    for (var gi=0; gi< graphItem.length; gi++)
    {
      if (graphItem[gi].project == project)
      {
        iFound = gi;
        break;
      }
    }
    if (iFound >=0)
    {
      graphItem[gi].received.push(received);
    }
    else
    {        
      newItem = new Object(); 
      newItem.computer = computer;        
      newItem.project = project;        
      newItem.received = [];
      newItem.received.push(received);        
      graphItem.push(newItem);
    } 

    let ii = 1;
  } catch (error) {
      logging.logError('AddTasks,processHistoryTable', error);    
  }   
}