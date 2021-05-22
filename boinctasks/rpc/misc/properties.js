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
const Functions = require('../functions/functions');
const functions = new Functions();

const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const State = require('../misc/state');
const conState = new State();

const btConstants = require('../functions/btconstants');

const {BrowserWindow} = require('electron')

let gCssDarkProperties = null
let gChildProperties = null;

class Properties{
  task(selected,gb)
  {
    taskInfo(selected,gb)
  }
  setTheme(css)
  {
      insertCssDark(css);
  }
}  
module.exports = Properties;

function taskInfo(selected,gb)
{
  try {
    let connections = gb.connections;
      let prop = "<table>";
      
      for (let i=0;i<selected.length;i++ )
      {
        let res = selected[i].split(btConstants.SEPERATOR_SELECT);
        if (res.length !== 3) break;
        let wuName = res[0];
        let computer = res[1];
        let url = res[2];
        let wu = "";

        if (i>0) prop += addLine();

        for (let c=0; c<connections.length;c++)
        {
          if (connections[c].computerName === computer)
          {
            let con = connections[c];
            let results = con.results.resultTable;
            for(let r=0; r<results.length;r++)
            {
              let resultF = null;
              let result = results[r];
              if (result.filtered)
              {
                  for (let rt=0;rt<result.resultTable.length;rt++)
                  {
                    if (wuName == result.resultTable[rt].wuName) 
                    {
                      resultF = result.resultTable[rt];
                      break;
                    }
                  }
              }
              else 
              {
                if (wuName == result.wuName)
                {
                  resultF = result;
                }
              }
              if (resultF !== null)
              {
                  wu = resultF.wu;                        
                  prop += addInfo("Computer",computer);
                  prop += addInfo("Project", resultF.projectUrl + " | " + resultF.project);
                  let appUf =  conState.getAppUf(con, wu);
                  let app = conState.getApp(con, wu);
                  prop += addInfo("App Version", resultF.version);                        
                  prop += addInfo("App User", appUf);
                  prop += addInfo("Application", app);
                  prop += addInfo("Name",resultF.wu);
                  prop += addInfo("Name Wu",resultF.wuName);                        
                  let elapsedS = functions.getFormattedTimeInterval(resultF.elapsed); 
                  prop += addInfo("Elapsed",elapsedS);
                  let cpu = parseInt(resultF.cpu);
                  let cpuS = "";
                  if (cpu > 0)
                  {             
                      cpuS = cpu.toFixed(2) + "%";                     
                  } 
                  prop += addInfo("Cpu", cpuS);
                  let fraction = parseInt(resultF.fraction);
                  let fractionS = "";
                  if (fraction > 0)   fractionS = fraction.toFixed(3) + "%";                         
                  prop += addInfo("Progress", fractionS);
                  let remainingS = functions.getFormattedTimeInterval(resultF.remaining);                         
                  prop += addInfo("Timeleft", remainingS);
                  let deadlineT =  functions.getFormattedTime(resultF.deadline);
                  let deadlineS = functions.getFormattedTimeDiff(resultF.deadline)                          
                  prop += addInfo("Deadline", deadlineS + " | " + deadlineT);
                  prop += addInfo("Resources",resultF.resources);
                  prop += addInfo("Status", resultF.statusS)

                  if (con.state.result === null) break;
                  let stateResults = con.state.result;
                  for (let s=0;s<stateResults.length;s++)
                  {
                      let stateResult = stateResults[s];
                      if (wuName == stateResult.name[0])
                      {
                          prop += addInfo("Exit status",stateResult.exit_status[0]);
                          prop += addInfo("Platform", stateResult.platform[0]);
                          let receivedS =  functions.getFormattedTime(stateResult.received_time[0]);
                          prop += addInfo("Recieved", receivedS);
                      }
                  }
                  let stateWorkunits =  con.state.workunit;
                  for (let w=0;w<stateWorkunits.length;w++)
                  {
                      let stateWorkunit =  stateWorkunits[w];
                      if (wu === stateWorkunit.name[0])
                      {
//                           prop += addInfo("Command line", stateWorkunit.command_line[0])
                          let rsc_disk_bound = stateWorkunit.rsc_disk_bound[0] / 1048576;
                          prop += addInfo("Disk", rsc_disk_bound.toFixed(4)  + " MByte");
                          let rsc_fpops_est = stateWorkunit.rsc_fpops_est[0]/1e9;
                          prop += addInfo("Task size", rsc_fpops_est.toFixed(4) + " GFLOPs (rsc_fpops_est)");
                          let rsc_fpops_bound = stateWorkunit.rsc_fpops_bound[0]/1e9;
                          prop += addInfo("App speed", rsc_fpops_bound.toFixed(4) + " GFLOPs/sec (rsc_fpops_bound)");
                          let rsc_memory_bound = stateWorkunit.rsc_memory_bound[0]/1048576;
                          prop += addInfo("Memory", rsc_memory_bound.toFixed(4) + " MByte (rsc_memory_bound)");
                      }
                    }
                  }                    
                }
            }
        }    
      }
      prop += "</table>";
      if (prop.length > 100)
      {
        properties(prop,gb.theme);
      }
      else
      {
        properties("Nothing found".gb.theme);
      }
  } catch (error) {
      logging.logError('Properties,taskInfo', error);    
  }
}

function addInfo(cat, msg)
{
    return "<tr><td>" + cat + ":</td><td>" + msg + "</td></tr>";
}

function addLine()
{
    return "<tr><td><hr></td><td><hr></td></tr>";
}

function properties(msg,theme)
{
    try {
        let title = "BoincTasks Properties";
        if (gChildProperties == null)
        {
          let state = windowsState.get("properties",700,1000)
      
          gChildProperties = new BrowserWindow({
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
          gChildProperties.loadFile('index/index_properties.html')
          gChildProperties.once('ready-to-show', () => {    
  //          gChildProperties.webContents.openDevTools()
            gChildProperties.show();  
            gChildProperties.setTitle(title);
            gChildProperties.send('properties_text',msg); 
          })
          gChildProperties.webContents.on('did-finish-load', () => {
            insertCssDark(theme);
          })            
          gChildProperties.on('close', () => {
            let bounds = gChildProperties.getBounds();
            windowsState.set("properties",bounds.x,bounds.y, bounds.width, bounds.height)
          })     
          gChildProperties.on('closed', () => {
            gChildProperties = null
          })    
        }
        else
        {
          insertCssDark(theme);
          gChildProperties.setTitle(title); 
          gChildProperties.hide();
          gChildProperties.show();
          gChildProperties.send('properties_text',msg);    
        }
              
    } catch (error) {
        logging.logError('Properties,properties', error);        
    }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkProperties !== null)
    {
      gChildProperties.webContents.removeInsertedCSS(gCssDarkProperties) 
    }    
    gCssDarkProperties = await gChildProperties.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkProperties = null;
  }
}