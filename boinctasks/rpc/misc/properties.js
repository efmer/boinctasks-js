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

const btC = require('../functions/btconstants');

const {BrowserWindow} = require('electron')

let gCssDarkProperties = null
let gChildProperties = null;

class Properties{
  task(selected,gb)
  {
    taskInfo(selected,gb)
  }
  computer(selected,gb)
  {
    computerInfo(selected,gb)
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
      let res = selected[i].split(btC.SEPERATOR_SELECT);
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

function computerInfo(selected,gb)
{
  try {
    let temp;
    let connections = gb.connections;
    let prop = "<table>";
    for (let i=0;i<selected.length;i++ )
    {
      let res = selected[i].split(btC.SEPERATOR_SELECT);
      if (res.length !== 2) break;
      let computer = res[1];

      if (i>0) prop += addLine();
      for (let c=0; c<connections.length;c++)
      {
        if (connections[c].computerName === computer)
        {
          let con = connections[c];
          prop += addInfo("Computer",computer);          
          let time = null;
          let comp = null;
          try {
            comp = con.computer;
          } catch (error) {}
          if (comp !== null)
          {
            prop += addInfo("Domain name", comp.domain_name[0]);
            prop += addInfo("CPID", comp.host_cpid[0]);
            prop += addInfo("IP", comp.ip_addr[0]);
            prop += addInfo("OS", comp.os_name[0] + " : " + comp.os_version[0]);
            prop += addLine();
            prop += addInfo("CPU", comp.p_vendor[0]);
            prop += addInfo("CPU Model", comp.p_model[0]);
            prop += addInfo("CPU nr", comp.p_ncpus[0]);
 //           prop += addInfo("CPU Features", comp.p_features[0]);
            let features = comp.p_features[0];
            let fArray = features.split(" ");
            let fPart = "";
            for (let s=0; s<fArray.length;s++)
            {
              fPart += fArray[s] + " ";
              if (fPart.length > 60)
              {
                prop += addInfo("CPU Features", fPart);
                fPart = "";
              }
            }
            if (fPart.length > 2) prop += addInfo("CPU Features", fPart);
            prop += addLine();

            temp = parseFloat(comp.d_total[0]/1048576).toFixed(4);
            prop += addInfo("Memory total", temp + " Mb");
            temp = parseFloat(comp.d_free[0]/1048576).toFixed(4);
            prop += addInfo("Memory free", temp + " Mb");
            temp = parseFloat(comp.m_swap[0]/1048576).toFixed(4);
            prop += addInfo("Memory swap", temp + " Mb");
            temp = parseFloat(comp.m_swap[0]/1048576).toFixed(4);
            try {
              temp = comp.p_vm_extensions_disabled[0];
              if (temp !== void 0) prop += addInfo("Virtual extentions", comp.p_vm_extensions_disabled[0]);              
            } catch (error) {}

            prop += addLine();
            let distroName = "";
            let distroNName = "";
            let distroDefault = "";
            let distroVersion = "";

            let wsl = comp.wsl;
            let wslLen = 0;
            if (wsl !== void 0)
            {
              wslLen = wsl.length;
              prop += addInfo("WSL", "");
            }

            if (wslLen === 0)
            {
              prop += addInfo("WSL", "No distro found");
            }

            for (let w=0; w<wslLen; w++)
            {
              try {
                let distro = wsl[w].distro[0];
                distroName = distro.name[0];              
                distroNName = distro.distro_name[0];
                distroDefault = distro.is_default[0];
                distroVersion = distro.version[0];

              } catch (error) {}
              if (distroName.length > 0)
              {
                prop += addInfo("Name", distroName);
                prop += addInfo("Distro Name", distroNName);
                prop += addInfo("Default", distroDefault);
                prop += addInfo("Version", distroVersion);              
              }
              if (w<wslLen-1) prop += addLine();
            }          
          }
          try {
            time = con.state.time_stats[0];
          } catch (error) {}
          if (time !== null)          
          {
            prop += addLine();
            prop += addInfo("Time","");
            temp = parseFloat(time.active_frac[0]*100);
            prop += addInfo("Fraction active", temp.toFixed(2)  + " %");
            temp = Math.abs(parseFloat(time.connected_frac[0]*100));
            prop += addInfo("Fraction connected", temp.toFixed(2)  + " %");
            temp = parseFloat(time.cpu_and_network_available_frac[0]*100);
            prop += addInfo("CPU and netword available", temp.toFixed(2)  + " %");
            temp = parseFloat(time.gpu_active_frac[0]*100);
            prop += addInfo("GPU active", temp.toFixed(2)  + " %");
            temp = parseFloat(time.on_frac[0]*100);   
            prop += addInfo("Fraction on", temp.toFixed(2)  + " %");
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
    }
  } catch (error) {
    logging.logError('Properties,computerInfo', error);    
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