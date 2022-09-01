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
const {ipcMain, app, powerMonitor, BrowserWindow, dialog, Menu, Tray, nativeTheme } = require('electron')

const Logging = require('./boinctasks/rpc/functions/logging');
const logging = new Logging();

const ReadWrite  = require('./boinctasks/rpc/functions/readwrite');
const readWrite = new ReadWrite();

const Connections = require('./boinctasks/rpc/connections');
const connections = new Connections();

const WindowsState = require('./boinctasks/rpc/functions/window_state');
const windowsState = new WindowsState();

const BtMenu = require('./boinctasks/rpc/functions/bt_menu');
let gClassBtMenu = new BtMenu();

const reqLanguage = require('./boinctasks/rpc/settings/language');
const gClassLanguage = new reqLanguage();   

const btC = require('./boinctasks/rpc/functions/btconstants');

const path = require('path');
const Functions = require('./boinctasks/rpc/functions/functions');
const functions = new Functions();

let gMenuSettings = null;
let gClassUpdate = null;
let gClassCredits = null;
let gClassScanComputers = null;
let gClassPing = null;

const gotTheLock = app.requestSingleInstanceLock()

let gVersion = getVersion();

let gMainWindow = null;
let gMainWindowCssKey = null;
let gMainWindowCssDark = null;
let gMainMenu = null;
let gDockMenu = null;

let gSettings = null;
//let gTranslation = null;
let gDarkMode = false;
let gTheme = "";

let gTray = null;
let gMenuTemplate;

const isMac = process.platform === 'darwin'

function initDockMenu()
{
  gMenuDockTemplate = [
    {
      label: btC.TL.MENU.MN_OPEN, click: function () {
        gMainWindow.show();
      },
      label: btC.TL.MENU.MN_ABOUT, click: function () {
        if (gClassCredits === null)
        {
          const Credits = require('./boinctasks/rpc/misc/credits');              
          gClassCredits = new Credits();
        }
        gClassCredits.about(gVersion,gTheme);
      },
      label: btC.TL.MENU.MN_SNOOZE, click: function () {
        connections.boincAllow("menu");
      }
      },       
      {
        label: btC.TL.MENU.MN_EXIT, click: function () {                
          app.isQuiting = true;
          app.quit();
        }
      }
  ];
  gDockMenu = Menu.buildFromTemplate(gMenuDockTemplate);

}

function initMenu()
{
  var sidebar = true;
  try {
    sidebar =  gMenuSettings[btC.MENU_SIDEBAR_COMPUTERS];
  } catch (error) {
    gClassBtMenu.set(btC.MENU_SIDEBAR_COMPUTERS, true);  // initially enabled
  }

//https://www.electronjs.org/docs/api/menu

  gMenuTemplate = [ 
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label: btC.TL.MENU.MN_ABOUT,
          click(e) { 
            if (gClassCredits === null)
            {
              const Credits = require('./boinctasks/rpc/misc/credits');              
              gClassCredits = new Credits();
            }
            gClassCredits.about(gVersion,gTheme);
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
          label: btC.TL.MENU.MN_MAC_CLOSE,
          click(e) { 
            appExit();
          }
        },
        { type: 'separator' },        
        {
          label: btC.TL.MENU.MN_RESTART,
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
        label: btC.TL.MENU.MN_FILE,
            submenu: [            
            {
              label: btC.TL.MENU.MN_EXIT,
              click(e) { 
                appExit();
              }
            },
            { type: 'separator' },
            {
              label: btC.TL.MENU.MN_RESTART,
              click(e) { 
                app.relaunch()
                app.exit()
              }
            },          
        ]
        }
      ]),
    {
      label: btC.TL.MENU.MN_VIEW,
        submenu: [
          {
            label: btC.TL.MENU.MN_SIDEBAR_COMPUTER,
            type: "checkbox",
            checked: sidebar,
            click(e) { 
              sidebarComputers(e.checked,true) 
            }
          },
          /*
          {
            label:btC.TL.MENU.MN_COLUMN_WIDTH,
            type: "checkbox",
            checked: false,
            click(e) { 
              setHeaderWidth(e.checked) 
            }
          },
          */  
          {
            label: btC.TL.MENU.MN_COLUMN_ORDER,
            click(e) { 
              setColumnOrder() 
            }
          },                   
      ] 
    },

    {
      label: btC.TL.MENU.MN_COMPUTERS,
        submenu: [
        {
          label: btC.TL.MENU.MN_FIND,
          click(e) { 
            startScanComputers();
          }
        },            
        {
          label: btC.TL.MENU.MN_EDIT,
          click(e) { 
            connections.computerEdit();
          }
        },      
        {
          label: btC.TL.MENU.MN_ADD_COMPUTER,
          click(e) { 
            connections.computerAdd();
          }
        },                         
      ] 
    },    
    {
      label: btC.TL.MENU.MN_PROJECTS,
        submenu: [
        {
          label: btC.TL.MENU.MN_ADD_PROJECT,
          id: 'project_add',
          enabled: true,
          click(e) {
            connections.addProject(gTheme);
          }
        },
        { type: 'separator' },
        {
          label:btC.TL.MENU.MN_ACCOUNT,
          id: 'project_account',
          enabled: true,
          click(e) {
            connections.accountManagerAdd("add",gTheme);
          }
        }
      ] 
    },    
    {
      label: btC.TL.MENU.MN_SHOW,
        submenu: [
          {
            label: btC.TL.MENU.MN_STATISTICS,
            click(e) { 
              connections.boincStatistics("menu");
            }
          },
          {
            label: btC.TL.MENU.MN_STATISTICS_TRANSFER,
            click(e) { 
              connections.boincStatisticsTransfer("menu");
          }
        },          
          { type: 'separator' },
          {
            label: btC.TL.MENU.MN_LOG,
            click() { 
              logging.showLog(btC.LOGGING_NORMAL,gTheme) 
            }
          },
          {
            label: btC.TL.MENU.MN_LOG_DEBUG,
            click() { 
              logging.showLog(btC.LOGGING_DEBUG,gTheme);
            }               
          },
          {
            label: btC.TL.MENU.MN_LOG_RULES,
            click() {
              logging.showLog(btC.LOGGING_RULES,gTheme);
            }
          },        
          {
            label: btC.TL.MENU.MN_LOG_ERROR,
            click() { 
              logging.showLog(btC.LOGGING_ERROR,gTheme);
            }
          },
      ] 
    },
    {
      label: btC.TL.MENU.MN_EXTRA,
        submenu: [
          {
            label: btC.TL.MENU.MN_BT_SET,
            click(e) { 
              connections.settingsStart("menu",gMainWindow);
            }
          },           
          {
            label: btC.TL.MENU.MN_BT_COLOR,
            click(e) { 
              connections.color("menu",gMainWindow);
            }
          }, 
          { type: 'separator' },
          {
            label:btC.TL.MENU.MN_BOINC_SET,
            click(e) { 
              connections.boincSettings("menu");
            }
          },            
          {
            label: btC.TL.MENU.MN_BOINC_ALLOW,
            click(e) { 
              connections.boincAllow("menu");
            }
          },  
          {
            label: btC.TL.MENU.MN_BOINC_BENCH,
            click(e) { 
              connections.boincBenchmark("menu");
            }
          },
          {
            label: btC.TL.MENU.MN_BOINC_READ_CF,
            click(e) { 
              connections.boincReadConfig("menu");
            }
          },
          { type: 'separator' },
          {
            label: 'Debug',
              submenu: [
                {
                  label:'Debug mode',
                  type: "checkbox",
                  checked: btC.DEBUG,          
                  click() {
                    btC.DEBUG = !btC.DEBUG;
                  }
                },
                {
                  label:'Test translation',
                  type: "checkbox",
                  checked: gClassBtMenu.check(btC.MENU_DEBUG_TRANSLATIONS),
                  click() {
                    let set = gClassBtMenu.check(btC.MENU_DEBUG_TRANSLATIONS);
                    set = !set;
                    gClassBtMenu.set(btC.MENU_DEBUG_TRANSLATIONS,set);
                    gClassBtMenu.write();
                  }
                },
                {
                  label:'Ping',       
                  click() {
                    ping();
                  }
                },                
            ] 
          },
      ] 
    },
    {
      label: btC.TL.MENU.MN_RULES,
        submenu: [
          {
            label: btC.TL.MENU.MN_RULES_EDIT,
            click(e) { 
              connections.rules("menu");
            }
          },
          {
            label: btC.TL.MENU.MN_LOG_RULES,
            click() { 
              logging.showLog(btC.LOGGING_RULES,gTheme);
            }
          },
          { type: 'separator' },
          {
            label: btC.TL.MENU.MN_RULES_EMAIL,
            click(e) { 
              connections.email("menu");
            }
          },
      ] 
    },       
    {
      label: btC.TL.MENU.MN_HELP,
        submenu: [
          {
            label: btC.TL.MENU.MN_ABOUT,
            click(e) { 
              if (gClassCredits === null)
              {
                const Credits = require('./boinctasks/rpc/misc/credits');                
                gClassCredits = new Credits();
              }
              gClassCredits.about(gVersion,gTheme);
            }
          },      
          {
            label: btC.TL.MENU.MN_UPDATES,
            click(e) { 
              if (gClassUpdate === null)
              {
                const Update = require('./boinctasks/rpc/misc/update');
                gClassUpdate = new Update();
              }
              gClassUpdate.update("menu",gVersion,gTheme);
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
          gMainWindow.restore(); 
        }
        else
        {
          gMainWindow.show();
        }
      }
    })
  }
  
  function showApp()
  {
    let showArg = app.commandLine.getSwitchValue("show");
    let bShow = false;

    if (gSettings.hideLogin === '1') 
    {
      bShow = false;
      logging.logDebug("main, showApp BoincTasks settings: hideLogin: yes");   
    }

    if (showArg == "yes")  //--show=yes
    {
      bShow = true;
      logging.logDebug("main, showApp arg: show=yes");        
    }
    let argTxt = showArg;
    if (showArg == '')
    {
      argTxt = "arg is empty"
    }

    logging.logDebug("main, showApp showArg: " + argTxt);    
    return bShow;
  }

  function createWindow () {
    // Create the browser window.

    logging.logFile("main, createWindow", "start");

    let bShow = false;

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

    try {
      initMenu();
    } catch (error) {
      logging.logError('main, createWindow', error); 
    }
 
    const gMainMenu = Menu.buildFromTemplate(gMenuTemplate);

    if (process.platform == 'darwin') {
      logging.logFile("main, createWindow", "darwin setApplicationMenu");      
      Menu.setApplicationMenu(gMainMenu); 
    }
    else
    {
      logging.logFile("main, createWindow", "win,linux setMenu");        
      Menu.setApplicationMenu(null);
      gMainWindow.setMenu(gMainMenu);
    }

    // and load the index.html of the app.
    gMainWindow.loadFile('index/index.html')

    gMainWindow.on('close', (e) => {
      let max = gMainWindow.isMaximized();
      let bounds = gMainWindow.getBounds();
      windowsState.set("main",bounds.x,bounds.y, bounds.width, bounds.height,max)
      logging.logFile("main, createWindow", "close, store window, max:" + max);

      if (app.isQuiting)
      {
        logging.logFile("main, createWindow", "close, isQuiting");
      }
      else
      {
        if (gMainWindow.isVisible())
        {
          logging.logFile("main, createWindow", "close, !isQuiting,isVisible");        
          e.preventDefault();
          gMainWindow.hide();
          connections.pause();
        }
        else
        {
          logging.logFile("main, createWindow", "close, !isQuiting,!isVisible");
        }
      }
    })

    gMainWindow.on('closed', () => {
      gMainWindow = null
      logging.logFile("main, createWindow", "closed");      
    })

    gMainWindow.on('maximize', function (event) {
      logging.logFile("main, createWindow", "maximize");     
    });

    gMainWindow.on('minimize', function (event) {
      event.preventDefault();
//      gMainWindow.hide(); // do not hide here.
      connections.pause();
      logging.logFile("main, createWindow", "minimize");      
    });

    gMainWindow.on('restore', function (event) {
      connections.resume();
      gMainWindow.show();
      logging.logFile("main, createWindow", "restore");        
    });

    gMainWindow.once('ready-to-show', () => {

      // extra check to hide app at startup      
      let bShow = showApp();
      if (bShow)
      {
        gMainWindow.show();
      }
      else
      {
        gMainWindow.hide();
      }

      let title = "BoincTasks Js " + gVersion;
      gMainWindow.setTitle(title);
      gMainWindow.webContents.send("translations",btC.TL.SEL);   
//      gMainWindow.webContents.openDevTools()
      insertCss();
      logging.logFile("main, createWindow", "ready-to-show");
    });

    gMainWindow.once('show', () => {
      if (state.max)
      {
        logging.logFile("main, createWindow", "state.max");
        gMainWindow.maximize();
      }
    });
  }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    let userDc = false;
    if (functions.isDefined(gSettings.locale))
    {
      userDc = gSettings.locale.length > 0;
    }
    if (userDc)
    {
      btC.LOCALE = gSettings.locale;
    }
    else
    {
      functions.getBtLocale(app);
    }
    
    //gMenuSettings = gClassBtMenu.read();
    connections.init(gVersion);
    logging.setVersion("V " + gVersion);    
//    gTranslation = connections.translation(gClassBtMenu.check(btC.MENU_DEBUG_TRANSLATIONS));
    if (isMac) {
      initDockMenu();
      app.dock.setMenu(gDockMenu)
    }
    createWindow();
    rendererRequests(); 
    gTray = createTray();
    logging.logFile("main, createWindow", "whenReady");  

    showLanguageSelector(gSettings);

    app.on('activate', function () {
      logging.logFile("main, createWindow", "activate");  
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0)
    {
      logging.logFile("main, createWindow", "whenReady, getAllWindows === 0"); 
      createWindow()
    }
  })
  })

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    logging.logFile("main, createWindow", "window-all-closed");    
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('will-quit', function () {
    logging.logFile("main, createWindow", "will-quit");  
  })
  
  app.on('quit', () => {
    logging.logFile("main, createWindow", "quit");  
    appExit();
  });

  powerMonitor.on('shutdown', () => {
    logging.logFile("main, createWindow", "shutdown");      
    appExit();
  });

}

function getTranslation()
{
  try {
    let requireSettingsBt = require('./boinctasks/rpc/settings/settings_bt'); 
    let settingsBt = new requireSettingsBt();
    gSettings = settingsBt.get();
    let debug = gClassBtMenu.check(btC.MENU_DEBUG_TRANSLATIONS);
    let translation;
    if (debug)
    {
        try {
            translation = readWrite.read("settings", "translation.json");
            if (translation === null)
            {
                translation = readWrite.readResource(__dirname,"translations/BoincTasks_JS_English.json");
                btC.TL = JSON.parse(translation);
                logging.logDebug('Main,getTranslation, translation.json not found');                                   
            }
            btC.TL = JSON.parse(translation);
        } catch (error) {
            translation = readWrite.readResource(__dirname,"translations/BoincTasks_JS_English.json");
            btC.TL = JSON.parse(translation);
            logging.logError('Main,getTranslation Debug', error);  
        }
    }
    else
    {
        try {
            // Language options in index_settings_boinctasks.html
            if (gSettings.language === void 0) gSettings.language = btC.LANG_ENGLISH;            
            switch (gSettings.language)
            {
                case btC.LANG_DUTCH:
                    translation = readWrite.readResource(__dirname,"translations/BoincTasks_JS_Dutch.json");
                break;
                case btC.LANG_FRENCH:
                    translation = readWrite.readResource(__dirname,"translations/BoincTasks_JS_French.json");
                break;
                case btC.LANG_GERMAN:
                    translation = readWrite.readResource(__dirname,"translations/BoincTasks_JS_German.json");
                break;                                
                default:
                    translation = readWrite.readResource(__dirname,"translations/BoincTasks_JS_English.json");            
            }
            btC.TL = JSON.parse(translation);            
        } catch (error) {
          logging.logError('Main,getTranslation', error);
        }
    }    
  } catch (error) {
    logging.logError('Main,getTranslation', error); 
  } 
  if (btC.TL === null)
  {
    logging.logErrorMsg('Main,getTranslation', "getTranslation btC.TL === null");
  }  
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
  logging.logFile("main, appExit", "isQuiting");  
  app.isQuiting = true;
  app.quit();
}

// https://www.electronjs.org/docs/tutorial/dark-mode
function setDarkMode(bWrite,bSingle)
{
  try {
    if (bWrite)
    {
      let mode = new Object
      if (gDarkMode) mode.dark = 1;
      else mode.dark = 0;
      readWrite.write("settings","dark_mode.json",JSON.stringify(mode));
    }

    let darkCss;

    let color = connections.getColor(gDarkMode);
    let selBack = color['#select_background'];
    let selTxt = color['#select_text'];
    if (!gDarkMode)
    {
      // light
      darkCss = "body{background:white;color:black;}";
      darkCss+= ".bt_table_header th {border:1px solid #374a9c;background-color: #cfcfcf;}";
      darkCss+= ".bt_table th {background-color: #cfcfcf;}"
      darkCss+= ".bt_table tr:nth-child(even) {background-color: #d1cfcf;}";
      darkCss+= ".bt_table tr:nth-child(odd) {background-color: white}";      
      darkCss+= ".bt_footer{background-color:#cfcfcf;}";
      darkCss+= ".bt_tabs{background-color:#dfdfdf;}";
      darkCss+= ".bt_table_selected {background-color:" + selBack + " !important;color:" + selTxt + "}";      
      darkCss+= ".sidebar_computers{background-color:#dfdfdf;}";
      darkCss+= ":root {color-scheme: light;}";
      nativeTheme.themeSource = 'light';           
    }
    else
    {
      // dark
      darkCss = "body{background:#333;color:white;}";
      darkCss+= ".bt_table_header th {border:1px solid #374a9c;background-color: #999}";
      darkCss+= ".bt_table th {background-color: #555;}";
      darkCss+= ".bt_table tr:nth-child(even) {background-color:#666;}";
      darkCss+= ".bt_table tr:nth-child(odd) {background-color:#333}";        
      darkCss+= ".bt_footer{background-color:#666666;}";
      darkCss+= ".bt_tabs{background-color:#868686;}";
      darkCss+= ".bt_table_selected {background-color:" + selBack + " !important;color:" + selTxt + "}";  
      darkCss+= ".sidebar_computers{background-color:#666666;}";
      darkCss+= "a {color: lightblue;}";
      darkCss+= ".project_add_select_box{background-color:#333;}"
      darkCss+= ":root {color-scheme: dark;}";      
      nativeTheme.themeSource = 'dark';  
    }
    
    connections.setTheme(darkCss,gDarkMode,bSingle);
    if (gClassScanComputers !== null) gClassScanComputers.setTheme(darkCss);
    if (gClassCredits !== null) gClassCredits.setTheme(darkCss);
    if (gClassUpdate !== null) gClassUpdate.setTheme(darkCss);    
    insertCssDark(darkCss);
    gTheme = darkCss;

    let mode;
    if (gDarkMode) mode = ' <span id="dark_mode_select" class="ef_btn_toolbar bt_img_dark_dark">' + btC.TL.FOOTER.FTR_DARK + '</span>';
    else mode = ' <span id="dark_mode_select" class="ef_btn_toolbar bt_img_dark_light">' + btC.TL.FOOTER.FTR_LIGHT + '</span>';

    gMainWindow.webContents.send("set_dark_mode",mode);    
  } catch (error) { 
    logging.logError('Main,setDarkMode', error);   
  }
}

async function insertCssDark(darkCss)
{
  try {
    if (gMainWindowCssDark !== null)
    {
      gMainWindow.webContents.removeInsertedCSS(gMainWindowCssDark) 
    }    
    gMainWindowCssDark = await gMainWindow.webContents.insertCSS(darkCss);  
  } catch (error) {
    gMainWindowCssDark = null;
    logging.logError('Main,insertCssDark', error);       
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

logging.init();

gMenuSettings = gClassBtMenu.read();
getTranslation();
initialize()

function createTray() {
  let appIcon = null;
  try {
    appIcon = new Tray(path.join(__dirname, "appicons/icons/png/16x16.png"));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: btC.TL.MENU.MN_OPEN, click: function () {
              gMainWindow.show();
            }
        },
        {
          label: btC.TL.MENU.MN_ABOUT, click: function () {
            if (gClassCredits === null)
            {
              const Credits = require('./boinctasks/rpc/misc/credits');              
              gClassCredits = new Credits();
            }
            gClassCredits.about(gVersion,gTheme);
          }
        },  
        {
          label: btC.TL.MENU.MN_SNOOZE, click: function () {
            connections.boincAllow("menu");
          }
        },       
        {
            label: btC.TL.MENU.MN_EXIT, click: function () {                
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
    logging.logError('Main,createTray', error);   
  }
  return appIcon;
}

function showLanguageSelector(settings)
{
  try {
    if (gSettings.languageIsSelected != btC.LANG_NUMBER)
    {
      gClassLanguage.showLanguage(settings,gTheme)
    }      
  } catch (error) {
    logging.logError('Main,showLanguageSelector', error);   
  }
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
    gDarkMode = false;
    try {
      let mode = JSON.parse(readWrite.read("settings","dark_mode.json")); 
      if (mode !== null)
      {
        if (mode.dark) gDarkMode = true;
      }
    } catch (error) {
      logging.logError('Main,rendererRequests, did-finish-load', error);       
    }
    setDarkMode(false,false);

    connections.start(gMainWindow, gMainMenu);

    var set = gClassBtMenu.check(btC.MENU_SIDEBAR_COMPUTERS);
    sidebarComputers(set,false);
  })

  ipcMain.on("table_click_header", (renderer, id, ex, shift, alt,ctrl) => {
    connections.clickHeader(id, ex, shift, alt,ctrl)
  })

  ipcMain.on("table_click", (renderer, id, shift,alt,ctrl) => {
    connections.click(id,shift,alt,ctrl)
  })

  ipcMain.on("header_width", (renderer, type, id, data, total) => {
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
    connections.scanComputersAdd(gClassScanComputers,items, port, password);
  })

  ipcMain.on("scan_computers_start", (renderer, password, port) => {
    if (gClassScanComputers === null)
    {
      const ScanComputers = require('./boinctasks/rpc/computers/scan');      
      gClassScanComputers = new ScanComputers();
    }
    gClassScanComputers.startScan(password, port);
  })

  ipcMain.on("ping_start", (renderer, data) => {
    gClassPing.start(data);
  })
  
  ipcMain.on("add_project", (renderer, type, sel) => {
    connections.processProject(type,sel);
  })
  
  ipcMain.on("add_manager", (renderer, type, sel) => {
    connections.processManager(type,sel);
  })  

  ipcMain.on("info_manager_button", (renderer, type, sel) => {
    connections.accountManagerInfo(gTheme);
  }) 
  
  ipcMain.on("settings_color", (renderer, type, data1,data2) => {
    connections.color(type,data1, data2);
    if (data1 === "#select_background" || data1 == "#select_text")
    {
      setDarkMode(false,true);
    }
  }) 


  ipcMain.on("colomn_order", (renderer, type, data) => {
    connections.colomnOrder(type,data);
  }) 

  ipcMain.on("log", (renderer, type, data) => {
    switch(type)
    {
      case "button_clear":
        logging.logClear()
      break;
      case "button_log":
        logging.showLog(btC.LOGGING_NORMAL,gTheme);
      break;
      case "button_debug":
        logging.showLog(btC.LOGGING_DEBUG,gTheme);
      break;
      case "button_rules":
        logging.showLog(btC.LOGGING_RULES,gTheme);
      break;
      case "button_error":
        logging.showLog(btC.LOGGING_ERROR,gTheme);
      break;      
    }
  }) 

  ipcMain.on("settings_boinctasks", (renderer, settings) => {
    try {
      if (gSettings.language === void 0) gSettings.language = btC.LANG_ENGLISH;      
      let lang = gSettings.language;
      let locale = gSettings.locale;
      gSettings = connections.settingsSet(settings);
      let restart = (lang != gSettings.language && !gClassBtMenu.check(btC.MENU_DEBUG_TRANSLATIONS)) || locale != gSettings.locale;

      if (restart)
      {
        app.relaunch({ args: process.argv.slice(1).concat(['--show=yes']) })
        app.exit(0)
      }
      else setCss();
      connections.settingsClose();
    } catch (error) {
      logging.logError('Main,settings_boinctasks', error);        
    }

  })

  ipcMain.on("settings_language", (renderer, settings) => {
    try {
      let requireSettingsBt = require('./boinctasks/rpc/settings/settings_bt'); 
      let settingsBt = new requireSettingsBt();
      if (gSettings.language != settings.language)
      {     
        gSettings = settingsBt.set(settings);
        app.relaunch()
        app.exit()
      }
      gSettings = settingsBt.set(settings);      
      gClassLanguage.close();
    } catch (error) {
      logging.logError('Main,settings_language', error);        
    }
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

  ipcMain.on("statistics_transfer_boinc", (renderer, type, data) => {
    connections.boincStatisticsTransfer(type, data);
  })  

  ipcMain.on("update", (renderer, type) => {
    gClassUpdate.button(type);    
  }) 

  ipcMain.on("rules", (renderer,type,data,data2) => {
    connections.rules(type,data,data2);    
  })

  ipcMain.on("email", (renderer,type,item) => {
    connections.email(type,item);    
  })

  ipcMain.on("dark_mode_select", (renderer) => {
    gDarkMode = !gDarkMode;
    setDarkMode(true,false);
  })

  ipcMain.on("cc_config", (renderer, type, xml) => {
    connections.cc_config(xml);
  }) 

  ipcMain.on("app_config", (renderer, type, xml) => {
    connections.app_config(xml);
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
  if (gClassScanComputers === null)
  {
  const ScanComputers = require('./boinctasks/rpc/computers/scan');    
    gClassScanComputers = new ScanComputers();    
  }  
  gClassScanComputers.showScan(gTheme);
}

function ping()
{
  if (gClassPing === null)
  {
    const ping = require('./boinctasks/rpc/computers/ping');    
    gClassPing = new ping();    
  }  
  gClassPing.showPing(gTheme);
}

function sidebarComputers(set,write)
{
  gClassBtMenu.set(btC.MENU_SIDEBAR_COMPUTERS,set);
  gMainWindow.send('sidebar_computers_active', set); 
  connections.sidebarChanged(set);
  if (write) gClassBtMenu.write();
}

function debugDialog(msg)
{
  dialog.showErrorBox('BoincTasks Js Debug', msg)
}