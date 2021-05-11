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

module.exports = {
    DEBUG                       : false,

    INITIALIZING                : " Initializing .....",
    
    TAB_COMPUTERS               : "computers",
    TAB_PROJECTS                : "projects",
    TAB_TASKS                   : "tasks",
    TAB_TRANSFERS               : "transfers",
    TAB_MESSAGES                : "messages",
    TAB_HISTORY                 : "history",
    TAB_NOTICES                 : "notices",

    COMPUTERS_COLOMN_COUNT      : 10,
    COMPUTERS_GROUP             : "Group",
    COMPUTERS_IP                : "Ip",
    COMPUTERS_CPID              : "Cpid",
    COMPUTERS_PORT              : "Port",
    COMPUTERS_PASSWORD          : "Password",
    COMPUTERS_BOINC             : "BOINC",
    COMPUTERS_PLATFORM          : "Platform",    

    PROJECTS_COLOMN_COUNT       : 11,
    PROJECTS_ACCOUNT            : "Account",
    PROJECTS_TEAM               : "Team",
    PROJECTS_CREDITS            : "Credits",
    PROJECTS_CREDITS_AVG        : "Credits Avg.",
    PROJECTS_CREDITS_HOST       : "Credits Host",
    PROJECTS_CREDITS_HOST_AVG   : "Credits Host Avg.",
    PROJECTS_SHARE              : "Share",
    PROJECTS_REC                : "REC",

    TASKS_COLOMN_COUNT          : 17,
    GENERAL_COMPUTER            : "Computer",
    GENERAL_PROJECT             : "Project",
    GENERAL_APPLICATION         : "Application",
    GENERAL_NAME                : "Name",
    GENERAL_ELAPSED             : "Elapsed",
    GENERAL_CPU                 : "CPU",
    GENERAL_PROGRESS            : "Progress",
    GENERAL_STATUS              : "Status",
    TASK_TIMELEFT               : "TimeLeft",
    TASK_DEADLINE               : "Deadline",
    TASK_USE                    : "Use",
    TASK_CHECKPOINT             : "Checkpoint",
    TASK_RECEIVED               : "Received",
    TASK_MEMORYV                : "V Memory",
    TASK_MEMORY                 : "Memory",
    TASK_TEMP                   : "Temperature",
    TASK_TTHROTTLE              : "Run %",

    TRANSFERS_COLOMN_COUNT      : 8,
    TRANSFERS_FILE              : "File",
    TRANSFERS_SIZE              : "Size",
    TRANSFERS_SPEED             : "Speed",

    MESSAGES_COLUMN_COUNT       : 5,
    MESSAGES_NR                 : "Nr",
    MESSAGES_TIME               : "Time",
    MESSAGES_MESSAGE            : "Message",

    HISTORY_COLUMN_COUNT        : 8,
    HISTORY_COMPLETED           : "Completed",

    PROJECT_NO_MORE_WORK_N      : 1,
    PROJECT_RUNNING_N           : 2,

    TASK_STATUS_DOWNLOADING     : "Downloading",
    TASK_STATUS_DOWNLOADING_N   : 1,    
    TASK_STATUS_RUNNING         : "Running",
    TASK_STATUS_RUNNING_N       : 2,    
    TASK_STATUS_READY_START     : "Ready to start",
    TASK_STATUS_READY_START_N   : 3,    
    TASK_STATUS_WAITING         : "Waiting to run",
    TASK_STATUS_WAITING_N       : 4,    
    TASK_STATUS_SUSPENDED       : "Suspended",
    TASK_STATUS_SUSPENDED_N     : 5,    
    TASK_STATUS_SUSPENDED_USER  : "Suspended by user",    
    TASK_STATUS_SUSPENDED_USER_N: 6,
    TASK_STATUS_UPLOADING       : "Uploading",
    TASK_STATUS_UPLOADING_N     : 7,    
    TASK_STATUS_READY_REPORT    : "Ready to report",
    TASK_STATUS_READY_REPORT_N  : 8,
    TASK_STATUS_COMPUTATION     : "Computation error",
    TASK_STATUS_COMPUTATION_N   : 9,    
    TASK_STATUS_ABORT           : "Aborted",    
    TASK_STATUS_ABORT_N         : 10,
    
    TASK_STATUS_HP              : ",Hp",
    MENU_SIDEBAR_COMPUTERS      : "sidebar_computers",

    SEPERATOR_ITEM  	        : "¼",
    SEPERATOR_SELECT            : "½",
    SEPERATOR_FILTER            : "⅛",

    HEADER_NORMAL               : 0,
    HEADER_RESIZE               : 1,

    LOGGING_NORMAL              : 0,
    LOGGING_DEBUG               : 1,
    LOGGING_RULES               : 2,
    LOGGING_ERROR               : 3,

    EMPTY_TABLE : '<br><br><br><br><b>Empty, select connected computer(s).',
    EMPTY_MESSAGES: '<br><br><br><br><b>Empty, select a connected computer.'
}