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
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const ReadWrite  = require('../functions/readwrite');
const readWrite = new ReadWrite();
const btConstants = require('../functions/btconstants');
const Functions = require('../functions/functions');
const functions = new Functions();

const {BrowserWindow} = require('electron')

class SettingsColumnOrder
{
    start(gb)
    {
        openWindow(gb);
    }

    get()
    {
      try {
        return getOrder();          
      } catch (error) {
        logging.logError('SettingsColumnOrder,get', error);         
      }
    }

    apply(type,gb,data)
    {
      try {
        switch(type)
        {
          case btConstants.TAB_COMPUTERS:
            setComputers(gb, data)
          break;
          case btConstants.TAB_PROJECTS:
            setProjects(gb, data)
          break;                 
          case btConstants.TAB_TASKS:
            setTasks(gb, data)
          break;
          case btConstants.TAB_TRANSFERS:
            setTransfers(gb, data)
          break;
          case btConstants.TAB_MESSAGES:
            setMessages(gb, data)
          break;          
          case btConstants.TAB_HISTORY:
            setHistory(gb, data)
          break;          
        }  
        gChildColumn.hide();        
      } catch (error) {
        logging.logError('SettingsColumnOrder,set', error);          
      }
    }
}

module.exports = SettingsColumnOrder;

gChildColumn = null;

function getOrder()
{
  let order = new Object();

  let orderComputers = null;
  try {    
    orderComputers = JSON.parse(readWrite.read("settings\\order", "computers.json"));
    if (orderComputers === null)
    {
      orderComputers = defaultComputers();
    }
    if (!valid(orderComputers,btConstants.COMPUTERS_COLOMN_COUNT))
    {
      orderComputers = defaultComputers(); 
    }
    order.computers = orderComputers;    
  } catch (error) {
    logging.logError('SettingsColumnOrder,getOrder,orderComputers', error);      
  }

  let orderProjects = null;
  try {    
    orderProjects = JSON.parse(readWrite.read("settings\\order", "projects.json"));
    if (orderProjects === null)
    {
      orderProjects = defaultProjects();
    }
    if (!valid(orderProjects,btConstants.PROJECTS_COLOMN_COUNT))
    {
      orderProjects = defaultProjects(); 
    }
    order.projects = orderProjects;    
  } catch (error) {
    logging.logError('SettingsColumnOrder,getOrder,orderProjects', error);      
  }

  let orderTasks = new Object();
  try {   
    orderTasks = JSON.parse(readWrite.read("settings\\order", "tasks.json"));
    if (orderTasks === null)
    {
      orderTasks = defaultTasks();
    }
    if (!valid(orderTasks,btConstants.TASKS_COLOMN_COUNT))
    {
      orderTasks = defaultTasks(); 
    }
    order.tasks = orderTasks;    
  } catch (error) {
    logging.logError('SettingsColumnOrder,getOrder,orderTasks', error);      
  }

  let orderTransfers = new Object();
  try {   
    orderTransfers = JSON.parse(readWrite.read("settings\\order", "transfers.json"));
    if (orderTransfers === null)
    {
      orderTransfers = defaultTransfers();
    }
    if (!valid(orderTransfers,btConstants.TRANSFERS_COLOMN_COUNT))
    {
      orderTransfers = defaultTransfers(); 
    }
    order.transfers = orderTransfers;
  } catch (error) {
    logging.logError('SettingsColumnOrder,getOrder,orderTransfers', error);      
  }

  let orderMessages = new Object();
  try {   
    orderMessages = JSON.parse(readWrite.read("settings\\order", "messages.json"));
    if (orderMessages === null)
    {
      orderMessages = defaultMessages();
    }
    if (!valid(orderMessages,btConstants.MESSAGES_COLOMN_COUNT))
    {
      orderMessages = defaultMessages(); 
    }
    order.messages = orderMessages;
  } catch (error) {
    logging.logError('SettingsColumnOrder,getOrder,orderMessages', error);      
  }

  let orderHistory = new Object();
  try {   
    orderHistory = JSON.parse(readWrite.read("settings\\order", "history.json"));
    if (orderHistory === null)
    {
      orderHistory = defaultHistory();
    }
    if (!valid(orderHistory,btConstants.HISTORY_COLOMN_COUNT))
    {
      orderHistory = defaultHistory(); 
    }
    order.history = orderHistory;
  } catch (error) {
    logging.logError('SettingsColumnOrder,getOrder,orderHistory', error);      
  }  

  return order;
}

function defaultComputers()
{
  computers = new Object();
  computers.order = [];
  computers.check = [];
  let i;
  for (i=0;i<btConstants.COMPUTERS_COLOMN_COUNT;i++)
  {
    computers.order[i] = i;
  }
  for (i=0;i<11;i++)
  {
    computers.check[i] = true;
  }
  for (i;i<btConstants.COMPUTERS_COLOMN_COUNT;i++)
  {
    computers.check[i] = false;
  }
  return computers;
}

function defaultProjects()
{
  projects = new Object();
  projects.order = [];
  projects.check = [];
  let i;
  for (i=0;i<btConstants.PROJECTS_COLOMN_COUNT;i++)
  {
    projects.order[i] = i;
  }
  for (i=0;i<11;i++)
  {
    projects.check[i] = true;
  }
  for (i;i<btConstants.PROJECTS_COLOMN_COUNT;i++)
  {
    projects.check[i] = false;
  }
  return projects;
}

function defaultTasks()
{
  tasks = new Object();
  tasks.order = [];
  tasks.check = [];
  let i;
  for (i=0;i<btConstants.TASKS_COLOMN_COUNT;i++)
  {
    tasks.order[i] = i;
  }
  for (i=0;i<11;i++)
  {
    tasks.check[i] = true;
  }
  for (i;i<btConstants.TASKS_COLOMN_COUNT;i++)
  {
    tasks.check[i] = false;
  }
  return tasks;
}

function defaultTransfers()
{
  transfers = new Object();
  transfers.order = [];
  transfers.check = [];
  let i;
  for (i=0;i<btConstants.TRANSFERS_COLOMN_COUNT;i++)
  {
    transfers.order[i] = i;
  }
  for (i=0;i<11;i++)
  {
    transfers.check[i] = true;
  }
  for (i;i<btConstants.TRANSFERS_COLOMN_COUNT;i++)
  {
    transfers.check[i] = false;
  }
  return transfers;
}

function defaultMessages()
{
  messages = new Object();
  messages.order = [];
  messages.check = [];
  let i;
  for (i=0;i<btConstants.MESSAGES_COLUMN_COUNT;i++)
  {
    messages.order[i] = i;
  }
  for (i=0;i<11;i++)
  {
    messages.check[i] = true;
  }
  for (i;i<btConstants.MESSAGES_COLUMN_COUNT;i++)
  {
    messages.check[i] = false;
  }
  return messages;
}

function defaultHistory()
{
  history = new Object();
  history.order = [];
  history.check = [];
  let i;
  for (i=0;i<btConstants.HISTORY_COLUMN_COUNT;i++)
  {
    history.order[i] = i;
  }
  for (i=0;i<11;i++)
  {
    history.check[i] = true;
  }
  for (i;i<btConstants.HISTORY_COLUMN_COUNT;i++)
  {
    history.check[i] = false;
  }
  return history;
}

function valid(order, count)
{
  validLength(order,count)
  let checkA = [];
  validClear(checkA,count);
  let i;
  for (i=0;i<count;i++)
  {
    checkA[order.order[i]]++ ;
  }
  for (i=0;i<count;i++)
  {
    checkA[order.order[i]]++ ;
  }
  return valid1(checkA)
}

// in case new columns are added
function validLength(order, count)
{
  for (let i=0;i<count;i++)
  {
    if (!functions.isDefined(order.order[i]))
    {
      order.order[i] = i;
      order.check[i] = false;
    }
  }
}

function validClear(checkA,max)
{
  for (let i=0;i<max;i++)
  {
    checkA[i]=0;
  }
}

function valid1(checkA)
{
  for (let i=0;i<checkA.lenght;i++)
  {
    if (checkA[i] !== 1)
    {
      return false;
    }
  }
  return true;
}

function setComputers(gb, data)
{
  if (data.length != btConstants.COMPUTERS_COLOMN_COUNT*2) return;
  let fetch = 0;
  for (let i=0;i<btConstants.COMPUTERS_COLOMN_COUNT;i++)
  {
    let pos =  data[fetch++];
    let check =  data[fetch++];
    gb.order.computers.order[pos] = i;
    gb.order.computers.check[pos] = check;
  }
  json = JSON.stringify(gb.order.computers);
  readWrite.write("settings\\order", "computers.json",json);
}

function setProjects(gb, data)
{
  if (data.length != btConstants.PROJECTS_COLOMN_COUNT*2) return;
  let fetch = 0;
  for (let i=0;i<btConstants.PROJECTS_COLOMN_COUNT;i++)
  {
    let pos =  data[fetch++];
    let check =  data[fetch++];
    gb.order.projects.order[pos] = i;
    gb.order.projects.check[pos] = check;
  }
  json = JSON.stringify(gb.order.projects);
  readWrite.write("settings\\order", "projects.json",json);
}

function setTasks(gb, data)
{
  if (data.length != btConstants.TASKS_COLOMN_COUNT*2) return;
  let fetch = 0;
  for (let i=0;i<btConstants.TASKS_COLOMN_COUNT;i++)
  {
    let pos =  data[fetch++];
    let check =  data[fetch++];
    gb.order.tasks.order[pos] = i;
    gb.order.tasks.check[pos] = check;
  }
  json = JSON.stringify(gb.order.tasks);
  readWrite.write("settings\\order", "tasks.json",json);
}

function setTransfers(gb, data)
{
  if (data.length != btConstants.TRANSFERS_COLOMN_COUNT*2) return;
  let fetch = 0;
  for (let i=0;i<btConstants.TRANSFERS_COLOMN_COUNT;i++)
  {
    let pos =  data[fetch++];
    let check =  data[fetch++];
    gb.order.transfers.order[pos] = i;
    gb.order.transfers.check[pos] = check;
  }
  json = JSON.stringify(gb.order.transfers);
  readWrite.write("settings\\order", "transfers.json",json);
}

function setMessages(gb, data)
{
  if (data.length != btConstants.MESSAGES_COLUMN_COUNT*2) return;
  let fetch = 0;
  for (let i=0;i<btConstants.MESSAGES_COLUMN_COUNT;i++)
  {
    let pos =  data[fetch++];
    let check =  data[fetch++];
    gb.order.messages.order[pos] = i;
    gb.order.messages.check[pos] = check;
  }
  json = JSON.stringify(gb.order.messages);
  readWrite.write("settings\\order", "messages.json",json);
}

function setHistory(gb, data)
{
  if (data.length != btConstants.HISTORY_COLUMN_COUNT*2) return;
  let fetch = 0;
  for (let i=0;i<btConstants.HISTORY_COLUMN_COUNT;i++)
  {
    let pos =  data[fetch++];
    let check =  data[fetch++];
    gb.order.history.order[pos] = i;
    gb.order.history.check[pos] = check;
  }
  json = JSON.stringify(gb.order.history);
  readWrite.write("settings\\order", "history.json",json);
}

function setWindow(gb)
{
  try {
    switch(gb.currentTable.name)
    {
      case btConstants.TAB_COMPUTERS:
        setWindowsComputers(gb, btConstants.TAB_COMPUTERS)
      break;      
      case btConstants.TAB_PROJECTS:
        setWindowsProjects(gb, btConstants.TAB_PROJECTS)
      break;      
      case btConstants.TAB_TASKS:
        setWindowsTasks(gb, btConstants.TAB_TASKS)
      break;
      case btConstants.TAB_TRANSFERS:
        setWindowsTransfers(gb, btConstants.TAB_TRANSFERS)
      break; 
      case btConstants.TAB_MESSAGES:
        setWindowsMessages(gb, btConstants.TAB_MESSAGES)
      break;         
      case btConstants.TAB_HISTORY:
        setWindowsHistory(gb, btConstants.TAB_HISTORY)
      break;          
    }
  } catch (error) {
    logging.logError('SettingsColumnOrder,set', error);   
  }
}

function setWindowsComputers(gb, type)
{
  let items = '<b>Computers</b><br><br><div id="sort_items" class="list-group">';

  let order = gb.order.computers;

  itemsArray = [];
  itemsArray[order.order[0]] = addItem("",0,order);
  itemsArray[order.order[1]] = addItem(btConstants.COMPUTERS_GROUP,1,order);
  itemsArray[order.order[2]] = addItem(btConstants.GENERAL_COMPUTER,2,order);
  itemsArray[order.order[3]] = addItem(btConstants.COMPUTERS_IP,3,order);
  itemsArray[order.order[4]] = addItem(btConstants.COMPUTERS_CPID,4,order);
  itemsArray[order.order[5]] = addItem(btConstants.COMPUTERS_PORT,5,order);
  itemsArray[order.order[6]] = addItem(btConstants.COMPUTERS_PASSWORD,6,order);
  itemsArray[order.order[7]] = addItem(btConstants.COMPUTERS_BOINC,7,order);
  itemsArray[order.order[8]] = addItem(btConstants.COMPUTERS_PLATFORM,8,order);
  itemsArray[order.order[9]] = addItem(btConstants.GENERAL_STATUS,9,order);

  for (let i=0;i<itemsArray.length;i++)
  {
    items += itemsArray[i];
  }
  items += '</div>'
  let str = JSON.stringify(items);
  gChildColumn.webContents.send('set', type, str);
}

function setWindowsProjects(gb, type)
{
  let items = '<b>Projects</b><br><br><div id="sort_items" class="list-group">';

  let order = gb.order.projects;

  itemsArray = [];
  itemsArray[order.order[0]] = addItem(btConstants.GENERAL_COMPUTER,0,order);
  itemsArray[order.order[1]] = addItem(btConstants.GENERAL_PROJECT,1,order);
  itemsArray[order.order[2]] = addItem(btConstants.PROJECTS_ACCOUNT,2,order);
  itemsArray[order.order[3]] = addItem(btConstants.PROJECTS_TEAM,3,order);
  itemsArray[order.order[4]] = addItem(btConstants.PROJECTS_CREDITS,4,order);
  itemsArray[order.order[5]] = addItem(btConstants.PROJECTS_CREDITS_AVG,5,order);
  itemsArray[order.order[6]] = addItem(btConstants.PROJECTS_CREDITS_HOST,6,order);
  itemsArray[order.order[7]] = addItem(btConstants.PROJECTS_CREDITS_HOST_AVG,7,order);
  itemsArray[order.order[8]] = addItem(btConstants.PROJECTS_SHARE,8,order);
  itemsArray[order.order[9]] = addItem(btConstants.GENERAL_STATUS,9,order);
  itemsArray[order.order[10]] = addItem(btConstants.PROJECTS_REC,10,order);  

  for (let i=0;i<itemsArray.length;i++)
  {
    items += itemsArray[i];
  }
  items += '</div>'
  let str = JSON.stringify(items);
  gChildColumn.webContents.send('set', type, str);
}

function setWindowsTasks(gb, type)
{
  let items = '<b>Tasks</b><br><br><div id="sort_items" class="list-group">';

  let order = gb.order.tasks;

  itemsArray = [];
  itemsArray[order.order[0]] = addItem(btConstants.GENERAL_COMPUTER,0,order);
  itemsArray[order.order[1]] = addItem(btConstants.GENERAL_PROJECT,1,order);
  itemsArray[order.order[2]] = addItem(btConstants.GENERAL_APPLICATION,2,order);
  itemsArray[order.order[3]] = addItem(btConstants.GENERAL_NAME,3,order);
  itemsArray[order.order[4]] = addItem(btConstants.GENERAL_ELAPSED,4,order);
  itemsArray[order.order[5]] = addItem(btConstants.GENERAL_CPU,5,order);
  itemsArray[order.order[6]] = addItem(btConstants.GENERAL_PROGRESS,6,order);
  itemsArray[order.order[7]] = addItem(btConstants.TASK_TIMELEFT,7,order);
  itemsArray[order.order[8]] = addItem(btConstants.TASK_DEADLINE,8,order);
  itemsArray[order.order[9]] = addItem(btConstants.TASK_USE,9,order);
  itemsArray[order.order[10]] = addItem(btConstants.GENERAL_STATUS,10,order);
  itemsArray[order.order[11]] = addItem(btConstants.TASK_CHECKPOINT,11,order);
  itemsArray[order.order[12]] = addItem(btConstants.TASK_RECEIVED,12,order);
  itemsArray[order.order[13]] = addItem(btConstants.TASK_MEMORYV,13,order);
  itemsArray[order.order[14]] = addItem(btConstants.TASK_MEMORY,14,order);

  for (let i=0;i<itemsArray.length;i++)
  {
    items += itemsArray[i];
  }
  items += '</div>'
  let str = JSON.stringify(items);
  gChildColumn.webContents.send('set', type, str);
}

function setWindowsTransfers(gb, type)
{
  let items = '<b>Transfers</b><br><br><div id="sort_items" class="list-group">';

  let order = gb.order.transfers;

  itemsArray = [];
  itemsArray[order.order[0]] = addItem(btConstants.GENERAL_COMPUTER,0,order);
  itemsArray[order.order[1]] = addItem(btConstants.GENERAL_PROJECT,1,order);
  itemsArray[order.order[2]] = addItem(btConstants.TRANSFERS_FILE,2,order);
  itemsArray[order.order[3]] = addItem(btConstants.GENERAL_PROGRESS,3,order);
  itemsArray[order.order[4]] = addItem(btConstants.TRANSFERS_SIZE,4,order);
  itemsArray[order.order[5]] = addItem(btConstants.GENERAL_ELAPSED,5,order);
  itemsArray[order.order[6]] = addItem(btConstants.TRANSFERS_SPEED,6,order);
  itemsArray[order.order[7]] = addItem(btConstants.GENERAL_STATUS,7,order);

  for (let i=0;i<itemsArray.length;i++)
  {
    items += itemsArray[i];
  }
  items += '</div>'
  let str = JSON.stringify(items);
  gChildColumn.webContents.send('set', type, str);
}

function setWindowsMessages(gb, type)
{
  let items = '<b>Messages</b><br><br><div id="sort_items" class="list-group">';

  let order = gb.order.messages;

  itemsArray = [];
  itemsArray[order.order[0]] = addItem(btConstants.GENERAL_COMPUTER,0,order);
  itemsArray[order.order[1]] = addItem(btConstants.MESSAGES_NR,1,order);
  itemsArray[order.order[2]] = addItem(btConstants.GENERAL_PROJECT,2,order);
  itemsArray[order.order[3]] = addItem(btConstants.MESSAGES_TIME,3,order);
  itemsArray[order.order[4]] = addItem(btConstants.MESSAGES_MESSAGE,4,order);

  for (let i=0;i<itemsArray.length;i++)
  {
    items += itemsArray[i];
  }
  items += '</div>'
  let str = JSON.stringify(items);
  gChildColumn.webContents.send('set', type, str);
}

function setWindowsHistory(gb, type)
{
  let items = '<b>History</b><br><br><div id="sort_items" class="list-group">';

  let order = gb.order.history;

  itemsArray = [];
  itemsArray[order.order[0]] = addItem(btConstants.GENERAL_COMPUTER,0,order);
  itemsArray[order.order[1]] = addItem(btConstants.GENERAL_PROJECT,1,order);
  itemsArray[order.order[2]] = addItem(btConstants.GENERAL_APPLICATION ,2,order);
  itemsArray[order.order[3]] = addItem(btConstants.GENERAL_NAME,3,order);
  itemsArray[order.order[4]] = addItem(btConstants.GENERAL_ELAPSED,4,order);
  itemsArray[order.order[5]] = addItem(btConstants.GENERAL_CPU,5,order);
  itemsArray[order.order[6]] = addItem(btConstants.GENERAL_PROGRESS,6,order);  
  itemsArray[order.order[7]] = addItem(btConstants.HISTORY_COMPLETED,7,order);
  itemsArray[order.order[8]] = addItem(btConstants.GENERAL_STATUS,8,order);

  for (let i=0;i<itemsArray.length;i++)
  {
    items += itemsArray[i];
  }
  items += '</div>'
  let str = JSON.stringify(items);
  gChildColumn.webContents.send('set', type, str);
}


function addItem(name,id,order)
{
  let check = ""; 
  if (order.check[id]) check = "checked";

  let item = '<div class="list-group-item" id="' + id + '"><input id="check_' + id +'" type="checkbox" '+ check + '>&nbsp;'+ name + '</div>';
  return item;
}

function openWindow(gb)
{
    try {
        let title = "BoincTasks Js Colomn order";
        if (gChildColumn == null)
        {
          let state = windowsState.get("column",400,600)
      
          gChildColumn = new BrowserWindow({
            'x' : state.x,
            'y' : state.y,
            'width': state.width,
            'height': state.height,
            webPreferences: {
              sandbox : false,
              contextIsolation: false,  
              nodeIntegration: true,
              nodeIntegrationInWorker: true,        
              preload: './preload/preload.js'
            }
          });
          gChildColumn.loadFile('index/index_column_order.html')
          gChildColumn.once('ready-to-show', () => {    
//          gChildColumn.webContents.openDevTools()
          gChildColumn.show();  
          gChildColumn.setTitle(title);
          setWindow(gb);
//          gChildColumn.webContents.send('update', osPlatform, osArch, version); 
          }) 
          gChildColumn.on('close', () => {
            let bounds = gChildColumn.getBounds();
            windowsState.set("column",bounds.x,bounds.y, bounds.width, bounds.height)
          })     
          gChildColumn.on('closed', () => {
            gChildColumn = null
          })    
        }
        else
        {
            gChildColumn.setTitle(title); 
            gChildColumn.hide();
            gChildColumn.show();  
            setWindow(gb);
//            gChildColumn.webContents.send('update', osPlatform, osArch, version);             
        }
              
    } catch (error) {
        logging.logError('SettingsColumnOrder,openWindow', error);        
    }  
}