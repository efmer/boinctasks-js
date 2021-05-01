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

// Modules to control application life and create native browser window
const {ipcMain, app, BrowserWindow, Menu, Tray } = require('electron')

const Logging = require('./boinctasks/rpc/functions/logging');
const logging = new Logging();

const Connections = require('./boinctasks/rpc/connections');
const connections = new Connections();

const BtMenu = require('./boinctasks/rpc/functions/bt_menu');
const btMenu = new BtMenu();
var g_menuSettings = null;

const WindowsState = require('./boinctasks/rpc/functions/window_state');
const windowsState = new WindowsState();

const Credits = require('./boinctasks/rpc/misc/credits');
const credits = new Credits();

const ScanComputers = require('./boinctasks/rpc/computers/scan');
const scanComputers = new ScanComputers();  

const btConstants = require('./boinctasks/rpc/functions/btconstants');

const path = require('path')

const gotTheLock = app.requestSingleInstanceLock()

let gVersion = getVersion();

let gMainWindow = null;
let gMainWindowCssKey = null;
let g_mainMenu = null;
let gChildWindowLog = null;
let gChildAddProject = null;
let gLogging = new Object();
gLogging.type = 0;
gLogging.len = 0;

let gSettings = null;

let gTimerLog = null;

let gTray = null;
let gMenuTemplate;

const isMac = process.platform === 'darwin'

function initMenu()
{
  var sidebar = true;
  try {
    g_menuSettings = btMenu.read();
    sidebar =  g_menuSettings[btConstants.MENU_SIDEBAR_COMPUTERS];
  } catch (error) {
    btMenu.set(btConstants.MENU_SIDEBAR_COMPUTERS, true);  // initially enabled
  }

//https://www.electronjs.org/docs/api/menu

  gMenuTemplate = [ 
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label:'About BoincTasks Js',
          click(e) { 
            credits.about(gVersion);
          }
        }, 
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        {
          label:'Close',
          click(e) { 
            appExit();
          }
        },
        { type: 'separator' },        
        {
          label:'Restart',
          click(e) { 
            app.relaunch()
            app.exit()
          }
        },
      ]
    }] : []),
    // { role: 'fileMenu' }    
      ...(isMac ? [ ] : [
        {
        label: 'File',
            submenu: [            
            {
              label:'Exit',
              click(e) { 
                appExit();
              }
            },
            { type: 'separator' },
            {
              label:'Restart',
              click(e) { 
                app.relaunch()
                app.exit()
              }
            },          
        ]
        }
      ]),
    {
      label: 'View',
        submenu: [
          {
            label:'Sidebar Computers',
            type: "checkbox",
            checked: sidebar,
            click(e) { 
              sidebarComputers(e.checked) 
            }
          },
          {
            label:'Adjust column width',
            type: "checkbox",
            checked: false,
            click(e) { 
              setHeaderWidth(e.checked) 
            }
          },  
          {
            label:'Change column order, or hide column',
            click(e) { 
              setColumnOrder() 
            }
          },                   
      ] 
    },

    {
      label: 'Computers',
        submenu: [
        {
          label:'Find',
          click(e) { 
            startScanComputers();
          }
        },            
        {
          label:'Edit',
          click(e) { 
            connections.computerEdit();
          }
        },      
        {
          label:'Add',
          click(e) { 
            connections.computerAdd();
          }
        },                         
      ] 
    },    
    {
      label: 'Projects',
        submenu: [
        {
          label:'Add a new project',
          id: 'project_add',
          enabled: true,
          click(e) { 
            addProject();
          }
        },      
      ] 
    },    
    {
      label: 'Show',
        submenu: [
          {
            label:'Statistics graph',
            click(e) { 
              connections.boincStatistics("menu");
            }
          },
          { type: 'separator' },
          {
            label:'Log',
            click() { 
              showLog(btConstants.LOGGING_NORMAL) 
            }
          },
          {
            label:'Debug Log',
            click() { 
              showLog(btConstants.LOGGING_DEBUG);
            }               
          },
          {
            label:'Rules Log',
            click() {
              showLog(btConstants.LOGGING_RULES);
            }
          },        
          {
            label:'Error Log',
            click() { 
              showLog(btConstants.LOGGING_ERROR);
            }
          },
          {
            label: 'Debug',
              submenu: [
                {
                  label:'Debug mode',
                  type: "checkbox",
                  checked: btConstants.DEBUG,          
                  click() {
                    btConstants.DEBUG = !btConstants.DEBUG;
                  }
                }           
            ] 
          },
      ] 
    },
    {
      label: 'Extra',
        submenu: [
          {
            label:'BoincTasks settings',
            click(e) { 
              connections.settingsStart("menu",gMainWindow);
            }
          },           
          {
            label:'BoincTasks color settings',
            click(e) { 
              connections.color("menu",gMainWindow);
            }
          }, 
          { type: 'separator' },
          {
            label:'Boinc settings',
            click(e) { 
              connections.boincSettings("menu");
            }
          },            
          {
            label:'Boinc allow',
            click(e) { 
              connections.boincAllow("menu");
            }
          },  
          {
            label:'Boinc run benchmark',
            click(e) { 
              connections.boincBenchmark("menu");
            }
          },
          {
            label:'Boinc read config files',
            click(e) { 
              connections.boincReadConfig("menu");
            }
          },                                          
      ] 
    },
    {
      label: 'Rules',
        submenu: [
          {
            label:'Edit',
            click(e) { 
              connections.rules("menu");
            }
          },
          {
            label:'Rules Log',
            click() { 
              showLog(btConstants.LOGGING_RULES);
            }
          },
          { type: 'separator' },
          {
            label:'Email',
            click(e) { 
              connections.email("menu");
            }
          },
      ] 
    },       
    {
      label: 'Help',
        submenu: [
          {
            label:'About BoincTasks Js',
            click(e) { 
              credits.about(gVersion);
            }
          },      
          {
            label:'Check for updates',
            click(e) { 
              const Update = require('./boinctasks/rpc/misc/update');
              const update = new Update();
              update.update("menu",gVersion);
            }
          },                   
      ] 
    },       
  ]
}

function initialize () {

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // A a second instance started
      if (gMainWindow !== null)
      {
        if (gMainWindow.isMinimized())
        {
          MainWindow.restore(); 
        }
        else
        {
          gMainWindow.show();
        }
      }
    })
  }
  
  function createWindow () {
    // Create the browser window.

    let bShow = app.commandLine.getSwitchValue("show") != "no";

    if (gSettings.hideLogin === '1') 
    {
      bShow = false;
    }

    let state = windowsState.get("main",1200,600)

    gMainWindow = new BrowserWindow({
      'x' : state.x,
      'y' : state.y,
      'width': state.width,
      'height': state.height,
      icon: path.join(app.getAppPath(), 'assets/app-icon/png/512.png'),
      show: bShow, 
      webPreferences: {
        sandbox : false,
        contextIsolation: false,  
        nodeIntegration: true,
        nodeIntegrationInWorker: true,        
        preload: path.join(__dirname, './preload/preload.js')
      },
    });

    initMenu();

//    if (process.platform == 'darwin') {
//      gMenuTemplate.unshift({label: ''});
//    }
 
    const g_mainMenu = Menu.buildFromTemplate(gMenuTemplate);

    if (process.platform == 'darwin') {
      Menu.setApplicationMenu(g_mainMenu); 
    }
    else
    {
      Menu.setApplicationMenu(null);
      gMainWindow.setMenu(g_mainMenu);
    }

    // and load the index.html of the app.
    gMainWindow.loadFile('index/index.html')

    gMainWindow.on('close', (e) => {
      let bounds = gMainWindow.getBounds();
      windowsState.set("main",bounds.x,bounds.y, bounds.width, bounds.height)

      if (!app.isQuiting)
      {
        e.preventDefault();
        gMainWindow.hide();
        connections.pause();
      }
    })

    gMainWindow.on('closed', () => {
      gMainWindow = null
    })


    gMainWindow.on('minimize', function (event) {
      event.preventDefault();
//      gMainWindow.hide(); // do not hide here.
      connections.pause();
   });

   gMainWindow.on('restore', function (event) {
      connections.resume();
      gMainWindow.show();
    });

    gMainWindow.once('ready-to-show', () => {   
//        gMainWindow.webContents.openDevTools()
      insertCss();
    });
  }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    gSettings = connections.init(gVersion);
    createWindow();
    rendererRequests(); 
    gTray = createTray();

    app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  })

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('will-quit', function () {
    btMenu.write();
  })

}

async function insertCss()
{
  try {
    gMainWindowCssKey = await gMainWindow.webContents.insertCSS(gSettings.css);  
    var iii = 1;
  } catch (error) {
    gMainWindowCssKey = null;
  }
}

function appExit()
{
  app.isQuiting = true;
  app.quit();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

initialize()

function createTray() {
  let appIcon = null;
  try {
    appIcon = new Tray(path.join(__dirname, "appicons/icons/png/16x16.png"));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open', click: function () {
              gMainWindow.show();
            }
        },
        {
          label: 'About', click: function () {
            credits.about(gVersion);
          }
        },  
        {
          label: 'Snooze', click: function () {
            connections.boincAllow("menu");
          }
        },       
        {
            label: 'Exit', click: function () {                
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    appIcon.on('double-click', function (event) {
      gMainWindow.show();
    });
    appIcon.setToolTip('BoincTasks Js');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
      
  } catch (error) {  
    var ii = 1;
  }
  return appIcon;
}

function getVersion()
{
  let version = app.getVersion();
  let split = version.split('.');
  let versionS = split[0] + '.' + split[1] + split[2];
  return versionS;
}

function rendererRequests()
{
  gMainWindow.webContents.on('did-finish-load', () => {
    connections.start(gMainWindow, g_mainMenu);

    var set = btMenu.check(btConstants.MENU_SIDEBAR_COMPUTERS);
    sidebarComputers(set);
  })

  ipcMain.on("table_click_header", (renderer, id, shift, alt,ctrl) => {
    connections.clickHeader(id, shift, alt,ctrl)
  })

  ipcMain.on("table_click", (renderer, id, shift,alt,ctrl) => {
    connections.click(id,shift,alt,ctrl)
  })

  ipcMain.on("header_width", (renderer, type, id, data,total) => {
    connections.headerWidth(type, id, data, total);
  })

  ipcMain.on("tab_click", (renderer, selected) => {
    connections.select(selected)
  })

  ipcMain.on("toolbar_click", (renderer, id) => {
    connections.toolbar(id)
  })

  ipcMain.on("sidebar_click", (renderer, id,ctrl) => {
    connections.sidebar(id,ctrl)
  })

  ipcMain.on("tab_request", (renderer, dummy) => {
    connections.requestTab(renderer);
  })

  ipcMain.on("got_computers", (renderer, con) => {
    connections.gotComputers(con);
  })

  ipcMain.on("scan_computers_found", (renderer, items, port, password) => {
    connections.scanComputersAdd(items, port, password);
  })

  ipcMain.on("scan_computers_start", (renderer, password, port) => {
    scanComputers.startScan(password, port);
  })
  
  ipcMain.on("add_project", (renderer, type, sel) => {
    connections.addProject(gChildAddProject,type,sel);
  }) 

  ipcMain.on("settings_color", (renderer, type, data1,data2) => {
    connections.color(type,data1, data2);
  }) 


  ipcMain.on("colomn_order", (renderer, type, data) => {
    connections.colomnOrder(type,data);
  }) 

  ipcMain.on("log", (renderer, type, data) => {
    switch(type)
    {
      case "button_clear":
        logging.logClear(gLogging.type)
      break;
      case "button_log":
        showLog(btConstants.LOGGING_NORMAL);
      break;
      case "button_debug":
        showLog(btConstants.LOGGING_DEBUG);
      break;
      case "button_rules":
        showLog(btConstants.LOGGING_RULES);
      break;
      case "button_error":
        showLog(btConstants.LOGGING_ERROR);
      break;      
    }
  }) 

  ipcMain.on("settings_boinctasks", (renderer, settings) => {
    gSettings = connections.settingsSet(settings);
    setCss(); 
  })

  ipcMain.on("settings_allow", (renderer, combined) => {
    connections.boincAllow("set",combined);
  })

  ipcMain.on("settings_boinc", (renderer, type, settings) => {
    connections.boincSettings(type, settings);
  })

  ipcMain.on("statistics_boinc", (renderer, type, data) => {
    connections.boincStatistics(type, data);
  })  

  ipcMain.on("update", (renderer, type) => {
    const Update = require('./boinctasks/rpc/misc/update');
    const update = new Update();
    update.button(type);    
  }) 

  ipcMain.on("rules", (renderer,type,data,data2) => {
    connections.rules(type,data,data2);    
  })

  ipcMain.on("email", (renderer,type,item) => {
    connections.email(type,item);    
  })
}

function setCss()
{
  try {
    if (gMainWindowCssKey !== null)
    {
      gMainWindow.webContents.removeInsertedCSS(gMainWindowCssKey);     
    } 
    insertCss();
  } catch (error) {
    gMainWindowCssKey = null
  }
}

function setHeaderWidth(set)
{
  connections.setHeaderWidth(set)
}

function setColumnOrder()
{
  connections.setColumnOrder();
}

function startScanComputers()
{
  scanComputers.showScan();
}

function sidebarComputers(set)
{
  btMenu.set(btConstants.MENU_SIDEBAR_COMPUTERS,set);
  gMainWindow.send('sidebar_computers_active', set); 
  connections.sidebarChanged(set);
}

function addProject()
{
  let title = "Add a new project";
  if (gChildAddProject == null)
  {
    let state = windowsState.get("add_project",700,800)

    gChildAddProject = new BrowserWindow({
      'x' : state.x,
      'y' : state.y,
      'width': state.width,
      'height': state.height,
      webPreferences: {
        sandbox : false,
        contextIsolation: false,  
        nodeIntegration: true,
        nodeIntegrationInWorker: true
 //       preload: './preload/preload.js'
      }
    });
    gChildAddProject.loadFile('index/index_add_project.html')
    gChildAddProject.once('ready-to-show', () => {    
      gChildAddProject.show();  
      gChildAddProject.setTitle(title);
    }) 
    gChildAddProject.on('close', () => {
      let bounds = gChildAddProject.getBounds();
      windowsState.set("add_project",bounds.x,bounds.y, bounds.width, bounds.height)
    })     
    gChildAddProject.on('closed', () => {
      gChildAddProject = null
    })    
  }
  else
  {
    gChildAddProject.setTitle(title); 
    gChildAddProject.hide();
    gChildAddProject.show();
    connections.addProject(gChildAddProject,'ready');    
  }
//gChildAddProject.webContents.openDevTools()


}

function showLog(logType)
{
  try {
    clearTimeout(gTimerLog);
    gTimerLog =  setInterval(btTimerLog, 2000);

    let title = logging.logTitle(logType)

    let log = logging.logGet(logType)
    
    if (gLogging.type !== logType)
    {
      gLogging.len = -1;
    }
    gLogging.type = logType;

    if (gChildWindowLog == null)
    {
      let state = windowsState.get("log",500,800)
      gChildWindowLog = new BrowserWindow({
        'x': state.x,
        'y': state.y,
        'width': state.width,
        'height': state.height,      
        webPreferences: {
          sandbox : false,
          contextIsolation: false,  
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
          preload: path.join(__dirname, './preload/preload_log.js')
        }
      });
      gChildWindowLog.loadFile('index/index_log.html')
      gChildWindowLog.once('ready-to-show', () => {    
        gChildWindowLog.show();  
        gChildWindowLog.webContents.send('log_text', log); 
        gChildWindowLog.setTitle(title);
//        gChildWindowLog.webContents.openDevTools()    
      })  
      gChildWindowLog.on('close', () => {
        let bounds = gChildWindowLog.getBounds();
        windowsState.set("log",bounds.x,bounds.y, bounds.width, bounds.height)
      })
      gChildWindowLog.on('closed', () => {
        gChildWindowLog = null
      }) 
    }
    else
    {
      gChildWindowLog.setTitle(title); 
      gChildWindowLog.webContents.send('log_text', log); 
      gChildWindowLog.hide()
      gChildWindowLog.show()    
    }
  } catch (error) {
    
  }
}
  
function btTimerLog()
{
  try {
    if (gChildWindowLog != null) 
    {
      let log = logging.logGet(gLogging.type)
      
      if (log.length !== gLogging.len)
      {
        gLogging.len = log.length;
        gChildWindowLog.webContents.send('log_text', log);
      }
    }
    else
    {
      clearTimeout(gTimerLog);      
    }
  } catch (error) {
    var ii = 1;
  }
} 