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

//var g_timer = null;
var g_busyCnt = 0;

const HEADER_NORMAL = 0;
const HEADER_RESIZE = 1;

var g_mainReady = false;

let gHeaderWidth = null;

const { ipcRenderer } = require('electron')
const shell = require('electron').shell

ipcRenderer.on('finish_load', (event, data) => {
  g_mainReady = true;
});

$(document).ready(function() {

  const { ipcRenderer } = require('electron')

  ipcRenderer.on('table_data_header', (event, tableData, name, action) => {
    $("#bt_table_header_insert").html(tableData);

    switch (action)
    {
      case HEADER_RESIZE:
//        setTimeout(normalizeHeader, 300)
        addHeaderResizeHandler(name);
      break;
    }

//    addHeaderResizeHandler(name);

    $('body').removeClass('app-no-scrollbar')
// 
  });

  ipcRenderer.on('header_resize_width', (event, ex, name, tab) => {
    startResize(ex,name, tab);
  });

  ipcRenderer.on('table_data', (event, tableData, nr) => {
// might be faster, but not by much...
//    let el = document.getElementById('bt_table_insert');
//    el.innerHTML = tableData;
    $("#bt_table_insert").html(tableData);
    $("#footer_number").html(nr);

    $("td").mouseenter(function (e) {
      try {

        if (e.target.offsetWidth < e.target.scrollWidth)    
        {
          let txt = e.target.innerText;
          e.target.title = txt;
        }       
      } catch (error) {        
      }
  });


  });

  ipcRenderer.on('notices', (event, msg) => {
    $("#bt_table_insert").html(msg);

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
    $("#tab_computers").html(sel.SEL_COMPUTERS);
    $("#tab_projects").html(sel.SEL_PROJECTS);
    $("#tab_task").html(sel.SEL_TASKS);
    $("#tab_transfers").html(sel.SEL_TRANSFERS);
    $("#tab_messages").html(sel.SEL_MESSAGES);
    $("#tab_history").html(sel.SEL_HISTORY);
    $("#tab_notices").html(sel.SEL_NOTICES);
  });

  ipcRenderer.on('set_tab', (event, tab) => {
    changeTab(tab,false);
  });

  ipcRenderer.on('set_status', (event, status) => {
    $("#footer_status").html(status);
  });

  ipcRenderer.on('set_dark_mode', (event, mode) => {
    $("#footer_dark_mode").html(mode);

    $("#dark_mode_select").click(function( event ) {
      ipcRenderer.send('dark_mode_select');
    });
  });

  ipcRenderer.on('toolbar', (event, toolbar) => {
    $("#bt_toolbar_insert").html(toolbar);
  });

  ipcRenderer.on('sidebar_computers', (event, sidebar) => {
    $("#_sidebar_computers_").html(sidebar);
  });

  ipcRenderer.on('sidebar_computers_status', (event, conStatus) => {
    setConnectionStatus(conStatus);
  }); 

  ipcRenderer.on('sidebar_computers_active', (event, set) => {
    if (set)
    {
      $("#bt_wrapper").addClass("sidebar_computers_margin");
      $("#bt_toolbar").addClass("sidebar_computer_footer");
      $("#_sidebar_computers_").removeClass("hidden");         
    }
    else
    {
      $("#bt_wrapper").removeClass("sidebar_computers_margin");
      $("#bt_toolbar").removeClass("sidebar_computer_footer");
      $("#_sidebar_computers_").addClass("hidden");          
    }
  });

  ipcRenderer.on('sidebar_projects', (event, sidebar) => {
    $("#_add_projects_").html(sidebar);
  }); 

  ipcRenderer.on('get_computers', (event, connections) => {
    let con = getComputers(connections);
    ipcRenderer.send('got_computers', con);
  });
  
// document.getElementById("bt_table_header").onclick = function(e)
  document.getElementById("bt_table_header").addEventListener('mousedown', e => {
  
   var id = e.target.id;
   var shift = e.shiftKey;
   var alt = e.altKey;
   var ctrl = e.ctrlKey;   
   ipcRenderer.send('table_click_header', id, e.clientX, shift,alt,ctrl) 
  });

  $( "#bt_table" ).on( "click", function(e) {
    var id = e.target.id;
    var shift = e.shiftKey;
    var alt = e.altKey;
    var ctrl = e.ctrlKey;     
    ipcRenderer.send('table_click', id,shift,alt,ctrl) 
  });
 
  document.getElementById("bt_toolbar").onclick = function(event)
  {
    var id = event.target.id;
    ipcRenderer.send('toolbar_click', id) 
  }

  document.getElementById("_sidebar_computers_").onclick = function(e)
  {
    var ctrl = e.ctrlKey;     
    var id = e.target.id;
    ipcRenderer.send('sidebar_click', id,ctrl) 
  }
  

  // tabs

  $("#tab_computers").click(function( event ) {
    changeTab("computers",true);
  });
  $("#tab_projects").click(function( event ) {
    changeTab("projects",true);
  });
  $("#tab_task").click(function( event ) {
    changeTab("tasks",true);    
  });
  $("#tab_transfers").click(function( event ) {
    changeTab("transfers",true);
  });
  $("#tab_messages").click(function( event ) {
    changeTab("messages",true);
  });
  $("#tab_history").click(function( event ) {
    changeTab("history",true);
  });
  $("#tab_notices").click(function( event ) {
    changeTab("notices",true);
  });

  ipcRenderer.send('tab_request', 0)  // initial tab

});

function changeTab(name,send)
{
  switch (name)
  {
    case "computers":
      removeSelected();
      setTab('computers',send);
      $("#tab_computers").addClass("bt_btn_tabs_select");     
    break;
    case "projects":
      removeSelected();
      setTab('projects',send);
      $("#tab_projects").addClass("bt_btn_tabs_select");
    break;
    case "transfers":
      removeSelected();
      setTab('transfers',send)
      $("#tab_transfers").addClass("bt_btn_tabs_select");
    break;
    case "messages":
      removeSelected();
      setTab('messages',send);
      $("#tab_messages").addClass("bt_btn_tabs_select");    
    break;
    case "history":
      removeSelected();
      setTab('history',send);
      $("#tab_history").addClass("bt_btn_tabs_select");    
    break;
    case "notices":
      removeSelected();
      setTab('notices',send);
      $("#tab_notices").addClass("bt_btn_tabs_select");    
    break;
    default:
      removeSelected();
      setTab('tasks',send);
      $("#tab_task").addClass("bt_btn_tabs_select");
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
  $( "#tab_computers").removeClass("bt_btn_tabs_select");
  $( "#tab_projects").removeClass("bt_btn_tabs_select");
  $( "#tab_task").removeClass("bt_btn_tabs_select");
  $( "#tab_transfers").removeClass("bt_btn_tabs_select");
  $( "#tab_messages").removeClass("bt_btn_tabs_select");
  $( "#tab_history").removeClass("bt_btn_tabs_select");    
  $( "#tab_notices").removeClass("bt_btn_tabs_select");   
}

function getComputers(connections)
{
  for (let i=0; i<connections.length;i++)
  {
    let idName = i;
    let val,id;
    try {
      id = "#check-"+ idName;
      val = $(id).is(":checked");
      if (val) val = 1;
      else val = 0;
      connections[i].check = val;      
    } catch (error) {
      connections[i].check = false;
    }

    try {
      id = "#group-"+ idName;
      val = $(id).val();
      connections[i].group = val;      
    } catch (error) {
      connections[i].group = "";
    }

    try {
      id = "#computer-"+ idName;
      val = $(id).val();
      connections[i].computerName = val; 
    } catch (error) {
      connections[i].computerName = "Error";  
    }

    try {
      id = "#ip-"+ idName;
      val = $(id).val();
      connections[i].ip = val; 
    } catch (error) {
      connections[i].ip = "";       
    }

    try {
      id = "#cpid-"+ idName;
      val = $(id).val();
      connections[i].cpid = val;      
    } catch (error) {
      connections[i].cpid = "";
    }

    try {
      id = "#port-"+ idName;
      val = $(id).val();
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
      id = "#pass-"+ idName;
      val = $(id).val();
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
        $(id).html(status);
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
        let nr = $(col).attr("id");
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
    let nr = $(col).attr("id");
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