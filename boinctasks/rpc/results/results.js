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

const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const State = require('../misc/state');
const conState = new State();
const btConstants = require('../functions/btconstants');

class ResultItems
{
    add(con, state, results)
    {      
        try 
        {
            let toReport = new Object;
            toReport.url = [] 
            toReport.count = [];
            this.filter = [];
            this.resultTable = [];
            this.resultCount = results.result.length;
            for (var i=0; i< results.result.length; i++)
            {
                var item = results.result[i];
                var version = parseInt(item.version_num) / 100;
                var wu = item.wu_name[0];
                var wuName = item.name[0];
                var app = "Initializing...";
                var project = "Initializing...";
                var projectUrl = item.project_url[0];
                if (state != null)
                {
                    app = conState.getApp(con, wu);
                    project = conState.getProject(con,projectUrl)
                }
                var versionApp = version + " " + app;

                var resultItem = new Object();

                resultItem.filtered = false;
                resultItem.computerName = con.computerName;
                resultItem.project = project;
                resultItem.projectUrl = projectUrl;
                resultItem.version = parseInt(item.version_num) / 100;
                resultItem.app = versionApp;
                resultItem.wu = wu;
                resultItem.wuName = wuName;
                var resources = item.resources;
                if (!functions.isDefined(resources)) resources = "";

                resultItem.resources = resources;

//                var elapsed = 0;

                var iState = item.state[0];                
                if (iState > 2)
                {
                     resultItem.fraction = 100;
                }
                else resultItem.fraction = 0;

                var active = item.active_task;
                var bActive = false;

                var cpuTime = item.final_cpu_time[0];
                var elapsedTime = parseFloat(item.final_elapsed_time);            

                var sState = "0";
                var aState = "0";

                resultItem.swap = 0;
                resultItem.memory = 0;
                resultItem.received = parseInt(item.received_time[0]);
                resultItem.checkpoint = 0;
                if (functions.isDefined(active))
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
                
                    bActive = true;
                }
                var cpu = 0;
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
              
                var remaining = parseInt(item.estimated_cpu_time_remaining);
                resultItem.remaining = remaining;                   
                resultItem.deadline = parseFloat(item.report_deadline);//.toString();
                var hpState = item.edf_scheduled;
                if (functions.isDefined(hpState))
                {
                     hpState = "1";
                }
                else hpState = "0";
                var gState = item.suspended_via_gui;
                if (!functions.isDefined(gState)) gState = "0";                

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
                    var bFound = false;                  
                    for (var f=0; f< this.filter.length;f++)
                    {
                        var fItem  = this.filter[f];
                        if (fItem.app === versionApp)
                        {
                            if (fItem.statusS === resultItem.statusS)
                            {
                                fItem.count++;                   
                                fItem.remaining += remaining;             
                                fItem.elapsedTime += elapsedTime;
                                if (fItem.deadline > resultItem.deadline) 
                                {
                                    fItem.deadline = resultItem.deadline;
                                }
                                fItem.resultTable.push(resultItem);
                                bFound = true;
                            }
                        }
                    }
                    if (!bFound)
                    {                        
                        var filterItem = new Object();
                        filterItem.count = 1;
                        filterItem.resultTable = [];
                        filterItem.resultTable.push(resultItem);
                        filterItem.computerName = con.computerName;
                        filterItem.project = project;
                        filterItem.projectUrl = projectUrl;
                        filterItem.app = versionApp;
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
                        continue;
                    }
                    continue
                } 
                this.resultTable.push(resultItem);
            }
            con.toReport = toReport;
            for (var f=0; f < this.filter.length;f++)
            {
                var filterItem = this.filter[f];          
                if (filterItem.count >1) 
                {
                    filterItem.wu = filterItem.count + " [Tasks]";
                }
                else
                {
                    filterItem.filtered = false;
                }
                this.resultTable.push(filterItem);
            }
            
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

class Results{
    getResults(con)
    {
        try 
        {  
            con.client_callbackI = resultData;
            con.client_completeData = "";
            functions.sendRequest(con.client_socket, "<get_results/>\n");            
        } catch (error) {
            logging.logError('Results,getResults', error);           
            this.mode = 'errorc';
            this.error = error;
        }  
    }       
}
module.exports = Results;

function resultData()
{
    try 
    {
        if (this.client_completeData.indexOf('unauthorized') >=0)
        {
            this.con.auth = false;
        }                    
        else
        {
            var results = parseResults(this.client_completeData);
            if (results == null)
            {
                this.results = null;
                this.mode = 'empty';
                return;
            }
            var resultItems = new ResultItems();
            resultItems.add(this, this.state, results)

            this.results = resultItems;  
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
    var resultReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (functions.isDefined(result))
            {
                var resultArray = result['boinc_gui_rpc_reply']['results'];
                if (functions.isDefined(resultArray))
                {
                    resultReturn = resultArray[0];
                }
            }
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
    try {
        switch (state) {
            case "0122": {
                status = btConstants.TASK_STATUS_RUNNING;                
                statusN = btConstants.TASK_STATUS_RUNNING_N;
            }
            break;
            case "0001": {
                status = btConstants.TASK_STATUS_DOWNLOADING;
                statusN = btConstants.TASK_STATUS_DOWNLOADING_N;
            }
            break;
            case "0002": {
                status = btConstants.TASK_STATUS_READY_START;
                statusN = btConstants.TASK_STATUS_READY_START_N;
            }
            break;
            case "0003": {
                status = btConstants.TASK_STATUS_COMPUTATION;
                statusN = btConstants.TASK_STATUS_COMPUTATION_N;
                bReport = true;
            }
            break;
            case "0004": {
                status = btConstants.TASK_STATUS_UPLOADING;
                statusN = btConstants.TASK_STATUS_UPLOADING_N;
            }
            break;
            case "0005": {
                status = btConstants.TASK_STATUS_READY_REPORT;
                statusN = btConstants.TASK_STATUS_READY_REPORT_N;
                bReport = true;
            }
            break;
            case "0012":
            case "0812": 
            case "0912": {
                status = btConstants.TASK_STATUS_WAITING;
                statusN = btConstants.TASK_STATUS_WAITING_N;
            }
            break;
            case "0922":
            case "0022": 
            case "1922": {
                status = btConstants.TASK_STATUS_SUSPENDED;
                statusN = btConstants.TASK_STATUS_SUSPENDED_N;
            }
            break;
            case "002":
            case "922":            
            case "012":
            case "812":
            case "1012": 
            case "0012": 
            case "1812": 
            case "0812": {
                status = btConstants.TASK_STATUS_SUSPENDED_USER;
                statusN = btConstants.TASK_STATUS_SUSPENDED_USER_N;
            }
            break;  
            case "0006": {
                status = btConstants.TASK_STATUS_ABORT;
                statusN = btConstants.TASK_STATUS_ABORT_N; 
                bReport = true;
            }                      
            break;
            default: status = "State: " + state;
        }
        resultItem.report = bReport;
        resultItem.statusI = status;                
        resultItem.statusN = statusN;         
        if (hp == '1') 
        {
            status += btConstants.TASK_STATUS_HP;
            resultItem.hp = true;
        }
        else
        {
            resultItem.hp = false;
        }

        if(ccStatus == null)
        {
            status += " ??";
            resultItem.statusS = status;            
            return;
        }
        var iSuspendReason = parseInt(ccStatus.task_suspend_reason);
        var sSuspendReason = "";

        if (iSuspendReason)
        {
            if (iSuspendReason & SUSPEND_REASON_BATTERIES)				{ sSuspendReason = "on batteries";}
            if (iSuspendReason & SUSPEND_REASON_USER_ACTIVE)			{ sSuspendReason = "user active";}
            if (iSuspendReason & SUSPEND_REASON_USER_REQ)				{ sSuspendReason = "user request";}
            if (iSuspendReason & SUSPEND_REASON_TIME_OF_DAY)			{ sSuspendReason = "time of day";}
            if (iSuspendReason & SUSPEND_REASON_BENCHMARKS)				{ sSuspendReason = "benchmarks";}
            if (iSuspendReason & SUSPEND_REASON_DISK_SIZE)				{ sSuspendReason = "disk size";}
            if (iSuspendReason & SUSPEND_REASON_CPU_THROTTLE)			{ sSuspendReason = "-";}
            if (iSuspendReason & SUSPEND_REASON_NO_RECENT_INPUT)		{ sSuspendReason = "no recent input";}
            if (iSuspendReason & SUSPEND_REASON_INITIAL_DELAY)			{ sSuspendReason = "initial";}
            if (iSuspendReason & SUSPEND_REASON_EXCLUSIVE_APP_RUNNING)	{ sSuspendReason = "exclusive app running";}
            if (iSuspendReason & SUSPEND_REASON_CPU_USAGE)				{ sSuspendReason = "cpu usage";}     
            
            if (sSuspendReason === "")
            {
                sSuspendReason = "Unknown suspend reason" + iSuspendReason;
            }
        }

        var waitingForMemory = false;
        if (item.too_large !== undefined)
        {
            waitingForMemory = true;
        }
        if (item.needs_shmem !== undefined)
        {
            waitingForMemory = true;
        }
        if (item.gpu_mem_wait !== undefined)
        {
            waitingForMemory = true;
        }    
        if (waitingForMemory)
        {
            sSuspendReason = "waiting for memory" 
        }        
        if (item.scheduler_wait)
        {
            sSuspendReason = item.scheduler_wait_reason.toString();
        }

        if (sSuspendReason == "" )
        {
            resultItem.statusS = status;            
            return;
        }
        status += " | " + sSuspendReason;            
    } catch (error) {
        logging.logError('Results,getStatus', error);    
    }    
    resultItem.statusS = status; 
}
