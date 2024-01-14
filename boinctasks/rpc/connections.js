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

const {app } = require('electron')

const Functions = require('./functions/functions');
const functions = new Functions();
const Logging = require('./functions/logging');
const logging = new Logging();

const State = require('./misc/state');

const SidebarComputers = require('./misc/sidebar_computers');
const sidebarComputers = new SidebarComputers(); 

const BtTableComputers = require('./computers/table_computers');
const btTableComputers = new BtTableComputers(); 

const BtTableProjects = require('./projects/table_projects');
const btTableProjects = new BtTableProjects();

const BtTableResults = require('./results/table_results');
const btTableResults = new BtTableResults(); 

const BtTableTransfers = require('./transfers/table_transfers');
const btTableTransfers = new BtTableTransfers(); 

const BtTableMessages = require('./messages/table_messages');
const btTableMessages = new BtTableMessages();

const BtTableNotices = require('./notices/table_notices');
const btTableNotices = new BtTableNotices();

const BtTableHistory = require('./history/table_history');
const btTableHistory = new BtTableHistory();

const BtHeader = require('./functions/header');
const btHeader = new BtHeader();

const ReadWrite  = require('./functions/readwrite');
const readWrite = new ReadWrite();

const Toolbar = require('./misc/toolbar');
const toolbar = new Toolbar();

const Boinc = require('./functions/boinc');
const boinc = new Boinc();

const SettingsColor = require('./settings/colors');
const gClassSettingsColor = new SettingsColor();

const RowSelect = require('./misc/row_select');
const rowSelect = new RowSelect();

const SettingsColumnOrder = require('./settings/settings_column_order');
const settingsColumnOrder = new SettingsColumnOrder();

const BtNotices = require('./notices/bt_notices');
const btNotices = new BtNotices();

const BtSocket  = require('./misc/socket');
const Authenticate = require('./misc/authenticate');

const ConnectionsShadow = require('./misc/connections_shadow');
const connectionsShadow = new ConnectionsShadow();

const btC = require('./functions/btconstants');
const btconstants = require('./functions/btconstants');

let gClassAcountManager = null;
let gClassAddProject = null;
let gClassSettingsBoinc = null;
let gClassStatisticsBoinc = null;
let gClassStatisticsTransferBoinc = null;
let gClassSettingsAllow = null;
let gRequireSettingsBt = null;
let gClassHistory = null;
let gClassRulesList = null;
let gClassRulesProcess = null;
let gClassEmail = null;

gClassCcConfig = null;
gClassAppConfig = null;

const MODE_NORMAL = 0;      // normal mode
const MODE_STATE = 1;       // fetching the state
const MODE_RESULTS = 2;
const MODE_HISTORY = 3;     // fetching old results
const MODE_RULES = 4;

const INTERVAL_STATE_FIRST = 2000; 
const INTERVAL_STATE = 2000; 
const INTERVAL_HISTORY_FIRST = 5000;
const INTERVAL_REFRESH_FIRST = 1000;
const INTERVAL_RULES_FIRST = 10000;  // a long time after the state
const INTERVAL_RULES = 30000;

// must be indentical in renderer.js

let gB = new Object();
gB.selectedTab = btC.TAB_TASKS;
gB.headerAction = btC.HEADER_NORMAL;
gB.currentTable = null;
gB.connections = [];
gB.sortComputers = null;
gB.sortProjects = null;
gB.sortResults = null;
gB.sortTransfers = null;
gB.sortMessages = null;
gB.sortHistory = null;
gB.filterExclude = [];
gB.readyToReport = 0;
gB.fetchMode = MODE_NORMAL;
gB.nextRulesFetchTime = new Date().getTime() + INTERVAL_RULES_FIRST;
gB.nextHistoryFetchTime = new Date().getTime() + INTERVAL_HISTORY_FIRST;
gB.nextStateFetchTime = new Date().getTime() + INTERVAL_STATE_FIRST;
gB.nextRefresh = new Date().getTime() + INTERVAL_REFRESH_FIRST;

gB.editComputers = false;
gB.editComputersShow = false;

gB.rules = null;

gB.theme = "";

gB.show = new Object();
gB.show.SHOW_CPU = true;
gB.show.SHOW_GPU = true;
gB.show.SHOW_NONCPUI = true;

let gSettingsBt = null;

let gTimer = null;
let gBusyCnt = 0;
let gBusy = true;
let gPauze = false;
let gRestartAllowed = false;    // prevent a restart loop
//let gIntervalTime = 9; // 0.2 sec
let gIntervalFastCnt = 0;   // fast after startup and after a tab switch

let gSwitchedTabCnt = 2;

let gSidebar = false;
let gVersionS = "?";

class Connections{
    init(version)
    {
        gVersionS = "V " + version;
        if (gSettingsBt === null)
        {
            gRequireSettingsBt = require('./settings/settings_bt');            
            gSettingsBt = new gRequireSettingsBt();
        }
        gB.settings = gSettingsBt.get();
        return gB.settings;
    }

    start(mainWindow, menu)
    {
        const BtMenu = require('./functions/bt_menu');
        let classBtMenu = new BtMenu(); 
        gB.show.SHOW_CPU = true;
        gB.show.SHOW_GPU = true;
        gB.show.SHOW_NONCPUI = true;

        /*
        try {
            gB.show.SHOW_CPU = classBtMenu.check(btC.MENU_SHOW_CPU);
            gB.show.SHOW_GPU = classBtMenu.check(btC.MENU_SHOW_GPU);
            gB.show.SHOW_NONCPUI = classBtMenu.check(btC.MENU_SHOW_NONCPUI);        
        } catch (error) {
            gB.show.SHOW_CPU = true;
            gB.show.SHOW_GPU = true;
            gB.show.SHOW_NONCPUI = true;
        }
        */

 //       setTimeout(test, 1000); // testing test debug
        gB.mainWindow = mainWindow;
        gB.menu = menu;
        rowSelect.init(gB);
        btNotices.init();
        startConnections();
    }

    clickHeader(id, ex, shift, alt,ctrl)
    {
        try {
            if (gB.editComputers) return;
            if (gB.headerAction === btC.HEADER_RESIZE)
            {
                return;
            }
    
            clickHeaderProcess(id, ex, shift, alt,ctrl);            
        } catch (error) {
            logging.logError('Connections,clickHeader', error);             
        }
    }

    click(id,shift,alt,ctrl)
    {
        try {
            if (gB.editComputers) return;
            let idA = id.split(btC.SEPERATOR_ITEM);
            if (idA.length < 2)
            {
            return;
            }
            let type = idA[0];
            let val = idA[1];
            switch(type)
            {
                case "filter":
                    clickFilter(val);
                    processResults(gB.sortResults);
                break;
                case "notice_collapse":
                    btTableNotices.click(gB,val,type)
                    processNotices();
                break;
                case "notice_archive":
                    btTableNotices.click(gB,val,type)
                    processNotices();
                break;                
                default:
                    rowSelect.clickOnRow(gB, idA, shift,alt,ctrl)
                    quickLoad(false);
                    toolbar.show(gB,false);
                    menuEnableAll();
            }
        } catch (error) {
            logging.logError('Connections,click', error);           
        }        
    }

    headerWidth(type, id, data, datap, total)
    {
        btHeader.updateWidth(gB,type, id, data, datap, total);
        gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction)  // update header
        gIntervalFastCnt = 0;
    }

    setHeaderWidth(set)
    {
        setHeaderResize(set);
    }

    setColumnOrder()
    {
        settingsColumnOrder.start(gB,gB.theme);
    }

    toolbar(id)
    {
        try {
            if (gB.editComputers)
            {
                switch(id)
                {
                    case "toolbar_ok_c":
                        let connections = [];
                        for (let i=0;i<gB.connections.length;i++)
                        {
                            let ncon = new Object();    // make an empty template
                            connections.push(ncon);
                        }
                        gB.mainWindow.webContents.send('get_computers', connections);  
                    break;
                }
            }
            else 
            {
                toolbar.click(gB,id, toolbarCallback);            
            }
        } catch (error) {
            logging.logError('Connections,toolbar', error);         
        }        
    }

    select(selected)
    {
        if (gB.editComputers)
        {
            if (!gB.editComputersShow)
            {                         
                gB.mainWindow.webContents.send('set_tab', btC.TAB_COMPUTERS);            
                return;
            }
            gB.editComputersShow = false;
            gB.editComputers = false;       
        }
        toolbar.hide(gB.mainWindow);
        gB.selectedTab = selected;           
        quickLoad(); // in case there is data, show it quickly
        gSwitchedTabCnt = 2;   // update the header twice, just in case we missed the first
        gIntervalFastCnt = 0;
        menuEnableAll();
    }

    sidebar(computer,ctrl)
    {
        gIntervalFastCnt = 0;
        sidebarComputers.click(gB, computer,ctrl)
    }

    requestTab(renderer)
    {
        renderer.reply('set_tab', gB.selectedTab)
    }

    computerEdit()
    {      
        this.select(btC.TAB_COMPUTERS);        
        gB.editComputers = true;
        gB.editComputersShow = false;
        this.select(btC.TAB_COMPUTERS); 
    }

    computerAdd()
    {
        if (gB.editComputers === true) return;        
        let con = newCon();
        gB.connections.push(con); 
        this.select(btC.TAB_COMPUTERS);                
    }

    gotComputers(con)
    {
        try {
            checkComputers(con);
            writeComputers(con);
            startConnections()
        } catch (error) {
            logging.logError('Connections,gotComputers', error);             
        }
    }

    sidebarChanged(set)
    {
        gSidebar = set;
        gSwitchedTabCnt = 2; // update header
    }

    scanComputersAdd(scanComputer,toAdd, port, password)
    {
        try {
            let iAdd = 0;
            let inPort = port;
            if (inPort == "")
            {
                inPort = "31416";
            }
            for (var ia = 0;ia < toAdd.length;ia++)
            {
                let item = toAdd[ia];
                if (item.check)
                {
                    let bFound = false;                    
                    for (var i=0;i< gB.connections.length;i++)
                    {
                        let con = gB.connections[i];
                        if (item.ip == con.ip)
                        {
                            if (inPort == con.port)
                            {
                                bFound = true;
                            }
                        }
                    }
                    if (!bFound)
                    {
                        let con = newCon();
                        con.ip = item.ip;
                        con.port = inPort;
                        if (item.cpid.length > 1)
                        {
                            con.cpid = item.cpid;
                        }
                        if (password.length > 0)
                        {
                            con.passWord = password;
                        }
                        con.computerName = item.computerName;
                        con.check = '1'; // must be 1 instead of true;
                        logging.logDebug("Added " + con.ip + "," + con.port);
                        gB.connections.push(con);
                        iAdd++;
                    }
                    else
                    {
                        logging.logDebug("Already in list: " + item.ip + "," + inPort);
                    }
                }
            }           
            if (iAdd > 0)
            {
                gB.mainWindow.webContents.send('set_tab', btC.TAB_COMPUTERS);                 
                this.select(btC.TAB_COMPUTERS);
                checkComputers(gB.connections);
                writeComputers(gB.connections);
                startConnections()                
            }
            else
            {
                logging.logDebug("0 added, nothing new found");                
            }
            scanComputer.stopScan();         
        } catch (error) {
            logging.logError('Connections,scanComputersAdd', error);             
        }       
    }

    pause()
    {
        gPauze = true;
    }

    resume()
    {
        gIntervalFastCnt = 0;      
        gPauze = false;

    }
    
    addProject(theme)
    {
        if (gClassAddProject === null)
        {
            const AddProject = require('./misc/add_project');            
            gClassAddProject = new AddProject;
        }
        gClassAddProject.addProject(theme);
    }

    processProject(type, data)
    {
        if (gClassAddProject === null)
        {
            const AddProject = require('./misc/add_project');            
            gClassAddProject = new AddProject;
        }        
        gClassAddProject.process(gB, type, data);
    }

    accountManagerAdd(type,theme)
    {
        if (gClassAcountManager === null)
        {
            const AddManager = require('./misc/manager_add');            
            gClassAcountManager = new AddManager;
        }
        gClassAcountManager.addManager(gB);
    }

    processManager(type, data)
    {    
        gClassAcountManager.process(gB, type, data);
    }     

    color(type,data1, data2)
    {
        gClassSettingsColor.set(gotColorsCallback,type,data1, data2,gB.theme, gB.darkMode);
    }

    getColor(darkmode)
    {
        gB.color = gClassSettingsColor.get(darkmode);
        return  gB.color;
    }

    settingsStart()
    {
        gSettingsBt.start(gB.settings,gB.theme);
    }

    settingsSet(settings,debug)
    {
        gSettingsBt.set(settings);       // write
        gB.settings = gSettingsBt.get(); // get and check if valid.
        gSettingsBt.send();   
        return gB.settings;
    }

    settingsClose()
    {
        gSettingsBt.close();
    }

    boincAllow(type,combined)
    {
        if (gClassSettingsAllow === null)
        {
            const SettingsAllow = require('./settings/settings_allow');            
            gClassSettingsAllow = new SettingsAllow();
        }
        gClassSettingsAllow.allow(type,gB,combined,boincAllowCallback);
    }

    boincBenchmark(type)
    {
        const BoincBenchmark = require('./misc/benchmark');
        const boincBenchmark = new BoincBenchmark();
        boincBenchmark.run(type,gB);
    }

    boincReadConfig(type)
    {
        const BoincReadConfig = require('./misc/readconfig');
        const boincReadConfig = new BoincReadConfig();
        boincReadConfig.read(type,gB);
    }

    boincSettings(type,settings)
    {
        if (gClassSettingsBoinc === null)
        {
            const SettingsBoinc = require('./settings/settings_boinc');            
            gClassSettingsBoinc = new SettingsBoinc();
        }
        gClassSettingsBoinc.settingsBoinc(type,gB,settings);
    }

    boincStatistics(type,data)
    {
        if (gClassStatisticsBoinc === null)
        {
            const StatisticsBoinc = require('./settings/statistics_boinc');            
            gClassStatisticsBoinc = new StatisticsBoinc();
        }
        gClassStatisticsBoinc.start(type,gB);
    }

    boincStatisticsTransfer(type,data)
    {
        if (gClassStatisticsTransferBoinc === null)
        {
            const StatisticsTransferBoinc = require('./settings/statistics_transfer_boinc');            
            gClassStatisticsTransferBoinc = new StatisticsTransferBoinc();
        }
        gClassStatisticsTransferBoinc.start(type,gB);
    }

    colomnOrder(type,data)
    {
        settingsColumnOrder.apply(type,gB,data);
        quickLoad(false);
        gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction);        
    }

    rules(type,data,data2)
    {
        if (gClassRulesList === null)
        {
            const RequireRulesList = require('./rules/rules_list');
            gClassRulesList = new RequireRulesList();
        }
        gClassRulesList.rules(gB,type,data,data2);
    }
    email(type,item)
    {
        if (gClassEmail === null)
        {
          const Email = require('./rules/email');
          gClassEmail = new Email();
        }
        gClassEmail.email(gB,type,item);
    }
    cc_config(xml)
    {
        if (gClassCcConfig === null)
        {
            return;
        }
        gClassCcConfig.update(gB,xml);
    }
    app_config(xml)
    {
        if (gClassAppConfig === null)
        {
            return;
        }
        gClassAppConfig.update(gB,xml);
    }

    showCpuGPU(bShow,type)
    {
        switch (type)
        {
            case btC.SHOW_CPU:
                gB.show.SHOW_CPU = bShow;
            break;
            case btC.SHOW_GPU:
                gB.show.SHOW_GPU = bShow;
            break;
            case btC.SHOW_NONCPUI:
                gB.show.SHOW_NONCPUI = bShow;
            break;
        }
        gIntervalFastCnt = 0;
    }

    setTheme(css,darkmode,bSingle)
    {
        gB.theme = css;
        gB.darkMode = darkmode;
        logging.setTheme(css);        
        if (gClassAddProject !== null) gClassAddProject.setTheme(css);
        if (gClassStatisticsBoinc !== null) gClassStatisticsBoinc.setTheme(css);
        if (gClassStatisticsTransferBoinc !== null) gClassStatisticsTransferBoinc.setTheme(css);        
        if (gSettingsBt !== null) gSettingsBt.setTheme(css);
        if (gClassSettingsBoinc !== null) gClassSettingsBoinc.setTheme(css);
        if (gClassSettingsAllow !== null) gClassSettingsAllow.setTheme(css);
        if (gClassRulesList !== null) gClassRulesList.setTheme(css);
        if (gClassEmail !== null) gClassEmail.setTheme(css);
        if (gClassAcountManager !== null) gClassAcountManager.setTheme(css);
        if (gClassCcConfig !== null) gClassCcConfig.setTheme(css);
        if (gClassAppConfig !== null) gClassAppConfig.setTheme(css);
        if (settingsColumnOrder !== null) settingsColumnOrder.setTheme(css);
        if (!bSingle)
        {
            gClassSettingsColor.setTheme(darkmode,css);
            gB.color = gClassSettingsColor.get(darkmode);                 
        }
        gIntervalFastCnt = 0;
    }

    getTab()
    {
        return gB.selectedTab;
    }

    getSelected()
    {
        switch(gB.selectedTab)
        {
            case btC.TAB_COMPUTERS:
                return gB.rowSelect.computers.rowSelected;
            break;        
            case btC.TAB_PROJECTS:
                return gB.rowSelect.projects.rowSelected;
            break;        
            case btC.TAB_TASKS:
                return gB.rowSelect.results.rowSelected;
            break;
            case btC.TAB_TRANSFERS:
                return gB.rowSelect.transfers.rowSelected;
            break;        
            case btC.TAB_MESSAGES:
                return gB.rowSelect.messages.rowSelected;
            break; 
            case btC.TAB_HISTORY:
                return gB.rowSelect.history.rowSelected;
            break;             
        }

        return null;
    }

    getReadyToReport()
    {
        return gB.readyToReport;
    }

}

module.exports = Connections;

function test()
{
/*    
    if (gClassAcountManager === null)
    {
        const AddManager = require('./misc/manager_add');            
        gClassAcountManager = new AddManager;
    }
    gClassAcountManager.addManager(gB);    
*/
/*
    if (gClassAddProject === null)
    {
        const AddProject = require('./misc/add_project');            
        gClassAddProject = new AddProject;
    }
    gClassAddProject.addProject(gB);
*/
}

function clickHeaderProcess(id, ex, shift, alt,ctrl)
{
    var sort;
    let pos = id.indexOf("resize");
    if (pos >= 0)
    {
        let idR = id.split(",");
        if (idR.length > 1)
        {
            gB.mainWindow.webContents.send('header_resize_width', ex, idR[1],gB.currentTable.name)         
        }
//        setHeaderResize(true);
        return;
    }
    switch (gB.currentTable.name)
    {
        case btC.TAB_COMPUTERS:
            if (gB.sortComputers == null)
            {
                gB.sortComputers = new Object;
                gB.sortComputers.pCol = -1;
                gB.sortComputers.sCol = -1;
                gB.sortComputers.tCol = -1;
        
                gB.sortComputers.pDir = '';
                gB.sortComputers.sDir = '';
                gB.sortComputers.tDir = '';
            }
            clickHeader(id,gB.sortComputers,shift,alt,ctrl);
            sort = gB.sortComputers;             
            readWrite.write("settings\\sorting","sorting_computer.json",JSON.stringify(sort));
            processComputers(sort);
            updateSideBar();
        break;            
        case btC.TAB_PROJECTS:
            if (gB.sortProjects == null)
            {
                gB.sortProjects = new Object;
                gB.sortProjects.pCol = -1;
                gB.sortProjects.sCol = -1;
                gB.sortProjects.tCol = -1;
        
                gB.sortProjects.pDir = '';
                gB.sortProjects.sDir = '';
                gB.sortProjects.tDir = '';
            }
            clickHeader(id,gB.sortProjects,shift,alt,ctrl);
            sort = gB.sortProjects
            readWrite.write("settings\\sorting","sorting_projects.json",JSON.stringify(sort));                
            processProjects(sort);    
        break;            
        case btC.TAB_TASKS:
            if (gB.sortResults == null)
            {
                gB.sortResults = new Object;
                gB.sortResults.pCol = -1;
                gB.sortResults.sCol = -1;
                gB.sortResults.tCol = -1;
        
                gB.sortResults.pDir = '';
                gB.sortResults.sDir = '';
                gB.sortResults.tDir = '';
            }
            clickHeader(id,gB.sortResults,shift,alt,ctrl);
            sort = gB.sortResults;
            readWrite.write("settings\\sorting","sorting_results.json",JSON.stringify(sort)); 
            processResults(sort);                       
        break;
        case btC.TAB_TRANSFERS:
            if (gB.sortTransfers == null)
            {
                gB.sortTransfers = new Object;
                gB.sortTransfers.pCol = -1;
                gB.sortTransfers.sCol = -1;
                gB.sortTransfers.tCol = -1;
        
                gB.sortTransfers.pDir = '';
                gB.sortTransfers.sDir = '';
                gB.sortTransfers.tDir = '';
            }
            clickHeader(id,gB.sortTransfers,shift,alt,ctrl);
            sort = gB.sortTransfers;
            readWrite.write("settings\\sorting","sorting_transfers.json",JSON.stringify(sort));
            processTransfers(gB.sortTransfers);    
        break;            
        case btC.TAB_MESSAGES:
            if (gB.sortMessages == null)
            {
                gB.sortMessages = new Object;
                gB.sortMessages.pCol = -1;
                gB.sortMessages.sCol = -1;
                gB.sortMessages.tCol = -1;
        
                gB.sortMessages.pDir = '';
                gB.sortMessages.sDir = '';
                gB.sortMessages.tDir = '';
            }
            clickHeader(id,gB.sortMessages,shift,alt,ctrl);
            sort = gB.sortMessages;  
            readWrite.write("settings\\sorting","sorting_messages.json",JSON.stringify(sort));
            processMessages(sort);    
        break;    
        case btC.TAB_HISTORY:
            if (gB.sortHistory == null)
            {
                gB.sortHistory = new Object;
                gB.sortHistory.pCol = -1;
                gB.sortHistory.sCol = -1;
                gB.sortHistory.tCol = -1;
        
                gB.sortHistory.pDir = '';
                gB.sortHistory.sDir = '';
                gB.sortHistory.tDir = '';
            }
            clickHeader(id,gB.sortHistory,shift,alt,ctrl);
            sort = gB.sortHistory;
            readWrite.write("settings\\sorting","sorting_history.json",JSON.stringify(sort));   
            processHistory(sort);                                     
        break;                    
    }
    gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction)  // update header
}

function toolbarCallback(command)
{
    try {
        let bFound = false;
        switch (command)
        {
            case "remove_selected":
                for(let i=0;i<gB.connections.length;i++)
                {
                    let con = gB.connections[i];
                    let selId = con.ip + btC.SEPERATOR_SELECT + con.computerName;              
                    let sel = gB.rowSelect.computers.rowSelected.indexOf(selId)               
                    if (sel >=0)
                    {
                        gB.connections.splice(i, 1);  // remove
                        bFound = true;
                    }
                }
            break;
        }
        if (bFound)
        {
            writeComputers(gB.connections);
            startConnections();            
        }
    } catch (error) {
        logging.logError('Connections,toolbarCallback', error);             
    }    
}

function boincAllowCallback()
{
    gClassSettingsAllow.allow("menu",gB);
}

function menuEnableAll()
{
    /*
    try {
        let sel;
        switch (gB.selectedTab)
        {
            case "computers":
                sel = btTableComputers.selectedCount()
                if (sel > 0)            
                {
                    menuEnable("project_add",true);
                }
                else
                {
                    menuEnable("project_add",false);
                }
            break;
            default:
                menuEnable("project_add",false);
        }             
    } catch (error) {
        logging.logError('Connections,menuEnableAll', error);       
    }    
*/       
}

//function menuEnable(id,enable)
//{
//    let item = gB.menu.getMenuItemById(id);
//    item.enable = enable;
//}


function gotColorsCallback(color)
{
    gB.color = color;
}

function startTimers()
{
    gTimer = setInterval(btTimer, 200);    // 0.2 second
//    gTimerState =  setInterval(btTimerState, 2000); // wait for the rest to complete, before reading the state
    gBusy = true;    
    gBusyCnt = 0;
}

function stopTimers()
{
//    clearTimeout(gTimerState);
    clearTimeout(gTimer);
}

function startConnections()
{
    getComputers();
    getRules();    
    getSorting();
    btHeader.getWidth(gB);
    gB.currentTable = new Object();
    gB.currentTable.name = "";
    gB.currentTable.table = null;
    gB.currentTable.resultTable = null;
    
    gB.editComputers = false;
    gB.editComputersShow = false;

    gB.order = settingsColumnOrder.get();

    gB.notices = null;

    startTimers();

    var txt = "";
    if (!functions.isDefined(gB.connections)) txt += "The list is empty, no computers found, STOP";
    else
    {
        txt += btC.TL.MSG_GENERAL.MSG_COMPUTERS_FOUND + " " + gB.connections.length;
    }
    logging.log(txt);
    sidebarComputers.build(gB)
    connectionsShadow.cloneConnection(gB);
    connectAll();
}

function clickHeader(id,sort,shift,alt,ctrl)
{
  var newId = parseInt(id);
    if (ctrl)   // second
    {
        if (newId != sort.sCol)
        {
            sort.sSec = "up";
        }
        else 
        {
            switch (sort.sDir)
            {
            case "up":
                sort.sDir = "down";
        
            break;
            case "down":
                sort.sDir = '';
            break;
            default:
                sort.sDir = "up";
            }
        }
        sort.sCol = newId;
        if (sort.pCol === newId) sort.pCol = -1;
        if (sort.tCol === newId) sort.tCol = -1;        

        return
    }

    if (alt) // third
    {
        if (newId != sort.tCol)
        {
            sort.tSec = "up";
        }
        else 
        {
            switch (sort.tDir)
            {
            case "up":
                sort.tDir = "down";
        
            break;
            case "down":
                sort.tDir = null;
            break;
            default:
                sort.tDir = "up";
            }
        }
        sort.tCol = newId;
        if (sort.pCol === newId) sort.pCol = -1;
        if (sort.sCol === newId) sort.sCol = -1;         
        return
    }

    // first
    if (newId != sort.pCol)
    {
        sort.pDir = "up";
    }
    else 
    {
        switch (sort.pDir)
        {
        case "up":
            sort.pDir = "down";

        break;
        case "down":
            sort.pDir = null;
        break;
        default:
            sort.pDir = "up";
        }
    }
    sort.pCol = newId;
    if (sort.sCol === newId) sort.sCol = -1;
    if (sort.tCol === newId) sort.tCol = -1;     
}

function setHeaderResize(set)
{
    if (set)
    {
        gB.headerAction = btC.HEADER_RESIZE;
        gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction)  // update header                
    }
    else
    {
        btHeader.getWidth(gB);   // table header px -> % 
        gB.headerAction = btC.HEADER_NORMAL;
        gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction)  // update header          
    }
}

function getComputers()
{
    try {
        var computersXml = readWrite.read("settings", "computers.xml");  // get computers

        let setLocalhost = "<computers><computer><id_name>Local machine</id_name><id_group></id_group><ip>localhost</ip><cpid></cpid><checked>1</checked><port>31416</port><password></password></computer></computers>";
    
        if(!functions.isDefined(computersXml))
        {
            computersXml = setLocalhost;
        }
        var data = parseComputers(computersXml);
        if(!functions.isDefined(data))
        {
            computersXml = setLocalhost;
            data = parseComputers(computersXml);
        }
    
        gB.connections = getConnections(data);
    } catch (error) {
        logging.logError('Connections,getComputers', error);       
    }

}

function checkComputers(connections)
{
    try {
        let bEqual = true;
        while (bEqual)
        {
            bEqual = false;
            for (let i=0;i<connections.length;i++)   
            {
                let con = connections[i];
                for (let ic = 0; ic < connections.length;ic++)
                {
                    if (i === ic)                
                    {
                        continue;
                    }                
                    let conI = connections[ic];                
                    if (con.computerName == conI.computerName)
                    {
                        bEqual = true;
                        con.computerName += i;
                    }
                }
            }     
        }
    } catch (error) {
        logging.logError('Connections,checkComputers', error);         
    }

}

function writeComputers(con)
{
    try {
        let xml = "<computers>\n";
        for (let i=0;i<con.length;i++)
        {
            xml += "  <computer>\n";
            xml += writeXmlItem("id_name",con[i].computerName);
            xml += writeXmlItem("id_group",con[i].group);
            xml += writeXmlItem("ip",con[i].ip);
            xml += writeXmlItem("cpid",con[i].cpid);
            xml += writeXmlItem("checked",con[i].check);
            xml += writeXmlItem("port",con[i].port);
            if (con[i].temp !== void 0)
            {
                if (con[i].temp.port !== void 0)
                {                
                    xml += writeXmlItem("port_temperature",con[i].temp.port);
                }
            }
            xml += writeXmlItem("password",con[i].passWord);
            xml += "  </computer>\n"
        }
        xml += "</computers>"
        readWrite.write("settings","computers.xml",xml); 
    } catch (error) {
        logging.logError('Connections,writeComputers', error);   
    }
}

function writeXmlItem(tag,item)
{
    let xml = "    <"  + tag + ">";
    xml += item;
    xml += "</"  + tag + ">\n";
    return xml;
}

function getSorting()
{
    try {
        gB.sortComputers = JSON.parse(readWrite.read("settings\\sorting", "sorting_computer.json"));
        gB.sortProjects = JSON.parse(readWrite.read("settings\\sorting","sorting_projects.json"));
        gB.sortResults =  JSON.parse(readWrite.read("settings\\sorting","sorting_results.json"));
        gB.sortTransfers =  JSON.parse(readWrite.read("settings\\sorting","sorting_transfers.json"));
        gB.sortMessages = JSON.parse(readWrite.read("settings\\sorting","sorting_messages.json"));    
        gB.sortHistory = JSON.parse(readWrite.read("settings\\sorting","sorting_history.json"));         
    } catch (error) {
        logging.logError('Connections,getSorting', error); 
    }
}

function getRules()
{
    try {
        gB.rules = new Object;

        try {
            gB.rules.list = JSON.parse(readWrite.read("settings\\rules", "rules.json")); 
        } catch (error) {
            gB.rules.list = null;
        }
        if (gB.rules.list === null) 
        {
            try {
                gB.rules.list = JSON.parse(readWrite.read("settings\\rules", "rules_backup1.json"));
            } catch (error) {
                gB.rules.list = null;
            }
        }
        if (gB.rules.list === null)
        {
            gB.rules.list = [];
        }
        gB.rules.computerList = [];        
        gB.rules.compiled = false;

        try {
            gB.rules.email = JSON.parse(readWrite.read("settings\\email", "email.json"));             
        } catch (error) {
            gB.rules.email = null;
        }
        if (gB.rules.email === null)
        {
            gB.rules.email = new Object;
        }

        if (gClassEmail === null)
        {
            const Email = require('./rules/email');
            gClassEmail = new Email();
        }             
        gClassEmail.readXml(gB);
    
    } catch (error) {
        logging.logError('Connections,getSgetRulesorting', error);         
    }
}

function connectAll()
{
    try {
        if (!functions.isDefined(gB.connections))
        {
            logging.logError('Connections,connectAll', "Aborting...<br>No computers in the list.<br>We need at least one computer.");         
            clearTimeout(gTimer);
            return;
        }
        for (var i=0;i< gB.connections.length;i++)
        {
            gB.connections[i].fetchMode = MODE_NORMAL;            
        }

        for (var i=0;i< gB.connections.length;i++)
        {
            let con = gB.connections[i];
            if (con.check == '0') continue; // disabled
            if (gB.selectedTab == btC.TAB_TASKS)
            {            
                if (con.sidebar || con.sidebarGrp)
                {   
                    if (con.temp.conTempClass != null)
                    {
                        con.temp.conTempClass.send(con);
                    }
                    else
                    {
                        if (con.temp.port > 0)
                        {
                            const ConTemp  = require('./misc/connections_temperature');
                            con.temp.conTempClass = new ConTemp();                       
                            con.temp.conTempClass.send(con);
                        }
                    }
                }
            }
        }        

        for (var i=0;i< gB.connections.length;i++)
        {
            let con = gB.connections[i];
            con.mode = "inactive";
            if (con.check == '0') continue; // disabled

            if (gB.selectedTab == btC.TAB_MESSAGES)
            {
                if (con.sidebar || con.sidebarGrp)
                {
                    connectSingle(con);  
                    return; // we only need one
                }
            }
            if (con.sidebar || con.sidebarGrp)
            {                
                connectSingle(con);
            }
        }      
    } catch (error) {
        logging.logError('Connections,connectAll', error); 
    }    
}

function connectAllState()
{
    try {
        if (!functions.isDefined(gB.connections))
        {
            return;
        }

        for (var i=0;i< gB.connections.length;i++)
        {
            let con = gB.connections[i];
            con.fetchMode = MODE_STATE;            
            if (con.check == '0') continue;
            if (!con.auth) continue;
            if (con.needState || con.state == null)
            { 
                logging.logDebug(btconstants.TL.MSG_GENERAL.MSG_READ_STATE + " " + con.computerName);
                connectSingle(gB.connections[i]);
            }
            else 
            {
                con.mode = "no_state";  // don't need state
            }
        }
    } catch (error) {
        logging.logError('Connections,connectAll', error); 
    }    
}

function connectAllAll(fetchMode)
{
    try {
        if (!functions.isDefined(gB.connections))
        {
            return;
        }

        for (var i=0;i< gB.connections.length;i++)
        {
            let con = gB.connections[i];
            con.fetchMode = fetchMode;            
            if (con.check == '0') continue;
            connectSingle(con);
        }
    } catch (error) {
        logging.logError('Connections,connectAll', error); 
    }    
}

function connectRules(fetchMode)
{
    try {
        if (!functions.isDefined(gB.connections))
        {
            return;
        }
        if (gClassRulesProcess === null)
        {
            const RulesProcess = require('./rules/rules_process');
            gClassRulesProcess = new RulesProcess();
        }
        if (!gB.rules.compiled)
        {
            for (var i=0;i< gB.connections.length;i++)
            {
                let con = gB.connections[i];
                con.rules = new Object;
                con.rules.list = [];
                con.rules.active = new Object;        
                con.rules.compiled = false;
                con.rules.auth = false;
                con.rules.seenLost = false;
            }
            gClassRulesProcess.makeComputerList(gB);
        }

        for (var i=0;i< gB.connections.length;i++)
        {
            let con = gB.connections[i];
            let computerName = con.computerName;
            let pos = gB.rules.computerList.indexOf(computerName);
            if (pos < 0) continue; // no rule for this computer

            if (!con.rules.compiled)
            {
                gClassRulesProcess.compileCon(con);
            }

            con.fetchMode = fetchMode;            
            if (con.check == '0') continue;
            connectSingle(con);
        }
    } catch (error) {
        logging.logError('Connections,connectRules', error); 
    }    
}

function connectSingle(con)
{
    if ((gB.selectedTab != btC.TAB_COMPUTERS) && (con.check == '0'))
    {
        con.mode = "inactive";
        return;
    }

    con.mode = "start";
    con.selected = gB.selectedTab;
    if (!con.auth)
    {
        if (con.authRetry <= 0)
        {
            con.authRetry = 4;
            // we must create a socket for every connection

            if (con.client_socket != null)
            {
              con.client_socket.end();                 
                con.client_socket.destroy(); 
                con.client_socket = null;
            }
            con.client_socket = new BtSocket();
            con.client_socket.socket(con);
            const athenticate = new Authenticate();
            con.client_callback = connectAuth;
            athenticate.authorize(con);
        }
        con.authRetry--;
    }
    else
    {
        connectAuth(con);
    }
}

function parseComputers(xml)
{
    const Functions = require('./functions/functions');
    const functions = new Functions();

    var computerArray = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, computers) {
        if (functions.isDefined(computers))
        {
            computerArray = computers['computers']['computer'];
            if (functions.isDefined(computerArray))
            {
                return computerArray;
            }
            else
            {
                computerArray = null;
            }
        }
        return null;
        });
    } catch (error) {
        logging.logError('Connections,parseComputers', error);          
        return null;
    }
    return computerArray;
}

function getConnections(computers)
{
    connections = [];
    try {
        const History = require('./history/history');
        const history = new History(); 

        for (var i=0;i<computers.length;i++)
        {
            var computer = computers[i];
            var con = newCon();         
            con.check = "0";
            if (functions.isDefined(computer.checked))
            {
                con.check = computer.checked.toString();              
            }
            con.ip = "";
            if (functions.isDefined(computer.ip))
            {
                con.ip = computer.ip.toString();              
            }

            let port = 0;           
            if (functions.isDefined(computer.port))
            {
                port = parseInt(computer.port);
            }
            if (port <= 0) port = 31416;
            con.port = port;

            let tempPort = -1;
            if (functions.isDefined(computer.port_temperature))
            {
                tempPort = parseInt(computer.port_temperature);
            }
            con.temp.port = tempPort;            

            con.cpid = "";
            if (functions.isDefined(computer.cpid))
            {
                con.cpid = computer.cpid.toString();              
            }
            con.passWord = "";
            if (functions.isDefined(computer.password))
            {
                con.passWord = decodeURI(computer.password.toString());                  
            }
            con.computerName = "";
            if (functions.isDefined(computer.id_name))
            {
                con.computerName = decodeURI(computer.id_name.toString());            
            }

            let bReadPassword = false;
            if (con.ip.toLowerCase() === "127.0.0.1")
            {
                bReadPassword = true;
            }
            if (con.ip.toLowerCase() === "::1")
            {
                bReadPassword = true;
            }

            if (con.ip.toLowerCase() === "localhost")
            {
                bReadPassword = true;                
                con.ip = "127.0.0.1"; // otherwise the system uses a not working ::1 on Windows
            }
            if (con.check == '1')
            {
                if (bReadPassword)
                {
                    if ((con.port === "") || (con.port === 31416))
                    {
                        if (con.passWord === "")
                        {
                            con.passWord = boinc.getPassword().toString()
                        }
                    }
                }
            }
            con.group = "";
            if (functions.isDefined(computer.id_group))
            {
                con.group = decodeURI(computer.id_group.toString());            
            }

            history.read(con, gB.settings);

            connections.push(con);
        }
        sortArrayComputers(connections)
    } catch (error) {
        logging.logError('Connections,getConnections', error);           
        return null;
        
    }
    return connections;
}

// make changes in connections_shadow as well.
function newCon()
{
    let con = new Object();
    con.computerName = "";
    con.group = "";
    con.check = "0";
    con.ip = "";
    con.port = 31416;
    con.passWord = "";
    con.client_socket = null;
    con.authTimeValid = 0;
    con.auth = false;
    con.authRetry = 0;
    con.authTimeout = 0;
    con.lostConnection = false;
    con.isShadow = false;
    con.error = '';
    con.boinc = ''; 
    con.platform = '';

    con.sidebarGrp = true;
    con.mode = '';
    con.state = null;
    con.cacheProject = null;
    con.cacheApp = null;    
    con.needState = true;
    con.from = -1;

    con.ccstatus = null;            
    con.computer = null;
    con.results = null;    
    con.transfers = null;
    con.history = null;

    con.rules = null;
    con.shadow = null;

    con.temp = new Object;
    con.temp.port = -1;
    con.temp.clientClass = null;    
    con.temp.conTempClass = null;

    return con;
}

function sortArrayComputers(connections)
{
    try {
        connections.sort(compareComputers);
        connections.sort(compareComputersGroup);
    } catch (error) {
        logging.logError('Connections,sortArrayComputers', error);  
    }
}

function compareComputers(a,b)
{
    if (a.computerName > b.computerName) return 1;
    else if (a.computerName < b.computerName) return -1;
    return 0;
}

function compareComputersGroup(a,b)
{
    if (a.group > b.group) return 1;
    else if (a.group < b.group) return -1;
    return 0;
}

// now we are authenticated
function connectAuth(con)
{
    try {
        if (!con.auth)
        {
            return;
        }

        switch(gB.fetchMode)
        { 
            case MODE_HISTORY:        
                if (gClassHistory === null)
                {
                    const History = require('./history/history');
                    gClassHistory = new History();
                }
                gClassHistory.getHistory(con,gB.settings)            
            return;

            case MODE_RULES:
                if (gClassRulesProcess === null)
                {
                    const RulesProcess = require('./rules/rules_process');
                    gClassRulesProcess = new RulesProcess();
                }                
                gClassRulesProcess.getRules(con,gB);
            return;

            case MODE_RESULTS:
                getResults(con);
            return

            case MODE_STATE:
                const state = new State();
                state.getState(con);               
            return            
        }


        switch (con.selected)
        {
            case btC.TAB_COMPUTERS:
                const Computers = require('./computers/computers');
                const computers = new Computers(); 
                computers.getComputers(con)
            break;        
            case btC.TAB_PROJECTS:
                const Projects = require('./projects/projects');
                const projects = new Projects(); 
                projects.getProjects(con)
            break;        
            case btC.TAB_TASKS:
                const CcStatus = require('./misc/cc_status');
                const ccStatus = new CcStatus();
                con.client_callback = getResults;
                ccStatus.getCcStatus(con);
            break;
            case btC.TAB_TRANSFERS:
                const Transfers = require('./transfers/transfers');
                const transfers = new Transfers();
                transfers.getTransfers(con);
            break;            
            case btC.TAB_MESSAGES:
                const Messages = require('./messages/messages');
                const messages = new Messages(); 
                messages.getMessages(con)
            break;   
            case btC.TAB_NOTICES:
                const Notices = require('./notices/notices');
                const notices = new Notices(); 
                notices.getNotices(con)
            break;    
            case btC.TAB_HISTORY:
                con.mode = btC.TAB_HISTORY; 
            break;
        }
    } catch (error) {
        logging.logError('Connections,connectAuth', error);          
    }    
}

function getResults(con)
{
    const Results = require('./results/results');
    const results = new Results();
    results.getResults(con);
}

function process()
{
    if (gB.fetchMode !== MODE_NORMAL) 
    {
        return;
    }

    switch (gB.selectedTab)
    {
        case btC.TAB_COMPUTERS:
            processComputers(gB.sortComputers);
        break;        
        case btC.TAB_PROJECTS:
            processProjects(gB.sortProjects);
        break;        
        case btC.TAB_TASKS:
            processResults(gB.sortResults);
        break;
        case btC.TAB_TRANSFERS:
            processTransfers(gB.sortTransfers);
        break;        
        case btC.TAB_MESSAGES:
            processMessages(gB.sortMessages);
        break; 
        case btC.TAB_NOTICES:
            processNotices();
        break; 
        case btC.TAB_HISTORY:
            processHistory(gB.sortHistory);
        break;                        
    }
}

function processComputers(sort)
{    
    try {
 //       gB.currentTable.computerTable = null;
        gB.currentTable.resultTable = null;
        gB.currentTable.transfersTable = null;
        gB.currentTable.messageTable = null;
        gB.currentTable.historyTable = null;
        gB.currentTable.noticesTable = null;
        gB.currentTable.projectTable = null;


        if (gB.editComputers && gB.editComputersShow) return;
 //       if (gB.connections[0].selected != "computers") return;

        const ProcessComputers = require('./computers/proces_computers')
        let pc = new ProcessComputers(); 
        let cTable =  pc.process(gB.connections,sort);    
        if (cTable.length == 0) return;
        gB.currentTable.name = btC.TAB_COMPUTERS;        
        if (gSwitchedTabCnt-- >0)
        {
            gB.mainWindow.webContents.send('table_data_header', btTableComputers.tableHeader(gB,gSidebar),  gB.currentTable.name, gB.headerAction);
            gB.currentTable.computersHeaderHtml = btTableComputers.tableHeader(gB,gSidebar);
        }
        gB.currentTable.table = btTableComputers;
        gB.currentTable.computerTable = cTable;
        tableReady("", gVersionS, btTableComputers.table(gB,cTable));   
        gB.editComputersShow = true;
        cTable = null;
        pc = null;
    } catch (error) {
        logging.logError('Connections,processComputers', error);        
    }    
}

function processProjects(sort)
{
    try{
        gB.currentTable.computerTable = null;
        gB.currentTable.resultTable = null;
        gB.currentTable.transfersTable = null;
        gB.currentTable.messageTable = null;
        gB.currentTable.historyTable = null;
        gB.currentTable.noticesTable = null;
 //       gB.currentTable.projectTable = null;

        const ProcessProjects = require('./projects/process_projects')
        let pp = new ProcessProjects(); 
        var cTable =  pp.process(gB.connections,sort);
        gB.currentTable.name = btC.TAB_PROJECTS;
        if (gSwitchedTabCnt-- >0)
        {
            gB.mainWindow.webContents.send('table_data_header', btTableProjects.tableHeader(gB,gSidebar), gB.currentTable.name, gB.headerAction);
            gB.currentTable.projectsHeaderHtml = btTableProjects.tableHeader(gB,gSidebar);
        }
        gB.currentTable.table = btTableProjects;    
        gB.currentTable.projectTable = cTable;
        tableReady("", gVersionS, btTableProjects.table(gB, cTable))
        cTable = null;
        pp = null;
    } catch (error) {
        logging.logError('Connections,processProjects', error);        
    }     
}

function processResults(sort,project)
{
    try {
        gB.currentTable.computerTable = null;
//        gB.currentTable.resultTable = null;
        gB.currentTable.transfersTable = null;
        gB.currentTable.messageTable = null;
        gB.currentTable.historyTable = null;
        gB.currentTable.noticesTable = null;
        gB.currentTable.projectTable = null;

        const ProcessResults = require('./results/process_results')
        const pr = new ProcessResults(); 
        let ret =  pr.process(gB.connections, gB.filterExclude,sort,project);
        gB.readyToReport = pr.readyToReport();
        let status = btC.TL.FOOTER.FTR_TASKS + " " + ret.resultCount;
        gB.currentTable.name = btC.TAB_TASKS;
        if (gSwitchedTabCnt-- >0)
        {
            gB.mainWindow.webContents.send('table_data_header', btTableResults.tableHeader(gB, gSidebar), gB.currentTable.name, gB.headerAction);
            gB.currentTable.resultsHeaderHtml = btTableResults.tableHeader(gB, gSidebar);
        }

        gB.currentTable.table = btTableResults;    
        gB.currentTable.resultTable = ret.cTable;
        tableReady(status, gVersionS, btTableResults.table(gB,ret.cTable))
        ret.cTable = null;
    } catch (error) {
        logging.logError('Connections,processResults', error);      
    }     
}

function processTransfers(sort)
{
    try {
        gB.currentTable.computerTable = null;
        gB.currentTable.resultTable = null;
//        gB.currentTable.transfersTable = null;
        gB.currentTable.messageTable = null;
        gB.currentTable.historyTable = null;
        gB.currentTable.noticesTable = null;
        gB.currentTable.projectTable = null;

        const ProcessTransfers = require('./transfers/process_transfers')
        const pt = new ProcessTransfers(); 
        var cTable =  pt.process(gB.connections,sort);
        gB.currentTable.name = btC.TAB_TRANSFERS;
        if (gSwitchedTabCnt-- >0)
        {
            var header = btTableTransfers.tableHeader(gB, gSidebar);
            gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);
            gB.currentTable.transfersHeaderHtml = header;
        }
        gB.currentTable.table = btTableTransfers;    
        gB.currentTable.transfersTable = cTable;
        tableReady("", gVersionS,btTableTransfers.table(gB,cTable))
        cTable = null;
    } catch (error) {
        logging.logError('Connections,processTransfers', error);      
    }     
}

function processMessages(sort)
{
    try{
        gB.currentTable.computerTable = null;
        gB.currentTable.resultTable = null;
        gB.currentTable.transfersTable = null;
//        gB.currentTable.messageTable = null;
        gB.currentTable.historyTable = null;
        gB.currentTable.noticesTable = null;
        gB.currentTable.projectTable = null;


        gB.currentTable.name = btC.TAB_MESSAGES;
        gB.currentTable.table = btTableMessages;

        if (gSwitchedTabCnt-- >0)
        {
            var header = btTableMessages.tableHeader(gB,gSidebar);
            gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);
            gB.currentTable.messagesHeaderHtml = header;
        }

        for (var i=0; i< gB.connections.length;i++)
        {
            let con = gB.connections[i];
            
            if (con.sidebar || con.sidebarGrp)
            {         
                const ProcessMessages = require('./messages/process_messages')
                let pm = new ProcessMessages(); 
                let cTable =  pm.process(con,sort);           
                gB.currentTable.messageTable = cTable;
                tableReady("", gVersionS, btTableMessages.table(gB, cTable))
                cTable = null;
                pm = null;
                break;
            }
        }
    } catch (error) {
        logging.logError('Connections,processMessages', error);        
    }     
}

function processHistory(sort)
{
    try {
        gB.currentTable.computerTable = null;
        gB.currentTable.resultTable = null;
        gB.currentTable.transfersTable = null;
        gB.currentTable.messageTable = null;
 //       gB.currentTable.historyTable = null;
        gB.currentTable.noticesTable = null;
        gB.currentTable.projectTable = null;

        if ( gB.settings.historyRefreshRate > 0)
        {
            const ProcessHistory = require('./history/process_history')
            let ph = new ProcessHistory(); 
            let ret =  ph.process(gB.connections,sort);
            let status = btC.TL.FOOTER.FTR_TASKS_HISTORY + " " + ret.resultCount;
            gB.currentTable.name = btC.TAB_HISTORY;
            if (gSwitchedTabCnt-- >0)
            {
                var header = btTableHistory.tableHeader(gB, gSidebar);
                gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);
                gB.currentTable.historyHeaderHtml = header;
            }

            gB.currentTable.table = btTableHistory;    
            gB.currentTable.historyTable = ret.cTable;
            tableReady(status, gVersionS, btTableHistory.table(gB,ret.cTable))
            ph = null;
            ret.cTable = null;
        }
        else
        {
            tableReady("", gVersionS, '<br><br><br><div style="color:red;"><b>' + btC.TL.TAB_MSG.TM_HISTORY_DISABLED1 + '</b></div> ' + btC.TL.TAB_MSG.TM_HISTORY_DISABLED2);
        }
    } catch (error) {
        logging.logError('Connections,processHistory', error);      
    }     
}

function processNotices()
{
    try {
        gB.currentTable.computerTable = null;
        gB.currentTable.resultTable = null;
        gB.currentTable.transfersTable = null;
        gB.currentTable.messageTable = null;
        gB.currentTable.historyTable = null;
 //       gB.currentTable.noticesTable = null;
        gB.currentTable.projectTable = null;

        const ProcessNotices = require('./notices/process_notices')
        let pn = new ProcessNotices(); 
        let cTable =  pn.process(gB.connections, btNotices.read());
        gB.currentTable.name = btC.TAB_NOTICES;
        gB.currentTable.table = btTableNotices;    
        gB.currentTable.noticesTable = cTable;
        let table = btTableNotices.table(gB,cTable);
        gB.mainWindow.webContents.send('notices', table) 
        toolbar.show(gB, gB.editComputers);
        gBusy = false;                  
        pn = null;
        cTable = null;
    } catch (error) {
        logging.logError('Connections,processNotices', error);      
    }     
}

function tableReady(status, gVersionS,table)
{
    gB.mainWindow.webContents.send('table_data', table, status) 
    toolbar.show(gB, gB.editComputers);
    gBusy = false;  
}

// quickly updates the data from the latest recording.
function quickLoad(bHeader = true)
{
    try {
        var header = "";
        var tableString = "";
        switch (gB.selectedTab)
        {
            case btC.TAB_COMPUTERS:
                header =  gB.currentTable.computersHeaderHtml;
                if (functions.isDefined(gB.currentTable.computerTable))
                {
                    tableString = btTableComputers.table(gB,gB.currentTable.computerTable);
                }
            break;        
            case btC.TAB_PROJECTS:
                header =  gB.currentTable.projectsHeaderHtml;                
                if (functions.isDefined(gB.currentTable.projectTable))
                {                
                    tableString = btTableProjects.table(gB, gB.currentTable.projectTable);
                }
            break;        
            case btC.TAB_TASKS:
                header =  gB.currentTable.resultsHeaderHtml;    
                if (functions.isDefined(gB.currentTable.resultTable))
                {                               
                    tableString = btTableResults.table(gB, gB.currentTable.resultTable);
                }
            break;
            case btC.TAB_TRANSFERS:
                header =  gB.currentTable.transfersHeaderHtml;    
                if (functions.isDefined(gB.currentTable.transfersTable))
                {                               
                    tableString = btTableTransfers.table(gB, gB.currentTable.transfersTable);
                }
            break;            
            case btC.TAB_MESSAGES:
                header =  gB.currentTable.messagesHeaderHtml; 
                if (functions.isDefined(gB.currentTable.messageTable))
                {                                
                    tableString = btTableMessages.table(gB, gB.currentTable.messageTable);
                }
            break;  
            case btC.TAB_HISTORY:
                header =  gB.currentTable.historyHeaderHtml; 
                if (functions.isDefined(gB.currentTable.historyTable))
                {                                
                    tableString = btTableHistory.table(gB, gB.currentTable.historyTable);
                }
            break;                    
        }
        if (bHeader) gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);

        gB.mainWindow.webContents.send('table_data', tableString); 
    } catch (error) {
        logging.logError('Connections,quickLoad', error);            
    } 
}

function connectionsReady()
{
    try {
        for (var i=0; i< gB.connections.length;i++)
        {
            if (gB.connections[i].mode === "start")
            {
                if (gB.connections[i].auth)   // only wait for computers that are connected
                {
                    return false;
                }
            }
        }
        return true;
    } catch (error) {
        logging.logError('Connections,connectionsReady', error);        
        return false;
    }    
}

function busyConnectionsReady()
{
    try {
        for (var i=0; i< gB.connections.length;i++)
        {
            let con = gB.connections[i];
            if (con.mode === "start")
            {
                if (con.auth) 
                {
                    con.auth = false; // busy timeout = lost connected
                    con.lostConnection = true;
                    logging.log(btC.TL.MSG_GENERAL.MSG_COMPUTER_LOST + " " + con.ip + ", " + con.computerName); 
                }
            }
        }
    } catch (error) {
        logging.logError('Connections,busyConnectionsReady', error);        
        return false;
    }    
}

function connectionsFetchMode(fetchMode)
{
    try {
        for (var i=0; i< gB.connections.length;i++)
        {
            if (gB.connections[i].fetchMode !== fetchMode)
            {
                return false;        
            }
        }
        return true;
    } catch (error) {
        logging.logError('Connections,connectionsNormal', error);        
        return false;
    }    
}

function needState()
{
    for (var i=0; i< gB.connections.length;i++)
    {
        let con = gB.connections[i];
        if (con.check == '0') continue;
        if (con.needState === true || con.state == null)
        {
            if (con.auth) 
            {
                return true;
            }
        }
    }
    return false;
}

// Only tasks/results have filters
function clickFilter(val)
{
    for (var i=0;i< gB.filterExclude.length;i++)
    {
        if ( gB.filterExclude[i] == val)
        {
            gB.filterExclude.splice(i, 1);
            return;
        }
    }
    gB.filterExclude.push(val);
}

function updateSideBar()
{
    sidebarComputers.setStatus(gB);
    sidebarComputers.addProjects(gB);
    sidebarComputers.build(gB)    
}

function btTimer() { 
    try {
        let status = "";
        if (gBusy)
        {          
            if (!connectionsReady())
            {
                gB.mainWindow.webContents.send('set_status', btC.TL.FOOTER.FTR_BUSY);  
                if (gBusyCnt++ < gB.settings.socketTimeout*5)   // 0.2 seconds interval
                {
                    return;
                }
                logging.logDebug("btTimer,gBusy, timeout");
                busyConnectionsReady();  
                gBusyCnt = 0;              
            }

            if (gB.fetchMode === MODE_RULES)
            {
                connectionsShadow.flushSendArray();
                gClassRulesProcess.connectionsCheck(gB)
            }

            // gBusy set false in process
            // gBusyCnt = 0; 
            if (connectionsFetchMode(MODE_NORMAL))  // reject from state, history, rules fetch.
            {
                process();
                updateSideBar();
            }          
        }

        gB.fetchMode = MODE_NORMAL;

        // State
        let current = new Date().getTime();
        let diff= gB.nextStateFetchTime - current;
        if (diff < 0)     
        {              
            gB.nextStateFetchTime = current + INTERVAL_STATE;                        
            if (needState())
            {
                gB.mainWindow.webContents.send('set_status', btC.TL.FOOTER.FTR_STATE); 
                gB.fetchMode = MODE_STATE;
                gBusyCnt = 0;
                gBusy = true;                
                connectAllState();               
                return;
            }
        }

        // History
        if ( gB.settings.historyRefreshRate > 0)    // 0 is disabled
        {
            diff= gB.nextHistoryFetchTime - current;
            if (diff < 0)
            {
                gB.nextHistoryFetchTime = current + (gB.settings.historyRefreshRate*1000);
                switch (gB.fetchMode)
                {
                    case MODE_NORMAL:
                        gB.mainWindow.webContents.send('set_status', btC.TL.FOOTER.FTR_HISTORY); 
                        gBusyCnt = 0;
                        gBusy = true;
                        gB.fetchMode = MODE_HISTORY;
                        connectAllAll(MODE_HISTORY);
                        return;
                }                
            }
        }

        // Rules
        if (gB.rules.list.length > 0)
        {
            diff= gB.nextRulesFetchTime - current;
            if (diff < 0)
            {
                gB.nextRulesFetchTime = current + INTERVAL_RULES;
                switch (gB.fetchMode)
                {
                    case MODE_NORMAL:
                        gB.mainWindow.webContents.send('set_status', btC.TL.FOOTER.FTR_RULES); 
                        gBusyCnt = 0;
                        gBusy = true;
                        gB.fetchMode = MODE_RULES;                    
                        connectRules(MODE_RULES); 
                        return;
                }                
            }
        }

        connectionsShadow.flushSendArray();

        let restartTime = false
        if (gB.settings.restartTimeCheck == true)   // might be a string so use ==
        {
            let currentDate = new Date();
            let minutes = currentDate.getMinutes();
            if (gB.settings.restartTimeMinutes == minutes)
            {                    
                let hours = currentDate.getHours();
                if (gB.settings.restartTimeHours == hours)
                {                
                    restartTime = true;
                    if (gRestartAllowed)
                    {                  
                        gRestartAllowed = false;  
                        app.relaunch();
                        app.exit();
                    }
                }
            }
        }
        if (!restartTime)
        {
            gRestartAllowed = true;
        }

        if (gPauze)
        {            

            if (gB.mainWindow.isVisible())  // once in a while gPause is true while the window is visible.
            {
                gPauze = false;            
            }
            else
            {
                /*
                if (gB.fetchMode == MODE_NORMAL)
                {
                    for (var i=0;i< gB.connections.length;i++)
                    {
                        if (gB.connections[i].suspendCheckpoint !== void 0)
                        {

                        }
                    }
                }
                */
                return;
            }
        }        

        // refresh everthing except history and state
        diff = gB.nextRefresh - current;
        if (gIntervalFastCnt === 0 )
        {
            diff = -1;
        }        
        if (diff < 0)
        {            
            if (gIntervalFastCnt < 3)
            {
                gIntervalFastCnt++;                
                gB.nextRefresh = current + 500; 
            }
            else
            {
                if (gB.selectedTab === btC.TAB_HISTORY)
                {
                    gB.nextRefresh = current + (gB.settings.historyRefreshRate*1000);
                }
                else
                {
                    gB.nextRefresh = current + gB.settings.refreshRate*1000;
                }
            }
            gBusyCnt = 0;
            gBusy = true; 
            connectAll();
        }

        diff /= 400;    // 200 = 0.2 second
        let dots = "───────────────".substring(0,diff);    // .2 second
        let interval = parseInt(diff/2.5);
        if (interval < 0) interval = 0;
        status =  (interval+1) + " " + dots;
        gB.mainWindow.webContents.send('set_status', status); 
        
    } catch (error) {
        logging.logError('Connections,btTimer', error);
    }     
  }
