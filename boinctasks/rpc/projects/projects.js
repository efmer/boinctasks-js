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
const btC = require('../functions/btconstants');

const statusSuspendedGui = btC.TL.STATUS.S_PROJECT_SUSPENDED;
const statusNoMoreWork = btC.TL.STATUS.S_PROJECT_NO_NEW_WORK;
const statusInProgress = btC.TL.STATUS.S_PROJECT_IN_PROGRESS;
const statusUpdating = btC.TL.STATUS.S_PROJECT_UPDATING;
const statusReport = btC.TL.STATUS.S_PROJECT_REPORT_COMP;
const statusNeedWork = btC.TL.STATUS.S_PROJECT_FETCH;
const statusTrickle = btC.TL.STATUS.S_PROJECT_TRICKLE;
const statusUpdatingAM = btC.TL.STATUS.S_PROJECT_ACCOUNT;
const statusInitializing = btC.TL.STATUS.S_PROJECT_INIT;
const statusAttaching = btC.TL.STATUS.S_PROJECT_ATTACH;
const statusProjectReq = btC.TL.STATUS.S_PROJECT_REQ;

class ProjectItems
{
    add(con, state, projects)
    {      
        try 
        {
            this.project = projects.project;
            this.projectTable = [];

            for (var i=0; i< this.project.length; i++)
            {
                var item = this.project[i];
                var projectName = "Initializing...";
                var projectUrl = item.master_url[0];                
                if (state != null)
                {
                    projectName = conState.getProject(con,projectUrl)
                }
                var projectItem = new Object();
                projectItem.computerName = con.computerName;
                projectItem.project = projectName;
                projectItem.projectUrl = projectUrl;
                projectItem.account = item.user_name;
                projectItem.team = item.team_name;
                projectItem.credits = parseFloat(item.user_total_credit);
                projectItem.creditsAvg = parseFloat(item.user_expavg_credit);
                projectItem.creditsHost = parseFloat(item.host_total_credit);
                projectItem.creditsHostAvg = parseFloat(item.host_expavg_credit);            
                projectItem.share = parseFloat(item.resource_share);
                projectItem.rec = parseFloat(item.rec);              
                projectItem.venue = item.host_venue;
                getStatus(item, projectItem);
                this.projectTable.push(projectItem);
            }
            
        } catch (error) {
            logging.logError('ProjectItems,add', error);                  
            return null;
        }        
    }
    
    getTable()
    {
        return this.projectTable;
    }  
}

class Projects{
    getProjects(con)
    {
        try 
        {
            con.client_callbackI = projectData;
            con.client_completeData = "";            
            functions.sendRequest(con.client_socket, "<get_project_status/>");            
        } catch (error) {
            logging.logError('Projects,getProjects', error);               
            this.mode = 'errorc';
            this.error = error;
        }  
    }       
}
module.exports = Projects;

function projectData()
{
    try 
    {
        let projects = parseProjects(this.client_completeData);
        if (projects == null)
        {
            this.projects = null;
            this.mode = 'empty';
            return;
        }
        var projectItems = new ProjectItems();
        projectItems.add(this, this.state, projects)

        this.projects = projectItems;  
        this.mode = "OK";               
    } catch (error) {
        logging.logError('Projects,projectData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 

function parseProjects(xml)
{
    var projectReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, project) {
            if (functions.isDefined(project))
            {
                var projectArray = project['boinc_gui_rpc_reply']['projects'];
                if (functions.isDefined(projectArray))
                {
                    projectReturn = projectArray[0];
                    return projectReturn;
                }
            }
        });
    } catch (error) {
        logging.logError('Projects,parseProjects', error);         
    }
    return projectReturn
}

function getStatus(item, projectItem)
{
    var status = ""; 
    var statusN = -1;    
    try {
        if (functions.isDefined(item.suspended_via_gui))
        {
            status += statusSuspendedGui + " ";
        }
        else{
            statusN = btC.PROJECT_RUNNING_N;
        }

        if (functions.isDefined(item.dont_request_more_work))
        {
            status += statusNoMoreWork + " ";
            statusN = btC.PROJECT_NO_MORE_WORK_N;
        }

        if (functions.isDefined(item.scheduler_rpc_in_progress))
        {
           status += statusInProgress + " ";
        }

        if (functions.isDefined(item.min_rpc_time))
        {
            var min_rpc_time = parseInt(item.min_rpc_time[0]);
            if (min_rpc_time > 0)
            {
                var deferred  = functions.getFormattedTimeDiff(min_rpc_time,true);
                if (deferred != "") // can be negative...
                {
                    status += btC.TL.STATUS.S_PROJECT_DEFERRED + " " + deferred + " ";
                }
            }
        }
        
        if (functions.isDefined(item.sched_rpc_pending))
        {
            if (item.sched_rpc_pending) 
            {
                switch(parseInt(item.sched_rpc_pending))
                {
                    case 0:
                        // nothing
                    break;
                    case 1:
                        status += statusUpdating;
                    break;
                    case 2:
                        status += statusReport;
                    break;
                    case 3:
                        status += statusNeedWork;
                    break;
                    case 4:
                        status += statusTrickle;
                    break;
                    case 5:
                        if (item.attached_via_acct_mgr)
                        {
                            status += statusUpdatingAM;
                        }
                        else
                        {
                            status += statusInitializing;
                        }
                    break;
                    case 6:
                        status += statusAttaching;
                    break;
                    case 7:
                        if (item.scheduler_rpc_in_progress == 0)
                        {
                            status += statusProjectReq;
                        }
                    break;
                    default:
                        status += "?? " + item.sched_rpc_pending;

                }
            }
        }
        projectItem.statusN = statusN;
        projectItem.status = status
    } catch (error) {
        logging.logError('Projects,getStatus', error);    
    }    
}