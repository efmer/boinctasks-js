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

const Functions = require('./functions/functions');
const functions = new Functions();
const Logging = require('./functions/logging');
const logging = new Logging();

//const { get, data } = require('jquery');

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

const ScanComputers = require('./computers/scan');
const scanComputers = new ScanComputers();

const AddProject = require('./misc/add_project');
let addProject = new AddProject;

const SettingsColor = require('./settings/colors');
const settingsColor = new SettingsColor();

const SettingsBt = require('./settings/settings_bt');
const settingsBt = new SettingsBt();

const SettingsAllow = require('./settings/settings_allow');
const settingsAllow = new SettingsAllow();

const SettingsBoinc = require('./settings/settings_boinc');
const settingsBoinc = new SettingsBoinc();

const StatisticsBoinc = require('./settings/statistics_boinc');
const statisticsBoinc = new StatisticsBoinc();

const RowSelect = require('./misc/row_select');
const rowSelect = new RowSelect();

const SettingsColumnOrder = require('./settings/settings_column_order');
const settingsColumnOrder = new SettingsColumnOrder();

const BtNotices = require('./notices/bt_notices');
const btNotices = new BtNotices();

const ConnectionsShadow = require('./misc/connections_shadow');
const connectionsShadow = new ConnectionsShadow();

const btConstants = require('./functions/btconstants');

const MODE_NORMAL = 0;      // normal mode
const MODE_STATE = 1;       // fetching the state
const MODE_RESULTS = 2;
const MODE_HISTORY = 3;     // fetching old results

const INTERVAL_STATE_FIRST = 2000; 
const INTERVAL_STATE = 2000; 
const INTERVAL_HISTORY_FIRST = 3000; 
const INTERVAL_REFRESH_FIRST = 1000;

// must be indentical in renderer.js


gB = new Object();
gB.selectedTab = btConstants.TAB_TASKS;
gB.headerAction = btConstants.HEADER_NORMAL;
gB.currentTable = null;
gB.connections = [];
gB.connectionsShadow = [];
gB.sortComputers = null;
gB.sortProjects = null;
gB.sortResults = null;
gB.sortTransfers = null;
gB.sortMessages = null;
gB.sortHistory = null;
gB.filterExclude = [];
gB.readyToReport = 0;
gB.fetchMode = MODE_NORMAL;
gB.nextHistoryFetchTime = new Date().getTime() + INTERVAL_HISTORY_FIRST;
gB.nextStateFetchTime = new Date().getTime() + INTERVAL_STATE_FIRST;
gB.nextRefresh = new Date().getTime() + INTERVAL_REFRESH_FIRST;

gB.editComputers = false;
gB.editComputersShow = false;

gTimer = null;
gBusyCnt = 0;
gBusy = true;
gPauze = false;
gIntervalTime = 9; // 0.2 sec
gIntervalFastCnt = 0;   // fast after startup and after a tab switch

gSwitchedTabCnt = 2;


//gMainWindow = null;


gSidebar = false;

const version = btConstants.VERSION.toFixed(2)
const versionS = "V: " + version;

class Connections{
    init()
    {
        gB.settings = settingsBt.get();
        return gB.settings;
    }

    start(mainWindow, menu)
    {
        gB.mainWindow = mainWindow;
        gB.menu = menu;
        rowSelect.init(gB);
        btNotices.init();
        startConnections();
    }

    clickHeader(id, shift, alt,ctrl)
    {
        try {
            if (gB.editComputers) return;
            if (gB.headerAction === btConstants.HEADER_RESIZE)
            {
                return;
            }
    
            clickHeaderProcess(id, shift, alt,ctrl);            
        } catch (error) {
            logging.logError('Connections,clickHeader', error);             
        }
    }

    click(id,shift,alt,ctrl)
    {
        try {
            if (gB.editComputers) return;
            let idA = id.split(btConstants.SEPERATOR_ITEM);
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

    headerWidth(type, id, data, total)
    {
        btHeader.updateWidth(gB,type, id, data, total);
        gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction)  // update header
    }

    setHeaderWidth(set)
    {
        if (set)
        {
            gB.headerAction = btConstants.HEADER_RESIZE;
            gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction)  // update header                
        }
        else
        {
            btHeader.getWidth(gB);   // table header px -> % 
            gB.headerAction = btConstants.HEADER_NORMAL;
            gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction)  // update header          
        }
    }

    setColumnOrder()
    {
        settingsColumnOrder.start(gB);
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
                gB.mainWindow.webContents.send('set_tab', btConstants.TAB_COMPUTERS);            
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
        sidebarComputers.click(gB.mainWindow, gB.connections, computer,ctrl)
    }

    requestTab(renderer)
    {
        renderer.reply('set_tab', gB.selectedTab)
    }

    computerEdit()
    {      
        this.select(btConstants.TAB_COMPUTERS);        
        gB.editComputers = true;
        gB.editComputersShow = false;
        this.select(btConstants.TAB_COMPUTERS); 
    }

    computerAdd()
    {
        if (gB.editComputers === true) return;        
        let con = newCon();
        gB.connections.push(con); 
        this.select(btConstants.TAB_COMPUTERS);                
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

    scanComputersAdd(toAdd, port, password)
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
                        con.check = "1";
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
                gB.mainWindow.webContents.send('set_tab', btConstants.TAB_COMPUTERS);                 
                this.select(btConstants.TAB_COMPUTERS);
                checkComputers(gB.connections);
                writeComputers(gB.connections);
                startConnections()                
            }
            else
            {
                logging.logDebug("0 added, nothing new found");                
            }
            scanComputers.stopScan();         
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
    
    addProject(window, type, data)
    {
        addProject.process(window,gB.connections, type, data);
    }

    color(type,data1, data2)
    {
        settingsColor.set(gotColorsCallback,type,data1, data2);
    }

    settingsStart()
    {
        settingsBt.start(gB.settings);
    }

    settingsSet(settings)
    {
        settingsBt.set(settings);       // write
        gB.settings = settingsBt.get(); // get and check if valid.
        settingsBt.send();   
        
        return gB.settings;
        setCss(settingsBt.get())

    }
    boincAllow(type,combined)
    {
        settingsAllow.allow(type,gB,combined,boincAllowCallback);
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
        settingsBoinc.settingsBoinc(type,gB,settings);
    }
    boincStatistics(type,data)
    {
        statisticsBoinc.start(type,gB,data);
    }

    colomnOrder(type,data)
    {
        settingsColumnOrder.apply(type,gB,data);
        quickLoad(false);
        gB.mainWindow.webContents.send('table_data_header', gB.currentTable.table.tableHeader(gB, gSidebar),gB.currentTable.name, gB.headerAction);        
    }
}

module.exports = Connections;

function clickHeaderProcess(id, shift, alt,ctrl)
{
    var sort;
    switch (gB.currentTable.name)
    {
        case btConstants.TAB_COMPUTERS:
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
        break;            
        case btConstants.TAB_PROJECTS:
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
        case btConstants.TAB_TASKS:
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
        case btConstants.TAB_TRANSFERS:
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
        case btConstants.TAB_MESSAGES:
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
        case btConstants.TAB_HISTORY:
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
                    let selId = con.ip + btConstants.SEPERATOR_SELECT + con.computerName;              
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
    settingsAllow.allow("menu",gB);
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
    logging.setVersion(versionS);
    getComputers();
    getSorting();
    btHeader.getWidth(gB);
    gB.currentTable = new Object();
    gB.currentTable.name = "";
    gB.currentTable.table = null;
    gB.currentTable.resultTable = null;
    
    gB.editComputers = false;
    gB.editComputersShow = false;

    gB.color = settingsColor.get();
    gB.order = settingsColumnOrder.get();

    startTimers();

    var txt = "";
    if (!functions.isDefined(gB.connections)) txt += "The list is empty, no computers found, STOP";
    else
    {
        txt += "Computers: " + gB.connections.length;
    }
    logging.log(txt);
    sidebarComputers.build(gB.mainWindow, gB.connections)
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
            con.mode = "inactive";
            if (con.check == '0') continue; // disabled

            if (gB.selectedTab == btConstants.TAB_MESSAGES)
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
                logging.logDebug("Read state: " + con.computerName);
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

/*
function testResults(con)
{
    const Messages = require('./messages/messages');
    const messages = new Messages();
    messages.getMessages(con)
}
*/

function connectSingle(con)
{
    if ((gB.selectedTab != btConstants.TAB_COMPUTERS) && (con.check == '0'))
    {
        con.mode = "inactive";
        return;
    }

    con.mode = "start";
    con.selected = gB.selectedTab;
    if (!con.auth)
    {
        // we must create a socket for every connection
        const BtSocket  = require('./misc/socket');
        const btSocket = new BtSocket();
        if(con.clientClass == null)
        {
            con.clientClass = btSocket;
        }
        con.clientClass.socket(con);

        const Authenticate = require('./misc/authenticate');
        const athenticate = new Authenticate();
        con.client_callback = connectAuth;        
        athenticate.authorize(con);
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
            if (con.ip.toLowerCase() == "localhost")
            {
                if (con.passWord == "")
                {
                    con.passWord = boinc.getPassword().toString()
                }
            }
            con.group = "";
            if (functions.isDefined(computer.id_group))
            {
                con.group = decodeURI(computer.id_group.toString());            
            }

            history.read(con);

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
    var con = new Object();
    con.computerName = "";
    con.group = "";
    con.check = "0";
    con.ip = "";
    con.port = 31416;
    con.passWord = "";
    con.client_socket = null;
    con.auth = false;
    con.authTimeout = 0;
    con.lostConnection = false;
    con.isShadow = false;
    con.error = '';
    con.boinc = ''; 
    con.platform = '';

    con.sidebarGrp = true;
    con.mode = '';
    con.state = null;
    con.needState = true;
    con.from = -1;

    con.ccstatus = null;            
    con.computer = null;
    con.results = null;    
    con.transfers = null;
    con.history = null;     
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
            const History = require('./history/history');
            const history = new History(); 
            history.getHistory(con,gB.settings)            
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
            case btConstants.TAB_COMPUTERS:
                const Computers = require('./computers/computers');
                const computers = new Computers(); 
                computers.getComputers(con)
            break;        
            case btConstants.TAB_PROJECTS:
                const Projects = require('./projects/projects');
                const projects = new Projects(); 
                projects.getProjects(con)
            break;        
            case btConstants.TAB_TASKS:
                const CcStatus = require('./misc/cc_status');
                const ccStatus = new CcStatus();
                con.client_callback = getResults;
                ccStatus.getCcStatus(con);
            break;
            case btConstants.TAB_TRANSFERS:
                const Transfers = require('./transfers/transfers');
                const transfers = new Transfers();
                transfers.getTransfers(con);
            break;            
            case btConstants.TAB_MESSAGES:
                const Messages = require('./messages/messages');
                const messages = new Messages(); 
                messages.getMessages(con)
            break;   
            case btConstants.TAB_NOTICES:
                const Notices = require('./notices/notices');
                const notices = new Notices(); 
                notices.getNotices(con)
            break;    
            case btConstants.TAB_HISTORY:
                con.mode = btConstants.TAB_HISTORY; 
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
    results.getResults(con)
}

function process()
{
    if (gB.fetchMode !== MODE_NORMAL) 
    {
        return;
    }

    switch (gB.selectedTab)
    {
        case btConstants.TAB_COMPUTERS:
            processComputers(gB.sortComputers)
        break;        
        case btConstants.TAB_PROJECTS:
            processProjects(gB.sortProjects)
        break;        
        case btConstants.TAB_TASKS:
            processResults(gB.sortResults)            
        break;
        case btConstants.TAB_TRANSFERS:
            processTransfers(gB.sortTransfers)
        break;        
        case btConstants.TAB_MESSAGES:
            processMessages(gB.sortMessages)
        break; 
        case btConstants.TAB_NOTICES:
            processNotices()
        break; 
        case btConstants.TAB_HISTORY:
            processHistory(gB.sortHistory)
        break;                        
    }
}

function processComputers(sort)
{    
    try {
        if (gB.editComputers && gB.editComputersShow) return;
 //       if (gB.connections[0].selected != "computers") return;

        const ProcessComputers = require('./computers/proces_computers')
        const pc = new ProcessComputers(); 
        var cTable =  pc.process(gB.connections,sort);    
        if (cTable.length == 0) return;
        gB.currentTable.name = btConstants.TAB_COMPUTERS;        
        if (gSwitchedTabCnt-- >0)
        {
            var header = btTableComputers.tableHeader(gB,gSidebar);
            gB.mainWindow.webContents.send('table_data_header', header,  gB.currentTable.name, gB.headerAction);
            gB.currentTable.computersHeaderHtml = header;
        }
        gB.currentTable.table = btTableComputers;
        gB.currentTable.computerTable = cTable;
        tableReady("", versionS, btTableComputers.table(gB,cTable));   
        gB.editComputersShow = true;
    } catch (error) {
        logging.logError('Connections,processComputers', error);        
    }    
}

function processProjects(sort)
{
    try{
        const ProcessProjects = require('./projects/process_projects')
        const pp = new ProcessProjects(); 
        var cTable =  pp.process(gB.connections,sort);
        gB.currentTable.name = btConstants.TAB_PROJECTS;
        if (gSwitchedTabCnt-- >0)
        {
            var header = btTableProjects.tableHeader(gB,gSidebar);
            gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);
            gB.currentTable.projectsHeaderHtml = header;
        }
        gB.currentTable.table = btTableProjects;    
        gB.currentTable.projectTable = cTable;
        tableReady("", versionS, btTableProjects.table(gB, cTable))
    } catch (error) {
        logging.logError('Connections,processProjects', error);        
    }     
}

function processResults(sort)
{
    try {
        const ProcessResults = require('./results/process_results')
        const pr = new ProcessResults(); 
        let ret =  pr.process(gB.connections, gB.filterExclude,sort);
        gB.readyToReport = pr.readyToReport();
        let status = "Tasks: " + ret.resultCount;
        gB.currentTable.name = btConstants.TAB_TASKS;
        if (gSwitchedTabCnt-- >0)
        {
            var header = btTableResults.tableHeader(gB, gSidebar);
            gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);
            gB.currentTable.resultsHeaderHtml = header;
        }

        gB.currentTable.table = btTableResults;    
        gB.currentTable.resultTable = ret.cTable;
        tableReady(status, versionS, btTableResults.table(gB,ret.cTable))
    } catch (error) {
        logging.logError('Connections,processResults', error);      
    }     
}

function processTransfers(sort)
{
    try {
        const ProcessTransfers = require('./transfers/process_transfers')
        const pt = new ProcessTransfers(); 
        var cTable =  pt.process(gB.connections,sort);
        gB.currentTable.name = btConstants.TAB_TRANSFERS;
        if (gSwitchedTabCnt-- >0)
        {
            var header = btTableTransfers.tableHeader(gB, gSidebar);
            gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);
            gB.currentTable.transfersHeaderHtml = header;
        }
        gB.currentTable.table = btTableTransfers;    
        gB.currentTable.transfersTable = cTable;
        tableReady("", versionS,btTableTransfers.table(gB,cTable))
    } catch (error) {
        logging.logError('Connections,processTransfers', error);      
    }     
}

function processMessages(sort)
{
    try{
        gB.currentTable.name = btConstants.TAB_MESSAGES;
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
                const pm = new ProcessMessages(); 
                var cTable =  pm.process(con,sort);           
                gB.currentTable.messageTable = cTable;
                tableReady("", versionS, btTableMessages.table(gB, cTable))
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
        if ( gB.settings.historyRefreshRate > 0)
        {
            const ProcessHistory = require('./history/process_history')
            const ph = new ProcessHistory(); 
            let ret =  ph.process(gB.connections,sort);
            let status = "H Tasks: " + ret.resultCount;
            gB.currentTable.name = btConstants.TAB_HISTORY;
            if (gSwitchedTabCnt-- >0)
            {
                var header = btTableHistory.tableHeader(gB, gSidebar);
                gB.mainWindow.webContents.send('table_data_header', header, gB.currentTable.name, gB.headerAction);
                gB.currentTable.historyHeaderHtml = header;
            }

            gB.currentTable.table = btTableHistory;    
            gB.currentTable.historyTable = ret.cTable;
            tableReady(status, versionS, btTableHistory.table(gB,ret.cTable))
        }
        else
        {
            tableReady("", versionS, '<br><br><br><div style="color:red;"><b>Disabled</b></div> Extra->BoincTasks settings to enable');
        }
    } catch (error) {
        logging.logError('Connections,processHistory', error);      
    }     
}

function processNotices(sort)
{
    try {
        const ProcessNotices = require('./notices/process_notices')
        const pn = new ProcessNotices(); 
        var cTable =  pn.process(gB.connections, btNotices.read());
        gB.currentTable.name = btConstants.TAB_NOTICES;
        gB.currentTable.table = btTableNotices;    
        gB.currentTable.noticesTable = cTable;
        let table = btTableNotices.table(cTable);
        gB.mainWindow.webContents.send('notices', table) 
        toolbar.show(gB, gB.editComputers);
        gBusy = false;                  
    } catch (error) {
        logging.logError('Connections,processNotices', error);      
    }     
}

function tableReady(status, versionS,table)
{
    gB.mainWindow.webContents.send('table_data', table, status, versionS) 
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
            case btConstants.TAB_COMPUTERS:
                header =  gB.currentTable.computersHeaderHtml;
                if (functions.isDefined(gB.currentTable.computerTable))
                {
                    tableString = btTableComputers.table(gB,gB.currentTable.computerTable);
                }
            break;        
            case btConstants.TAB_PROJECTS:
                header =  gB.currentTable.projectsHeaderHtml;                
                if (functions.isDefined(gB.currentTable.projectTable))
                {                
                    tableString = btTableProjects.table(gB, gB.currentTable.projectTable);
                }
            break;        
            case btConstants.TAB_TASKS:
                header =  gB.currentTable.resultsHeaderHtml;    
                if (functions.isDefined(gB.currentTable.resultTable))
                {                               
                    tableString = btTableResults.table(gB, gB.currentTable.resultTable);
                }
            break;
            case btConstants.TAB_TRANSFERS:
                header =  gB.currentTable.transfersHeaderHtml;    
                if (functions.isDefined(gB.currentTable.transfersTable))
                {                               
                    tableString = btTableTransfers.table(gB, gB.currentTable.transfersTable);
                }
            break;            
            case btConstants.TAB_MESSAGES:
                header =  gB.currentTable.messagesHeaderHtml; 
                if (functions.isDefined(gB.currentTable.messageTable))
                {                                
                    tableString = btTableMessages.table(gB, gB.currentTable.messageTable);
                }
            break;  
            case btConstants.TAB_HISTORY:
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
                    logging.log("Lost connection (busy): " + con.ip + ", " + con.computerName); 
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

// Only tasks/results hav filters
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
    sidebarComputers.setStatus(gB.mainWindow,gB.connections);
}

function btTimer() { 
    try {
        let status = "";
        if (gBusy)
        {          
            if (!connectionsReady())
            {
                gB.mainWindow.webContents.send('set_status', "Busy");  
                if (gBusyCnt++ < gB.settings.socketTimeout*5)   // 0.2 seconds interval
                {
                    return;
                }
                logging.logDebug("btTimer,gBusy, timeout");
                busyConnectionsReady();  
                gBusyCnt = 0;              
            }

            // gBusy set false in process
            // gBusyCnt = 0; 
            if (connectionsFetchMode(MODE_NORMAL))  // reject from state and history fetch.
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
                gB.mainWindow.webContents.send('set_status', "Get state"); 
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
                        gB.mainWindow.webContents.send('set_status', "Get History"); 
                        gBusyCnt = 0;
                        gBusy = true;
                        gB.fetchMode = MODE_HISTORY;          
                        connectAllAll(MODE_HISTORY);                     
                        return;
                }                
            }
        }

        if (gPauze)
        {
            if (gB.mainWindow.isVisible())  // once in a while gPause is true while the windoes is visible.
            {
                gPauze = false;
            }
            else
            {
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
                if (gB.selectedTab === btConstants.TAB_HISTORY)
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


        let dots = "...............................".substr(0,diff/200);    // 30*0.2
        if (diff > 6000)
        {
            let interval = parseInt(diff/1000);
            if (interval < 0) interval = 0;
            status = interval + dots;                
        }
        else
        {
            status = dots;
        }
        gB.mainWindow.webContents.send('set_status', status); 
        
    } catch (error) {
        logging.logError('Connections,btTimer', error);
    }     
  }
