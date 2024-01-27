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
const ConnectionsShadow = require('../misc/connections_shadow');
const connectionsShadow = new ConnectionsShadow();

let parseString = require('xml2js').parseString;

class Results{
    getResults(con)
    {
        try 
        {  
            con.client_callbackI = resultData;
            con.client_completeData = "";

            const Functions = require('../functions/functions');
            const functions = new Functions();
            functions.sendRequest(con.client_socket, "<get_results/>\n");            
        } catch (error) {
            logging.logError('Results,getResults', error);           
            this.mode = 'errorc';
            this.error = error;
        }  
    }       
}
module.exports = Results;

class ResultItems
{
    add(con, state, results)
    {      
        try 
        {
            const State = require('../misc/state');
            let conState = new State(); 

            if (con.suspendCheckpoint !== void 0)
            {
                CheckpointSuspendReset(con);
            }

            let toReport = new Object;
            toReport.url = [] 
            toReport.count = [];
            this.filter = [];
            this.filterAS = [];
            this.resultTable = [];
            if (results.result === void 0)
            {
                con.toReport = toReport;
                this.resultCount = 0;
                return null;
            }
            this.resultCount = results.result.length;
            for (let i=0; i< results.result.length; i++)
            {
                let item = results.result[i];
                let version = parseInt(item.version_num) / 100;
                let wu = item.wu_name[0];
                let wuName = item.name[0];
                let app = "Initializing...";
                let project = "Initializing...";
                let projectUrl = item.project_url[0];
                let bNonCpuIntensive = false;
                if (state != null)
                {                  
                    app = conState.getAppUf(con, wu);
                    let ret = conState.getProject(con,projectUrl)
                    project = ret.project;
                    bNonCpuIntensive = ret.non;
                    ret = null;
                }
                let versionApp = version + " " + app;
                let computer = con.computerName;
                let resultItem = new Object();

                resultItem.filtered = false;
                resultItem.computerName = computer;
                resultItem.project = project;
                resultItem.projectUrl = projectUrl;
                resultItem.bNonCpuIntensive = bNonCpuIntensive;
                resultItem.version = parseInt(item.version_num) / 100;
                resultItem.app = versionApp;
                resultItem.wu = wu;
                resultItem.wuName = wuName;
                let resources = item.resources;
                if (resources === void 0) resources = "";

                resultItem.resources = resources;

//                let elapsed = 0;

                let iState = item.state[0];
                if (iState > 2)
                {
                     resultItem.fraction = 100;
                }
                else resultItem.fraction = 0;

                let active = item.active_task;
                let bActive = false;

                let cpuTime = item.final_cpu_time[0];
                let elapsedTime = parseFloat(item.final_elapsed_time[0]);

                let sState = "0";
                let aState = "0";

                resultItem.swap = 0;
                resultItem.memory = 0;
                resultItem.received = parseInt(item.received_time[0]);
                resultItem.checkpoint = 0;
                if (active !== void 0)
                {
                    active = active[0];               
                    resultItem.fraction = parseFloat(active.fraction_done)*100;
                    cpuTime = active.current_cpu_time[0];
                    elapsedTime = parseFloat(active.elapsed_time); 
                    sState =  active.scheduler_state[0];
                    aState =  active.active_task_state[0];
                    resultItem.swap = parseFloat(active.swap_size[0]);
                    resultItem.memory = parseFloat(active.working_set_size_smoothed[0]);
                    resultItem.checkpoint = parseFloat(cpuTime-active.checkpoint_cpu_time[0]);
                    resultItem.cpuTemp = con.temp.cpu;
                    resultItem.gpuTemp = con.temp.gpu;
                    resultItem.gpuPerc = con.temp.gpuP;
                    resultItem.cpuT = con.temp.cpuT;
                    resultItem.gpuT = con.temp.gpuT;
                    bActive = true;
                }
                if (con.suspendCheckpoint !== void 0)
                {
                    CheckpointSuspend(con,resultItem,wuName,projectUrl);
                }

                let cpu = 0;
                if (cpuTime == 0 || elapsedTime == 0)
                {
                    resultItem.cpu = 0;
                }   
                else 
                {             
                    cpu = (cpuTime/elapsedTime) * 100;
                    if (cpu > 100) cpu = 100;
                    resultItem.cpu = cpu;                  
                }

                resultItem.elapsed = elapsedTime;               
              
                let remaining = parseInt(item.estimated_cpu_time_remaining);
                resultItem.remaining = remaining;                   
                resultItem.deadline = parseFloat(item.report_deadline);//.toString();
                let hpState = item.edf_scheduled;
                if (hpState !== void 0)
                {
                     hpState = "1";
                }
                else hpState = "0";
                let gState = item.suspended_via_gui;
                if (gState === void 0) gState = "0";                

                getStatus(resultItem, item, con.ccstatus, hpState, gState+aState+sState+iState);   
                if (resultItem.report)  
                {
                    let found =  toReport.url.indexOf(projectUrl)
                    if (found < 0)
                    {
                        toReport.url.push(projectUrl);
                        toReport.count.push(1);
                    }
                    else
                    {
                        toReport.count[found]++;
                    }                    
                }

                if (!bActive)
                {                    
                    let pos = this.filterAS.indexOf(computer+versionApp+resultItem.statusS)
                    if (pos >= 0)
                    {
                        let fItem  = this.filter[pos];  
                        fItem.count++;                   
                        fItem.remaining += remaining;             
                        fItem.elapsed += elapsedTime;
                        if (fItem.deadline > resultItem.deadline) 
                        {
                            fItem.deadline = resultItem.deadline;
                        }
                        fItem.resultTable.push(resultItem);                        
                    }
                    else
                    {                        
                        let filterItem = new Object();
                        filterItem.count = 1;
                        filterItem.resultTable = [];
                        filterItem.resultTable.push(resultItem);
                        filterItem.computerName = computer;
                        filterItem.project = project;
                        filterItem.projectUrl = projectUrl;
                        filterItem.app = versionApp;
                        filterItem.version = resultItem.version;
                        filterItem.remaining = resultItem.remaining;
                        filterItem.deadline = resultItem.deadline;
                        filterItem.statusS = resultItem.statusS;
                        filterItem.swap = resultItem.swap;
                        filterItem.memory = resultItem.memory;
                        filterItem.checkpoint = resultItem.checkpoint;
                        filterItem.received  = resultItem.received;
                        filterItem.elapsed = elapsedTime;
                        filterItem.fraction = resultItem.fraction;
                        filterItem.filtered = true;
                        filterItem.wu = wu;
                        filterItem.wuName = wuName;
                        filterItem.cpu = cpu;
                        filterItem.resources = resources;
                        filterItem.hp = resultItem.hp;
                        filterItem.statusI = resultItem.statusI;
                        filterItem.statusN = resultItem.statusN;
                        this.filter.push(filterItem);
                        this.filterAS.push(computer+versionApp+resultItem.statusS)
                        continue;
                    }
                    continue
                } 
                this.resultTable.push(resultItem);
            }
            con.toReport = toReport;
            for (let f=0; f < this.filter.length;f++)
            {
                let filterItem = this.filter[f];          
                if (filterItem.count >1) 
                {
                    filterItem.wu = filterItem.count + " " + btC.TL.STATUS.S_FILTER_TASKS;
                }
                else
                {
                    filterItem.filtered = false;
                }
                this.resultTable.push(filterItem);
            }
            if (con.suspendCheckpoint !== void 0)
            {
                CheckpointSuspendPresent(con);
            }
            conState = null;
            
        } catch (error) {
            logging.logError('ResultItems,add', error);            
            return null;
        }        
    }
    
    getTable()
    {
        return this.resultTable;
    }  
}

function resultData()
{
    try 
    {
        this.client_callbackI = null;
        if (this.client_completeData.indexOf('unauthorized') >=0)
        {
            this.con.auth = false;
        }                    
        else
        {
            let results = parseResults(this.client_completeData);
            this.client_completeData = "";
            if (results == null)
            {
                this.results = null;
                this.mode = 'empty';
                return;
            }
            let resultItems = new ResultItems();
            let state = this.state;
            let con = this;
            this.results = null;
            resultItems.add(con, state, results)

            this.results = resultItems;  
            resultItems = null;
            this.mode = "OK";
        }    
    } catch (error) {
        logging.logError('Results,resultData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 

function parseResults(xml)
{
    let resultReturn = null;
    try {
        //let parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (result !== void 0)
            {
                let resultArray = result['boinc_gui_rpc_reply']['results'];
                if (resultArray !== void 0)
                {
                    resultReturn = resultArray[0];
                }
            }
            xml = null;
            result = null;
            resultArray = null;
        });
        } catch (error) {
            logging.logError('Results,parseResults', error);
        }
    return resultReturn
}

const SUSPEND_REASON_BATTERIES = 1;
const SUSPEND_REASON_USER_ACTIVE = 2;
const SUSPEND_REASON_USER_REQ = 4;
const SUSPEND_REASON_TIME_OF_DAY = 8;
const SUSPEND_REASON_BENCHMARKS = 16;
const SUSPEND_REASON_DISK_SIZE = 32;
const SUSPEND_REASON_CPU_THROTTLE = 64;
const SUSPEND_REASON_NO_RECENT_INPUT = 128;
const SUSPEND_REASON_INITIAL_DELAY = 256;
const SUSPEND_REASON_EXCLUSIVE_APP_RUNNING = 512;
const SUSPEND_REASON_CPU_USAGE = 1024;
const SUSPEND_REASON_NETWORK_QUOTA_EXCEEDED = 2048;
const SUSPEND_REASON_OS = 4096;

function getStatus(resultItem, item, ccStatus, hp, state)
{
    let status = "";
    let statusN = -1;
    let bReport = false;
    let bSuspend = false;
    try {
        let iSuspendReason = false;
        if(ccStatus !== null)
        {
            iSuspendReason = parseInt(ccStatus.task_suspend_reason);
        }
        let sSuspendReason = "";

        if (resultItem.suspend)
        {
            sSuspendReason = btC.TL.SUSPEND_REASON.SR_PAUSE_CHECKPOINT;
        }

        if (iSuspendReason)
        {
            bSuspend = true;
            if (iSuspendReason & SUSPEND_REASON_BATTERIES)				{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_BATTERIES;}
            if (iSuspendReason & SUSPEND_REASON_USER_ACTIVE)			{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_USER_ACTIVE;}
            if (iSuspendReason & SUSPEND_REASON_USER_REQ)				{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_USER_REQ;}
            if (iSuspendReason & SUSPEND_REASON_TIME_OF_DAY)			{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_TIME_OF_DAY;}
            if (iSuspendReason & SUSPEND_REASON_BENCHMARKS)				{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_BENCHMARKS;}
            if (iSuspendReason & SUSPEND_REASON_DISK_SIZE)				{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_DISK_SIZE;}
            if (iSuspendReason & SUSPEND_REASON_CPU_THROTTLE)			{ sSuspendReason += "-";}
            if (iSuspendReason & SUSPEND_REASON_NO_RECENT_INPUT)		{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_NO_RECENT_INPUT;}
            if (iSuspendReason & SUSPEND_REASON_INITIAL_DELAY)			{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_INITIAL_DELAY;}
            if (iSuspendReason & SUSPEND_REASON_EXCLUSIVE_APP_RUNNING)	{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_EXCLUSIVE_APP_RUNNING;}
            if (iSuspendReason & SUSPEND_REASON_CPU_USAGE)				{ sSuspendReason += btC.TL.SUSPEND_REASON.SR_CPU_USAGE;}     
            
            if (sSuspendReason === "")
            {
                sSuspendReason += btC.TL.SUSPEND_REASON.SR_UNKNOWN + iSuspendReason;
            }
        }

        if (item.too_large !== void 0)
        {
            bSuspend = true;
            sSuspendReason += " " + btC.TL.SUSPEND_REASON.SR_MEM_TOO_LARGE;
        }
        if (item.needs_shmem !== void 0)
        {
            bSuspend = true;
            sSuspendReason += " " + btC.TL.SUSPEND_REASON.SR_MEM_NEED_SHMEM;
        }
        if (item.gpu_mem_wait !== void 0)
        {
            bSuspend = true;
            sSuspendReason += " " + btC.TL.SUSPEND_REASON.SR_MEM_GPU;
        }        
        if (item.scheduler_wait)
        {
            bSuspend = true;            
            sSuspendReason = item.scheduler_wait_reason.toString();
        }

        switch (state) {
            case "0122":
            case "122":
            case "0922":
                if (bSuspend)
                {
                    status = btC.TL.STATUS.S_TASK_SUSPENDED;
                    statusN = btC.TASK_STATUS_SUSPENDED_N;                 
                }
                else
                {
                    status = btC.TL.STATUS.S_TASK_RUNNING;
                    statusN = btC.TASK_STATUS_RUNNING_N;
                }
            break;
            case "0001":
                status = btC.TL.STATUS.S_TASK_DOWNLOADING;
                statusN = btC.TASK_STATUS_DOWNLOADING_N;            
            break;
            case "0002":
                status = btC.TL.STATUS.S_TASK_READY_START;
                statusN = btC.TASK_STATUS_READY_START_N;
            break;
            case "0003":
                status = btC.TL.STATUS.S_TASK_COMPUTATION;
                statusN = btC.TASK_STATUS_COMPUTATION_N;
                bReport = true;
            break;
            case "0004":
                status = btC.TL.STATUS.S_TASK_UPLOADING;
                statusN = btC.TASK_STATUS_UPLOADING_N;
            break;
            case "0005":               
                status = btC.TL.STATUS.S_TASK_READY_REPORT;
                statusN = btC.TASK_STATUS_READY_REPORT_N;
                bReport = true;
            break;
            case "0012":
            case "0812": 
            case "0912":
                status = btC.TL.STATUS.S_TASK_WAITING;
                statusN = btC.TASK_STATUS_WAITING_N;
            break;
            case "0022": 
            case "1922":
            case "922":
                status = btC.TL.STATUS.S_TASK_SUSPENDED;
                statusN = btC.TASK_STATUS_SUSPENDED_N;
            break;            
            case "005":
            case "002":
            case "922":
            case "912":
            case "022":
            case "012":
            case "812":
            case "1012":
            case "0012":
            case "1812":
            case "0812":
                status = btC.TL.STATUS.S_TASK_SUSPENDED_USER;
                statusN = btC.TASK_STATUS_SUSPENDED_USER_N;
            break;  
            case "0006":
                status = btC.TL.STATUS.S_TASK_ABORT;
                statusN = btC.TASK_STATUS_ABORT_N; 
                bReport = true;           
            break;
            default: status = "State: " + state;
        }
        resultItem.report = bReport;
        resultItem.statusI = status;                
        resultItem.statusN = statusN;         
        if (hp == '1') 
        {
            status += btC.TL.STATUS.S_TASK_HP;
            resultItem.hp = true;
        }
        else
        {
            resultItem.hp = false;
        }

        if (sSuspendReason == "" )
        {
            if (btC.DEBUG)
            {
                status += " | " + state;
            }
            resultItem.statusS = status;            
            return;
        }
        status += " | " + sSuspendReason;            
    } catch (error) {
        logging.logError('Results,getStatus', error);    
    }    
    if (btC.DEBUG)
    {
        status += " | " + state;
    }
    resultItem.statusS = status;
}

function CheckpointSuspend(con,resultItem,wu,url)
{
    try{
        resultItem.suspend = false;
        let checkpoint = resultItem.checkpoint;
        if (checkpoint == void 0)
        {
            return;
        }
        let sc = con.suspendCheckpoint;
        let len = sc.length
        for (let i=0;i<len;i++)
        {
            let check = sc[i];
            if (check.task == wu)
            {
                if (check.url == url)
                {
                    resultItem.suspend = true;
                    check.present = true;                
                    if (check.checkPoint == -1)
                    {
                        check.checkPoint = checkpoint
                    }
                    else
                    {
                        if (check.checkPoint > checkpoint || checkpoint < 10)
                        {
                            sendCommand(con,'suspend_result',url,wu);
                            let debugTxt = "suspend: " + url + " , " + wu + " last check: " + check.checkPoint + " check: " + checkpoint 
                            logging.logDebug("CheckpointSuspend, " + debugTxt);   

                            sc.splice(i, 1);
                            len = sc.length;
                            if (len == 0)                            
                            {
                                // no suspend at checkpoint left on the con
                                con.suspendCheckpoint = void 0;
                                return;
                            }
                            i = 0;              // restart the for loop
                        }
                        else
                        {
                            check.checkPoint = checkpoint;  
                        }
                    }
                }
            }
        }
    }
    catch (error)
    {
        logging.logError('Results,CheckpointSuspend', error);    
    }
}

function CheckpointSuspendReset(con)
{
    try{
        let sc = con.suspendCheckpoint;
        let len = sc.length
        if (len == 0)                            
        {
            con.suspendCheckpoint = void 0; 
            return;
        }    
        for (let i=0;i<len;i++)
        {
            sc[i].present = false;
        }   
    }
    catch (error)
    {
        logging.logError('Results,CheckpointSuspend0', error);    
    }
}

function CheckpointSuspendPresent(con)
{
    try{
        let sc = con.suspendCheckpoint;
        let len = sc.length 
        for (let i=0;i<len;i++)
        {
            if (sc[i].present == false)
            {
                let wu = sc.task;
                let url = sc.url;
                let debugTxt = "suspend: " + url + " , " + wu + " present == false"; 
                logging.logDebug("CheckpointSuspendPresent, " + debugTxt);   
                sendCommand(con,'suspend_result',url,wu);
                sc.splice(i, 1);
            }
        }   
    }
    catch (error)
    {
        logging.logError('Results,CheckpointSuspendPresent', error);    
    }
}

function sendCommand(con,request, url, wu)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n<name>"+ wu + "</name>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req);
    // flush in connections.js
}