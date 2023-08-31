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

'use strict';

const HEADER_NORMAL = 0;
const HEADER_RESIZE = 1;

let gSwapTable = false;
let gHeaderWidth = null;

const { ipcRenderer } = require('electron')
const shell = require('electron').shell

ipcRenderer.on('finish_load', (event, data) => {

});

document.addEventListener("DOMContentLoaded", () => {

  const { ipcRenderer } = require('electron')

  ipcRenderer.on('table_data_header', (event, tableData, name, action) => {
    SetHtml('bt_table_header_insert',tableData)
    switch (action)
    {
      case HEADER_RESIZE:
//        setTimeout(normalizeHeader, 300)
        addHeaderResizeHandler(name);
      break;
    }

//    addHeaderResizeHandler(name);

//    document.getElementById('body').classList.remove("app-no-scrollbar");  $$$$$
// 
  });

  ipcRenderer.on('header_resize_width', (event, ex, name, tab) => {
    startResize(ex,name, tab);
  });

  ipcRenderer.on('table_data', (event, tableData, nr) => {
    SwapTable(tableData);
//    SetHtml('bt_table_insert',tableData)
    if(nr != undefined)
    {
      SetHtml('footer_number',nr)
    }
});

  ipcRenderer.on('notices', (event, msg) => {
    SwapTable(msg);
//    SetHtml('bt_table_insert',msg)

    // in case there are any links, like in notices
    const links = document.querySelectorAll('a[href]')
    Array.prototype.forEach.call(links, function (link) {
       const url = link.getAttribute('href')
       if (url.indexOf('http') === 0) {
          link.addEventListener('click', function (e) {
              e.preventDefault()
              shell.openExternal(url)
          })
       }
    })
  });

  ipcRenderer.on('translations', (event, sel) => {

    SetHtml('tab_computers',sel.SEL_COMPUTERS);
    SetHtml('tab_projects',sel.SEL_PROJECTS);
    SetHtml('tab_task',sel.SEL_TASKS);
    SetHtml('tab_transfers',sel.SEL_TRANSFERS);
    SetHtml('tab_messages',sel.SEL_MESSAGES);
    SetHtml('tab_history',sel.SEL_HISTORY);
    SetHtml('tab_notices',sel.SEL_NOTICES);
    let table = document.getElementById("bt_table");
//    let table1 = document.getElementById("bt_table_insert1"); 
    table.addEventListener("click", clickTable);
//    table1.addEventListener("click", clickTable);
  });

  ipcRenderer.on('set_tab', (event, tab) => {
    changeTab(tab,false);
  });

  ipcRenderer.on('set_status', (event, status) => {
    SetHtml('footer_status',status);
  });

  ipcRenderer.on('set_dark_mode', (event, mode) => {
    SetHtml('footer_dark_mode',mode);
    document.getElementById('dark_mode_select').addEventListener("click", function(event){
      ipcRenderer.send('dark_mode_select');
    });    
  });

  ipcRenderer.on('toolbar', (event, toolbar) => {
    SetHtml('bt_toolbar_insert',toolbar);
  });

  ipcRenderer.on('sidebar_computers', (event, sidebar) => {
    SetHtml('_sidebar_computers_',sidebar);
  });

  ipcRenderer.on('sidebar_computers_status', (event, conStatus) => {
    setConnectionStatus(conStatus);
  }); 

  ipcRenderer.on('sidebar_computers_active', (event, set) => {
    if (set)
    {
      document.getElementById('bt_wrapper').classList.add("sidebar_computers_margin");
      document.getElementById('bt_toolbar').classList.add("sidebar_computer_footer");      
      document.getElementById('_sidebar_computers_').classList.remove("hidden");       
    }
    else
    {
      document.getElementById('bt_wrapper').classList.remove("sidebar_computers_margin"); 
      document.getElementById('bt_toolbar').classList.remove("sidebar_computer_footer");             
      document.getElementById('_sidebar_computers_').classList.add("hidden");              
    }
  });

  ipcRenderer.on('sidebar_projects', (event, sidebar) => {
    SetHtml('_add_projects_',sidebar);
  }); 

  ipcRenderer.on('get_computers', (event, connections) => {
    let con = getComputers(connections);
    ipcRenderer.send('got_computers', con);
  });
  
  document.getElementById("bt_table_header").addEventListener('mousedown', e => {  
   var id = e.target.id;
   var shift = e.shiftKey;
   var alt = e.altKey;
   var ctrl = e.ctrlKey;   
   ipcRenderer.send('table_click_header', id, e.clientX, shift,alt,ctrl); 
  });
 
  document.getElementById('bt_toolbar').addEventListener("click", function(event){ 
    var id = event.target.id;
    ipcRenderer.send('toolbar_click', id);
  });

  document.getElementById("_sidebar_computers_").onclick = function(e) {
    var ctrl = e.ctrlKey;     
    var id = e.target.id;
    ipcRenderer.send('sidebar_click', id,ctrl) 
  }
  

  // tabs

  document.getElementById('tab_computers').addEventListener("click", function(event){
    changeTab("computers",true);
  });

  document.getElementById('tab_projects').addEventListener("click", function(event){   
    changeTab("projects",true);
  });

  document.getElementById('tab_task').addEventListener("click", function(event){     
    changeTab("tasks",true);    
  });

  document.getElementById('tab_transfers').addEventListener("click", function(event){    
    changeTab("transfers",true);
  });

  document.getElementById('tab_messages').addEventListener("click", function(event){     
    changeTab("messages",true);
  });

  document.getElementById('tab_history').addEventListener("click", function(event){    
    changeTab("history",true);
  });

  document.getElementById('tab_notices').addEventListener("click", function(event){     
    changeTab("notices",true);
  });

  ipcRenderer.send('tab_request', 0)  // initial tab

});

// Swap the tables, makes sure the listeners are always there.
// not sure if this helps at all.

function SwapTable(tableData)
{
  let table0 = document.getElementById("bt_table_insert0");
  let table1 = document.getElementById("bt_table_insert1");  
  if (gSwapTable)
  {  
    table1.innerHTML = tableData;
    table1.style.display = "block";    
    table0.style.display = "none";
    gSwapTable = false;
  }
  else
  {    
    table0.innerHTML = tableData;
    table0.style.display = "block";     
    table1.style.display = "none"; 
    gSwapTable = true;
  }
  tableData = null;
}

function clickTable(event)
{  
  var id = event.target.id;
  let bMissed = false;
  if (id == 'bt_table')
  {
    bMissed = true;
  }
  if (id.length<2)
  {
    bMissed = true;
  }
  if (bMissed)
  {
    // Clicked while the tables were swapping.
    setTimeout(clickTable2(event), 200);    
  }
  var shift = event.shiftKey;
  var alt = event.altKey;
  var ctrl = event.ctrlKey;     
  ipcRenderer.send('table_click', id,shift,alt,ctrl); 
}

function clickTable2(event)
{
  let x = event.clientX;
  let y = event.clientY;
  // try again at the same click location
  let el = document.elementFromPoint(x, y);
  let id = null;
  // from point gives an element.
  if (el.localName == 'td')
  {
    id = el.id;
  }
  else
  {
    if (el.localName == 'span')
    {
      id = el.id;
    }
    else
    {
      id = el;
    }
  }
  var shift = event.shiftKey;
  var alt = event.altKey;
  var ctrl = event.ctrlKey;     
  ipcRenderer.send('table_click', id,shift,alt,ctrl); 
}


function changeTab(name,send)
{
  switch (name)
  {
    case "computers":
      removeSelected();
      setTab('computers',send);
      document.getElementById('tab_computers').classList.add("bt_btn_tabs_select");
    break;
    case "projects":
      removeSelected();
      setTab('projects',send);
      document.getElementById('tab_projects').classList.add("bt_btn_tabs_select");
    break;
    case "transfers":
      removeSelected();
      setTab('transfers',send)
      document.getElementById('tab_transfers').classList.add("bt_btn_tabs_select");
    break;
    case "messages":
      removeSelected();
      setTab('messages',send);
      document.getElementById('tab_messages').classList.add("bt_btn_tabs_select");        
    break;
    case "history":
      removeSelected();
      setTab('history',send);
      document.getElementById('tab_history').classList.add("bt_btn_tabs_select");          
    break;
    case "notices":
      removeSelected();
      setTab('notices',send);
      document.getElementById('tab_notices').classList.add("bt_btn_tabs_select");  
    break;
    default:
      removeSelected();
      setTab('tasks',send);
      document.getElementById('tab_task').classList.add("bt_btn_tabs_select");      
  }
}

function setTab(selected,send)
{
  if (send)
  {
    ipcRenderer.send('tab_click', selected) 
  }
}

function removeSelected()
{ 
  document.getElementById('tab_computers').classList.remove("bt_btn_tabs_select");  
  document.getElementById('tab_projects').classList.remove("bt_btn_tabs_select");  
  document.getElementById('tab_task').classList.remove("bt_btn_tabs_select");  
  document.getElementById('tab_transfers').classList.remove("bt_btn_tabs_select");  
  document.getElementById('tab_messages').classList.remove("bt_btn_tabs_select");  
  document.getElementById('tab_history').classList.remove("bt_btn_tabs_select");  
  document.getElementById('tab_notices').classList.remove("bt_btn_tabs_select");  
}

function getComputers(connections)
{
  for (let i=0; i<connections.length;i++)
  {
    let idName = i;
    let val,id;
    try {
      id = "check-"+ idName;
      val = document.getElementById(id).checked;
      if (val) val = 1;
      else val = 0;
      connections[i].check = val;      
    } catch (error) {
      connections[i].check = false;
    }

    try {
      id = "group-"+ idName;
      val = document.getElementById(id).value;
      connections[i].group = val;      
    } catch (error) {
      connections[i].group = "";
    }

    try {
      id = "computer-"+ idName;
      val = document.getElementById(id).value;
      connections[i].computerName = val; 
    } catch (error) {
      connections[i].computerName = "Error";  
    }

    try {
      id = "ip-"+ idName;
      val = document.getElementById(id).value;
      connections[i].ip = val; 
    } catch (error) {
      connections[i].ip = "";       
    }

    try {
      id = "cpid-"+ idName;
      val = document.getElementById(id).value;
      connections[i].cpid = val;      
    } catch (error) {
      connections[i].cpid = "";
    }

    try {
      id = "port-"+ idName;
      val = document.getElementById(id).value;
      if (val === "") val = "31416";
      let ports = val.split(";");
      if (ports.length > 1)
      {
        connections[i].port = parseInt(ports[0]);
        let temp = new Object;
        temp.port =  parseInt(ports[1]);
        connections[i].temp = temp;
      }
      else connections[i].port = parseInt(val);        
    } catch (error) {
      connections[i].port = 31416;
    }
    if (isNaN(connections[i].port))
    {
      connections[i].port = 31416;
    }

    try {
      id = "pass-"+ idName;
      val = document.getElementById(id).value;
      connections[i].passWord = val;  
    } catch (error) {
      connections[i].passWord = "";
    }
  }
  return connections;
}

function setConnectionStatus(conStatus)
{
  try {
    for (let i=0;i< conStatus.length;i++)
    {
      let item = conStatus[i];
      if (item !== null)
      {
        let id = item[0];
        let status = item[1];
        SetHtml(id,status);
      }
    }
  } catch (error) { 
    var ii = 1;
  }
}

// BEGIN Resize the header

function startResize(ex,name, tab)
{
  // Track the current position of mouse
  let x = ex;
  let w = 0;

  let id = document.getElementById(name); 

  // Calculate the current width of column
  const styles = window.getComputedStyle(id);
  w = parseInt(styles.width, 10);

  const rsMouseMoveHandler = function(e) {
    // Determine how far the mouse has been moved
    const dx = e.clientX - x;

    // Update the width of column
    id.style.width = `${w + dx}px`;
  };

  // When user releases the mouse, remove the existing event listeners
  const rsMouseUpHandler = function() {
    document.removeEventListener('mousemove', rsMouseMoveHandler);
    document.removeEventListener('mouseup', rsMouseUpHandler);

    sendHeaderWidth(tab);
  }; 

  // Attach listeners for document's events
  document.addEventListener('mousemove', rsMouseMoveHandler);
  document.addEventListener('mouseup', rsMouseUpHandler);

}


function addHeaderResizeHandler(name)
{
  try {
    const table = document.getElementById('table_header');
    const cols = table.querySelectorAll('th');

    [].forEach.call(cols, function(col) {
        let nr = document.getElementById(col).getAttribute("id");
        let id = document.getElementById(nr, name);
//        let img = id.lastChild;
        createResizableColumn(id, name);
        nr++;
    });  
  } catch (error) {
    var ii = 1;
  }
}

const createResizableColumn = function(id, nameIn) {
  // Track the current position of mouse
  let x = 0;
  let w = 0;
  let name = nameIn;

  const mouseDownHandler = function(e) {
      // Get the current mouse position
      x = e.clientX;

      // Calculate the current width of column
      const styles = window.getComputedStyle(id);
      w = parseInt(styles.width, 10);

      // Attach listeners for document's events
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function(e) {
      // Determine how far the mouse has been moved
      const dx = e.clientX - x;

      // Update the width of column
      id.style.width = `${w + dx}px`;
  };

  // When user releases the mouse, remove the existing event listeners
  const mouseUpHandler = function() {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);

      sendHeaderWidth(name);
  };

  id.addEventListener('mousedown', mouseDownHandler);
};

function sendHeaderWidth(name)
{
  let old = gHeaderWidth;
  const table = document.getElementById('table_header');
  const cols = table.querySelectorAll('th');

  let totalWidth = 0;
  let widthArray = [];
  let idArray = [];
  [].forEach.call(cols, function(col) {    
    let nr = col.getAttribute('id');
    idArray.push(nr);
    let id = document.getElementById(nr);  
    let styles = window.getComputedStyle(id);
    let width =  parseFloat(styles.width);
    totalWidth += width;
    widthArray.push(width);
    nr++;        
  });
  
  let totc = 0;
  for(let i=0;i<widthArray.length;i++)
  {
    totc += widthArray[i];
  }

  /*
  let perc = 0;
  let widthArrayP = [];
  for (let i=0; i<cols.length;i++)
  {
      let widthPerc = (widthArray[i]/totalWidth) * 100;
      widthPerc = parseFloat(widthPerc.toFixed(3));
      widthArrayP[i] = widthPerc;
      perc += widthPerc;
  }
*/
  ipcRenderer.send('header_width', name, idArray, widthArray, totalWidth);
}

// END Resize the header

function SetHtml(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.innerHTML = data; 
    data = null;
  } catch (error) {
    let i = 1;
  }
}
