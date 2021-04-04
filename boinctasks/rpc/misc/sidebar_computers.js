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

class SidebarComputers{
  build(window,connections)
  {
    try {
      let bFoundGroup = false;
      let conStatus = getConnectionStatus(connections);
      let group = undefined;
      let list = "";
      let sGroup = "";

      for (let i=0;i< connections.length;i++)
      {
        let con = connections[i];
        if (con.check == '1')
        {
          let selComp = '';
          let selGrp = '';
          if (con.sidebar)
          {
            selComp = 'class="sidebar_computers_sel"';
          }
          else selComp = "";
          if (con.sidebarGrp)
          {
            selGrp = 'class="sidebar_computers_sel"';
          }
          else selGrp = "";
          if (con.group != group)
          {
            group = con.group;         
            if (group === '') sGroup = "Computers";
            else
            {
              sGroup = group;
              bFoundGroup = true;
            }
            list += '<div id ="' + 'group,'  + group + '"' + selGrp + '>';
            list += sGroup + "</div>";
          }
          list += '<div id ="' + con.computerName + '"' + selComp + '>';
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

      if (bFoundGroup) list += '<br><div id ="__all_computers__">Select all</div>' ;

      if (list.length === 0)
      {
        list = "No computers....";
      }
      else
      {
        list += "<br><br><br>"
      }
      this.setStatus(window,connections);
      window.webContents.send('sidebar_computers', list);
    } catch (error) {
      logging.logError('SidebarComputers,build', error);         
    }  
  }

  click(window,connections, computer,ctrl)
  {
    try {
      let group = "";
      if (computer === "__all_computers__")
      {
        connections[0].sidebarGrp = true;
        group = connections[0].group;
        for (let i=0;i<connections.length;i++)
        {
          let con = connections[i];  
          con.sidebarGrp = true;  
          con.sidebar = false;
        }
      }
      else
      {
        if (ctrl)
        {
          for (let i=0;i<connections.length;i++)
          {
            let con = connections[i];           
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
          for (let i=0;i<connections.length;i++)
          {
            let con = connections[i];           
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

      this.build(window,connections)
    } catch (error) {
      logging.logError('SidebarComputers,click', error);         
    }      
  }

  setStatus(window,connections)
  {
    try {
      let conStatus = getConnectionStatus(connections);

      window.webContents.send('sidebar_computers_status', conStatus);     
    } catch (error) {
      logging.logError('SidebarComputers,setStatus', error);   
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