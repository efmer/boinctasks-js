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
const btC = require('../functions/btconstants');


const SIDEBAR_COMPUTER_ID = "__c__";
const SIDEBAR_PROJECT_ID = "__p__";
const SIDEBAR_SELECT = 'class="sidebar_computers_sel"';

let gSidebarProjectList = "";
let gSidebarComputers = "";
let gConStatus = "";

class SidebarComputers{
  build(gb)
  {
    try {
      let bFoundGroup = false;
      let conStatus = getConnectionStatus(gb.connections);
      let group = undefined;
      let list = "";
      let sGroup = "";

      for (let i=0;i< gb.connections.length;i++)
      {
        let con = gb.connections[i];
        if (con.check == '1')
        {
          let selComp = '';
          let selGrp = '';
          if (con.sidebar)
          {
            selComp = SIDEBAR_SELECT;
          }
          else selComp = "";
          if (con.sidebarGrp)
          {
            selGrp = SIDEBAR_SELECT;
          }
          else selGrp = "";
          if (con.group != group)
          {
            group = con.group;         
            if (group === '') sGroup = btC.TL.SIDEBAR_COMPUTERS.SBC_COMPUTERS;
            else
            {
              sGroup = group;
              bFoundGroup = true;
            }
            list += '<div id ="' + SIDEBAR_COMPUTER_ID + 'group,'  + group + '"' + selGrp + '>';
            list += sGroup + "</div>";
          }
          list += '<div id ="' + SIDEBAR_COMPUTER_ID + con.computerName + '"' + selComp + '>';
          let status = conStatus[i];
          if (status !== null)
          {
            status = conStatus[i][1];
          }
          else status = "?";
          list += '<span id="status_'+ i + '">' + status + '</span>';
          list += con.computerName + "</div>";
        }
      }

      if (bFoundGroup) list = '<div id ="' + SIDEBAR_COMPUTER_ID + '__all_computers__">Select all</div>' + list  ;

      if (list.length === 0)
      {
        list = btC.TL.SIDEBAR_COMPUTERS.SBC_NO_COMPUTERS;
      }
      else
      {
        list += "<br>";
      }

      gSidebarProjectList = getProjects(gb);      
      list += '<div id="_add_projects_">' + gSidebarProjectList + '</div>';

      this.setStatus(gb);

      if (gSidebarComputers != list)
      {
        gb.mainWindow.webContents.send('sidebar_computers', list);
        gSidebarComputers = list;
      }
    } catch (error) {
      logging.logError('SidebarComputers,build', error);         
    }  
  }

  click(gb, computer,ctrl)
  {
    try {
      if (computer === "_sidebar_computers_") return;
      if (computer === "_add_projects_") return;

      if (computer.indexOf(SIDEBAR_COMPUTER_ID) >=0)
      {
        computer = computer.replace(SIDEBAR_COMPUTER_ID,"");
        let group = "";
        if (computer === "__all_computers__")
        {
          gb.connections[0].sidebarGrp = true;
          group = connections[0].group;
          for (let i=0;i<gb.connections.length;i++)
          {
            let con = gb.connections[i];  
            con.sidebarGrp = true;  
            con.sidebar = false;
          }
        }
        else
        {
          if (ctrl)
          {
            for (let i=0;i<gb.connections.length;i++)
            {
              let con = gb.connections[i];           
              if (con.computerName === computer)
              {
                con.sidebar = !con.sidebar;
              }
              else
              {
                let grp = computer.split("group,");
                if (grp.length === 2)
                {
                  if (con.group === grp[1])
                  {
                    con.sidebarGrp = !con.sidebarGrp;  
                  }
                }
              }
            }     
          }
          else
          {
            for (let i=0;i<gb.connections.length;i++)
            {
              let con = gb.connections[i];           
              con.sidebarGrp = false;  
              con.sidebarGrp = false;   
              if (con.computerName == computer)
              {
                con.sidebar = true;
              }
              else
              {
                con.sidebar = false;
                let grp = computer.split("group,");
                if (grp.length === 2)
                {
                  if (con.group === grp[1])
                  {
                    con.sidebarGrp = true;  
                  }
                }
              }
            }     
          }
        }
        this.build(gb)
      }
      else 
      {
        if (computer.indexOf(SIDEBAR_PROJECT_ID) >=0)
        {
          gb.projectSelected = computer.replace(SIDEBAR_PROJECT_ID,"");
          this.build(gb)
        }
      }
    } catch (error) {
      logging.logError('SidebarComputers,click', error);         
    }      
  }

  setStatus(gb)
  {
    try {
      let conStatus = getConnectionStatus(gb.connections);
      let conStatusJ = JSON.stringify(conStatus);
      if (conStatusJ != gConStatus)
      {
        gb.mainWindow.webContents.send('sidebar_computers_status', conStatus);
        gConStatus = conStatusJ;
      }
    } catch (error) {
      logging.logError('SidebarComputers,setStatus', error);   
    }
  }

//  getSelectedProject()
//  {
//    return gb.projectSelected;
//  }

  addProjects(gb)
  {
    try {
      let projects = getProjects(gb);
      if ( projects !== gSidebarProjectList)
      {
        gSidebarProjectList = projects;
        gb.mainWindow.webContents.send('sidebar_projects', projects);        
      }
    } catch (error) {
      logging.logError('SidebarComputers,addProjects', error);   
    }  
  }
}

module.exports = SidebarComputers;

function getConnectionStatus(connections)
{
  try {
    let conStatus = []; 

    for (let i=0;i< connections.length;i++)
    {
      let status = "?";
      let con = connections[i];
      if (con.check == '1')
      {
        if (con.auth)
        {
          status = "┗"
        }
        else
        {
          if (con.lostConnection)
          {
            status = "⚡";
          }
          else
          {
            status =  "⛔";
          }
        }
        let item = [];
        let id = '#status_' + i;
        item.push(id)
        item.push(status);  
        conStatus.push(item);
      }
      else
      {
        conStatus.push(null);
      }

    }
    return conStatus;
  } catch (error) {
    logging.logError('SidebarComputers,getConnectionStatus', error);   
  }
}

function getProjects(gb)
{
  let all = btC.TL.SIDEBAR_COMPUTERS.SBC_PROJECTS;
  if (gb.projectSelected === void 0) gb.projectSelected = all;
  let selComp = '';
  if (gb.projectSelected === all) selComp = SIDEBAR_SELECT;
  let list = '<div id ="' + SIDEBAR_PROJECT_ID + all + '"' +  selComp + '>' + all +  "</div>";
  let projects = [];
  try {
    for (let i=0;i<gb.connections.length;i++)
    {
      let con = gb.connections[i];
      if (con.check == '1')
      {
        if (con.auth)
        {
          if (con.state != null)
          {
            let cache = con.cacheProjectProject;
            for (let c=0;c<cache.length;c++)
            {
              let project = cache[c];
              if (projects.indexOf(project) < 0)
              {
                projects.push(project);
              }
            }
          }
        }
      }
    }

    projects.sort(compare);

    for (let i=0;i<projects.length;i++)
    {
      let selProject;
      let project = projects[i];
      if (project === gb.projectSelected) selProject = SIDEBAR_SELECT;
      else selProject = "";
      if (project.length >= 10)
      {
        project = project.slice(0, 14)
      }
      list += '<div id ="' + SIDEBAR_PROJECT_ID + projects[i] + '"' +  selProject + '>┗' + project +  "</div>";
    }
  } catch (error) {
    logging.logError('SidebarComputers,getProjects', error);  
  }

  return list;
}

function compare(a,b)
{
  if (a.toLowerCase() > b.toLowerCase()) return 1;
  if (a.toLowerCase() < b.toLowerCase()) return -1;
  return 0;
}