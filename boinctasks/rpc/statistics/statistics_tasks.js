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
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
//const SendArray = require('../misc/send_array');
const AddTasks = require('../statistics/add_tasks');
const addTasks = new AddTasks();

const {BrowserWindow} = require('electron');
const btC = require('../functions/btconstants');
//const { support } = require('jquery');

let gStatisticsComputer = [];


let gChildTasksStatistics = null;
let gCssDarkTasksStatistics = null;

class StatisticsTasksBoinc{
    start(type,gb)
    {
      switch(type)
      {
        case "menu":
          statisticsTasksStart(gb);
        break;
    //    case "projects":
    //      getProjects(gb)
    //    break;
      }
    }

    setTheme(css)
    {
        insertCssDark(css);
    }    
  }
  module.exports = StatisticsTasksBoinc;

function statisticsTasksStart(gb)
{
    try {
      let title = "BoincTasks Js - " + btC.TL.DIALOG_BOINC_STATISTICS_TASKS.DBS_TITLE;
      if (gChildTasksStatistics == null)
      {
        let state = windowsState.get("boinc_tasks_statistics",700,800)
    
        gChildTasksStatistics = new BrowserWindow({
          'x' : state.x,
          'y' : state.y,
          'width': state.width,
          'height': state.height,
          webPreferences: {
            sandbox : false,
            contextIsolation: false,  
            nodeIntegration: true,
            nodeIntegrationInWorker: true,        
   //         preload:'${__dirname}/preload/preload.js',
          }
        });
        if (state.max)
        {     
          logging.logFile("StatisticsTasksBoinc, statisticsStart", "state.max");
          gChildTasksStatistics.maximize();
        }        
        gChildTasksStatistics.loadFile('index/index_statistics_tasks.html')
        gChildTasksStatistics.once('ready-to-show', () => {    

          gChildTasksStatistics.show();  
          gChildTasksStatistics.setTitle(title);
          getTasksStatistics(gb);   
        })
     
        gChildTasksStatistics.webContents.on('did-finish-load', () => {
          if (btC.DEBUG_WINDOW)
          {
            //let devtools = new BrowserWindow();
            //gChildTasksStatistics.webContents.setDevToolsWebContents(devtools.webContents);
            //gChildTasksStatistics.webContents.openDevTools({ mode: 'detach' });
            gChildTasksStatistics.webContents.openDevTools();
          }          
          insertCssDark(gb.theme); 
          try {
            btC.TL.DIALOG_BOINC_STATISTICS_TASKS.DBS_MONTH_T = JSON.parse(btC.TL.DIALOG_BOINC_STATISTICS.DBS_MONTH);
            btC.TL.DIALOG_BOINC_STATISTICS_TASKS.DBS_BUTTON_HIDE = btC.TL.DIALOG_BOINC_STATISTICS.DBS_BUTTON_HIDE;
            btC.TL.DIALOG_BOINC_STATISTICS_TASKS.DBS_COMPUTERS = btC.TL.DIALOG_BOINC_STATISTICS.DBS_COMPUTERS;
            btC.TL.DIALOG_BOINC_STATISTICS_TASKS.DBS_PROJECTS = btC.TL.DIALOG_BOINC_STATISTICS.DBS_PROJECTS;
            btC.TL.DIALOG_BOINC_STATISTICS_TASKS.DBS_STAT_COMPUTER = btC.TL.DIALOG_BOINC_STATISTICS.DBS_STAT_COMPUTER;            
            btC.TL.DIALOG_BOINC_STATISTICS_TASKS.DBS_STAT_PROJECT = btC.TL.DIALOG_BOINC_STATISTICS.DBS_STAT_PROJECT;
          } catch (error) {
            logging.logError('StatisticsTasksBoinc,statisticsStart,DBS_MONTH', error);     
          }                     
          gChildTasksStatistics.webContents.send("translations",btC.TL.DIALOG_BOINC_STATISTICS_TASKS);    // Translations must be this early.                          
        })

        gChildTasksStatistics.on('maximize', function (event) {
        });

        gChildTasksStatistics.on('close', () => {
          let max = gChildTasksStatistics.isMaximized();          
          let bounds = gChildTasksStatistics.getBounds();
          windowsState.set("boinc_tasks_statistics",bounds.x,bounds.y, bounds.width, bounds.height,max)
          logging.logFile("StatisticsTasksBoinc, statisticsTasksStart", "close, store window, max:" + max);          
        })  
           
        gChildTasksStatistics.on('closed', () => {
          gChildTasksStatistics = null
        })    
      }
      else
      {
        gChildTasksStatistics.setTitle(title); 
        gChildTasksStatistics.hide();
        gChildTasksStatistics.show();  

        getTasksStatistics(gb);           
      }
    } catch (error) {
        logging.logError('StatisticsTasksBoinc,statisticsStart', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkStatistics !== null)
    {
      gChildTasksStatistics.webContents.removeInsertedCSS(gCssDarkStatistics) 
    }    
    gCssDarkStatistics = await gChildTasksStatistics.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkStatistics = null;
  }
}

function getTasksStatistics(gb)
{
  try {
    let graph = [];
    for (let i=0;i<gb.connections.length;i++)
    {
      let con = gb.connections[i];
      let graphItem = addTasks.addTaskCount(con);
      addTasks.addTaskHistoryCount(con,graphItem);      
      if (graphItem != null)
      {
       // let computer = con.computerName;
       // var graphItem = new Object(); 
       // graphItem.computer = computer;
       // graphItem.data = [];
       // graphItem.data.push(conItem);
        graph.push(graphItem);
      }
    }   

    let listComputer = [];
    let listProject = [];
    let dropComputer = "";
    let dropProject = "";
    let statsArray = [];
    for (let i=0;i<graph.length;i++)
    {
      let graphItems = graph[i];      
      for (let ii=0;ii<graphItems.length;ii++)
      {
        let graphItem = graphItems[ii];
        let computer = graphItem.computer;

        let bFound = false;
        for (let d=0;d<listComputer.length;d++)
        {
          if (computer == listComputer[d])
          {
            bFound = true;
          }
        }
        if (!bFound)
        {
          listComputer.push(computer);
        }

        let project = graphItem.project;
        bFound = false;
        for (let d=0;d<listProject.length;d++)
        {
          if (project == listProject[d])
          {
            bFound = true;
          }
        }

        if (!bFound)
        {
          listProject.push(project);
        }
        let items = new Object();           
        items.computerName = computer;
        items.project = project;        
        items.data = [];  
        statsArray.push(items);

        let receivedArray = graphItem.received;
        if (receivedArray != null)
        {
          receivedArray.sort();
          let whenArray = [];
          let tasksArray = [];

          for (let r=0;r<receivedArray.length;r++) 
          {
            let when = receivedArray[r];
            if (when == undefined)
            {
              continue;
            }
            whenArray.push(when);
            let tasks = 0;
            for (let rr=r;rr<receivedArray.length;rr++) 
            {                              
              if (when == receivedArray[rr])
              {
                tasks++;
                delete(receivedArray[rr]);
              }
            }
            tasksArray.push(tasks);
          }

          for (let r=0;r<whenArray.length;r++)
          {
            let item = [];
            let when = whenArray[r];///1000; // javascript in ms epoch in seconds
            item.push(when);
            let task = tasksArray[r];
            item.push(task);
            items.data.push(item)
          }
        }
      }
        let yy = 1;
    }
    
    gChildTasksStatistics.webContents.send('graph', statsArray);    

    listComputer.sort();
    for (let i=0;i<listComputer.length;i++)
    {
      dropComputer += '<option selected value ="' + listComputer[i] + '">'+ listComputer[i] + '</option>';
    }
    listProject.sort();
    for (let i=0;i<listProject.length;i++)
    {
         dropProject += '<option value ="' + listProject[i] + '">'+ listProject[i] + '</option>';     
    }    

    for (i=0;i<gStatisticsComputer.length;i++)
    {
      let item = gStatisticsComputer[i];

    }
  
    gChildTasksStatistics.webContents.send('projects', dropProject, dropComputer);
    

  } catch (error) {
    logging.logError('StatisticsTasksBoinc,getStatisticsDelay', error);    
  }
}



function sort(table, table2)
{
  // we have to sort this way because we have 2 arrays to sort.
  try {
    let bSort = true;
    while(bSort)
    {
      bSort = false;
      for (let i=0;i<table.length-1;i++)
      {
        if (table[i] > table[i+1])
        {
          [table[i], table[i+1]] = [table[i+1], table[i]]
          if (table2 !== null) [table2[i], table2[i+1]] = [table2[i+1], table2[i]]
          bSort = true;
        }
      }
    }    
  } catch (error) {
    logging.logError('StatisticsTasksBoinc,sort', error);   
  }
}
