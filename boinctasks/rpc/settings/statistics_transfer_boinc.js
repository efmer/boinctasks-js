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

const {BrowserWindow} = require('electron');
const btC = require('../functions/btconstants');

let gStatisticsComputer = [];
let gStatisticsTransfer = [];
let gChildStatisticsTransfer = null;
let gCssDarkStatisticsTransfer = null;

class StatisticsTransferBoinc{
    start(type,gb)
    {
      switch(type)
      {
        case "menu":
          statisticsTransferStart(gb);
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
  module.exports = StatisticsTransferBoinc;

function statisticsTransferStart(gb)
{
    try {
      let title = "BoincTasks Js - " + btC.TL.DIALOG_BOINC_STATISTICS_TRANSFER.DBS_TITLE
      if (gChildStatisticsTransfer === null)
      {
        let state = windowsState.get("boinc_statistics_transfer",700,800)
    
        gChildStatisticsTransfer = new BrowserWindow({
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
          logging.logFile("StatisticsTransferBoinc, statisticsTransferStart", "state.max");
          gChildStatisticsTransfer.maximize();
        }        
        gChildStatisticsTransfer.loadFile('index/index_statistics_transfer_boinc.html')
        gChildStatisticsTransfer.once('ready-to-show', () => {    
//          gChildStatisticsTransfer.webContents.openDevTools()
          gChildStatisticsTransfer.show();  
          gChildStatisticsTransfer.setTitle(title);

          try {
            btC.TL.DIALOG_BOINC_STATISTICS_TRANSFER.DBS_MONTH_T = JSON.parse(btC.TL.DIALOG_BOINC_STATISTICS.DBS_MONTH)      
          } catch (error) {
            logging.logError('StatisticsBoinc,statisticsStart,DBS_MONTH', error);     
          }
          gChildStatisticsTransfer.webContents.send("translations",btC.TL.DIALOG_BOINC_STATISTICS_TRANSFER);     
          getStatisticsTransfer(gb);
        })
        gChildStatisticsTransfer.webContents.on('did-finish-load', () => {
          insertCssDark(gb.theme);
        })
        gChildStatisticsTransfer.on('maximize', function (event) {
        });
        gChildStatisticsTransfer.on('close', () => {
          let max = gChildStatisticsTransfer.isMaximized();          
          let bounds = gChildStatisticsTransfer.getBounds();
          windowsState.set("boinc_statistics_transfer",bounds.x,bounds.y, bounds.width, bounds.height,max)
          logging.logFile("StatisticsTransferBoinc, statisticsTransferStart", "close, store window, max:" + max);          
        })     
        gChildStatisticsTransfer.on('closed', () => {
          gChildStatisticsTransfer = null
        })    
      }
      else
      {
        gChildStatisticsTransfer.setTitle(title); 
        gChildStatisticsTransfer.hide();
        gChildStatisticsTransfer.show();  
        getStatisticsTransfer(gb);           
      }
    } catch (error) {
        logging.logError('StatisticsTransferBoinc,statisticsStart', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkStatisticsTransfer !== null)
    {
      gChildStatisticsTransfer.webContents.removeInsertedCSS(gCssDarkStatisticsTransfer) 
    }    
    gCssDarkStatisticsTransfer = await gChildStatisticsTransfer.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkStatisticsTransfer = null;
  }
}

function getStatisticsTransfer(gb)
{
  try {
    gStatisticsComputer = [];
    gStatisticsTransfer = [];
    setTimeout(getStatisticsTransferDelay, 500,gb) 
  } catch (error) {
    logging.logError('StatisticsTransferBoinc,getStatisticsTransfer', error);    
  }

}

function getStatisticsTransferDelay(gb)
{
  try {
    for (let i=0;i<gb.connections.length;i++)
    {
      let con = gb.connections[i];
      if (con.auth)
      {
        const sendArray = new SendArray();      
        sendArray.send(con,"<get_daily_xfer_history/>", dataReady);  
      }

    }   
  } catch (error) {
    logging.logError('StatisticsTransferBoinc,getStatisticsTransferDelay', error);    
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
        gStatisticsTransfer.push(result.dx);
        gStatisticsComputer.push(computerName);
      }
    }     
    sort(gStatisticsComputer,gStatisticsTransfer); 

    let listComputer = "";
    for (i=0;i<gStatisticsComputer.length;i++)
    {
      let item = gStatisticsComputer[i];
      listComputer += '<option selected value ="' + item + '">'+ item + '</option>';
    }
  
    gChildStatisticsTransfer.webContents.send('computers', listComputer);

    getStatistics();

  } catch (error) {
    logging.logError('StatisticsTransferBoinc,dataReady', error); 
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
              let statusArray = result['boinc_gui_rpc_reply']['daily_xfers'];
              if (functions.isDefined(statusArray))
              {
                  statusReturn = statusArray[0];
              }
          }
      });
    } catch (error) {
        logging.logError('StatisticsTransferBoinc,parse', error);           
        return null;
    }
    return statusReturn
}

// document ready

function getStatistics()
{
  statsArray = [];
  try {
    for (let s=0;s<gStatisticsTransfer.length;s++)
    {
      let items = new Object();           
      items.computerName = gStatisticsComputer[s];
      items.up = [];  
      items.down = [];
      statsArray.push(items);
      let transfers = gStatisticsTransfer[s];
      for (let t=0;t<transfers.length;t++)
      {
        let transfer = transfers[t];
        let when = parseInt(transfer.when)*86400000;
        let up = parseInt(transfer.up[0]);
        let down = parseInt(transfer.down[0]);
        let itemUp = [];
        let itemDown = [];
        itemUp.push(when);
        itemUp.push(up);
        itemDown.push(when);
        itemDown.push(down);

        items.up.push(itemUp);
        items.down.push(itemDown);
      }      
    }
  } catch (error) {
    logging.logError('StatisticsTransferBoinc,getStatistics', error);   
  }
  gChildStatisticsTransfer.webContents.send('graph', statsArray);
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
    logging.logError('StatisticsTransferBoinc,sort', error);   
  }
}
