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
const SendArray = require('../misc/send_array');
const State = require('../misc/state');
const conState = new State();

const {BrowserWindow} = require('electron');
const btC = require('../functions/btconstants');
//const { support } = require('jquery');

let gStatisticsComputer = [];
let gStatisticsProjectName = [];
let gStatisticsProjectUrl = [];
let gStatisticsProjects = null;

let gChildStatistics = null;
let gCssDarkStatistics = null;

class StatisticsBoinc{
    start(type,gb)
    {
      switch(type)
      {
        case "menu":
          statisticsStart(gb);
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
  module.exports = StatisticsBoinc;

function statisticsStart(gb)
{
    try {
      let title = "BoincTasks Js - " + btC.TL.DIALOG_BOINC_STATISTICS.DBS_TITLE
      if (gChildStatistics == null)
      {
        let state = windowsState.get("boinc_statistics",700,800)
    
        gChildStatistics = new BrowserWindow({
          'x' : state.x,
          'y' : state.y,
          'width': state.width,
          'height': state.height,
          webPreferences: {
            sandbox : false,
            contextIsolation: false,  
            nodeIntegration: true,
            nodeIntegrationInWorker: true,        
            preload:'${__dirname}/preload/preload.js',
          }
        });
        if (state.max)
        {     
          logging.logFile("StatisticsBoinc, statisticsStart", "state.max");
          gChildStatistics.maximize();
        }        
        gChildStatistics.loadFile('index/index_statistics_boinc.html')
        gChildStatistics.once('ready-to-show', () => {    
//        gChildStatistics.webContents.openDevTools()
          gChildStatistics.show();  
          gChildStatistics.setTitle(title);

          try {
            btC.TL.DIALOG_BOINC_STATISTICS.DBS_MONTH_T = JSON.parse(btC.TL.DIALOG_BOINC_STATISTICS.DBS_MONTH)      
          } catch (error) {
            logging.logError('StatisticsBoinc,statisticsStart,DBS_MONTH', error);     
          }
          gChildStatistics.webContents.send("translations",btC.TL.DIALOG_BOINC_STATISTICS);     
          getStatistics(gb);
        })
        gChildStatistics.webContents.on('did-finish-load', () => {
          insertCssDark(gb.theme);
        })
        gChildStatistics.on('maximize', function (event) {
        });
        gChildStatistics.on('close', () => {
          let max = gChildStatistics.isMaximized();          
          let bounds = gChildStatistics.getBounds();
          windowsState.set("boinc_statistics",bounds.x,bounds.y, bounds.width, bounds.height,max)
          logging.logFile("StatisticsBoinc, statisticsStart", "close, store window, max:" + max);          
        })     
        gChildStatistics.on('closed', () => {
          gChildStatistics = null
        })    
      }
      else
      {
        gChildStatistics.setTitle(title); 
        gChildStatistics.hide();
        gChildStatistics.show();  
/*
        try {
          btC.TL.DIALOG_BOINC_STATISTICS.DBS_MONTH_T = JSON.parse(btC.TL.DIALOG_BOINC_STATISTICS.DBS_MONTH)      
        } catch (error) {
          logging.logError('StatisticsBoinc,statisticsStart,DBS_MONTH', error);     
        }
        gChildStatistics.webContents.send("translations",btC.TL.DIALOG_BOINC_STATISTICS);
*/
        getStatistics(gb);           
      }
    } catch (error) {
        logging.logError('StatisticsBoinc,statisticsStart', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkStatistics !== null)
    {
      gChildStatistics.webContents.removeInsertedCSS(gCssDarkStatistics) 
    }    
    gCssDarkStatistics = await gChildStatistics.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkStatistics = null;
  }
}

function getStatistics(gb)
{
  try {
    gStatisticsComputer = [];
    gStatisticsProjectName = [];
    gStatisticsProjectUrl = [];
    gStatisticsProjects = [];
    setTimeout(getStatisticsDelay, 500,gb) 
  } catch (error) {
    logging.logError('StatisticsBoinc,getStatistics', error);    
  }

}

function getStatisticsDelay(gb)
{
  try {
    for (let i=0;i<gb.connections.length;i++)
    {
      let con = gb.connections[i];
      if (con.auth)
      {
        const sendArray = new SendArray();      
        sendArray.send(con,"<get_statistics/>", dataReady);  
      }

    }   
  } catch (error) {
    logging.logError('StatisticsBoinc,getStatisticsDelay', error);    
  }

}

function dataReady(data)
{
  try {
    let result = parse(this.client_completeData);
    if (result != null)
    {   
      let computerName = this.computerName;
      if (gStatisticsComputer.indexOf(computerName) < 0)
      {
        gStatisticsComputer.push(computerName);
      }

      let stats = result.project_statistics;
      for (let i=0;i<stats.length;i++)
      {
        let url = stats[i].master_url[0];
        let project = url;
        if (this.conIn.state !== null)
        {
          project = conState.getProject(this.conIn,url);
          let indexPN = gStatisticsProjectName.indexOf(project);
          if (indexPN < 0)
          {
            gStatisticsProjectName.push(project);
            url = functions.normalizeUrl(url);
            gStatisticsProjectUrl.push(url);
          }
        }
        let itemStat = new Object();
        itemStat.computerName = computerName;
        itemStat.stats = stats[i];
        gStatisticsProjects.push(itemStat);
      }
    }     


    sort(gStatisticsProjectName, gStatisticsProjectUrl);
    sort(gStatisticsComputer,null); 


    let listProject = "";
    for (let i=0;i<gStatisticsProjectName.length;i++)
    {
      let item = gStatisticsProjectName[i];
      listProject += '<option value ="' + item + '">'+ item + '</option>';
    }
    let listComputer = "";
    for (i=0;i<gStatisticsComputer.length;i++)
    {
      let item = gStatisticsComputer[i];
      listComputer += '<option selected value ="' + item + '">'+ item + '</option>';
    }
  
    gChildStatistics.webContents.send('projects', listProject, listComputer);

    getProjects();

  } catch (error) {
    logging.logError('StatisticsBoinc,dataReady', error); 
  } 
}

function parse(xml)
{
    let statusReturn = null;
    try {
      let parseString = require('xml2js').parseString;
      parseString(xml, function (err, result) {
          if (functions.isDefined(result))
          {
              let statusArray = result['boinc_gui_rpc_reply']['statistics'];
              if (functions.isDefined(statusArray))
              {
                  statusReturn = statusArray[0];
              }
          }
      });
    } catch (error) {
        logging.logError('StatisticsBoinc,parse', error);           
        return null;
    }
    return statusReturn
}

// document ready

function getProjects()
{
  let projectArray= [];  
  try {
    for (let s=0;s<gStatisticsProjects.length;s++)
    {
      let stats = gStatisticsProjects[s].stats;
      let url = stats.master_url[0];
      url = functions.normalizeUrl(url);

      let found = gStatisticsProjectUrl.indexOf(url);
      let project = gStatisticsProjectName[found];
  
      let items = new Object();           
      items.computerName = gStatisticsProjects[s].computerName;
      items.project = project;          
      items.host_expavg_credit = [];
      items.host_total_credit = [];
      items.user_expavg_credit = [];
      items.user_total_credit = [];
      projectArray.push(items);
      let days = stats.daily_statistics;
      for (let d=0;d<days.length;d++)
      {
        let item_host_expavg_credit = [];
        let item_host_total_credit = [];
        let item_user_expavg_credit = [];
        let item_user_total_credit = [];
        let day = days[d];
        let day1000 = parseInt(day.day) * 1000;
        item_host_expavg_credit.push(parseInt(day1000));
        item_host_expavg_credit.push(parseFloat(day.host_expavg_credit));
        items.host_expavg_credit.push(item_host_expavg_credit);

        item_host_total_credit.push(parseInt(day1000));
        item_host_total_credit.push(parseFloat(day.host_total_credit));
        items.host_total_credit.push(item_host_total_credit);

        item_user_expavg_credit.push(parseInt(day1000));
        item_user_expavg_credit.push(parseFloat(day.user_expavg_credit));
        items.user_expavg_credit.push(item_user_expavg_credit);

        item_user_total_credit.push(parseInt(day1000));
        item_user_total_credit.push(parseFloat(day.user_total_credit));
        items.user_total_credit.push(item_user_total_credit);
      }      
    }
  } catch (error) {
    logging.logError('StatisticsBoinc,gotProjects', error);   
  }
  gChildStatistics.webContents.send('graph', projectArray);
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
    logging.logError('StatisticsBoinc,sort', error);   
  }
}
