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

// list must be identical in renderer_rules_list
module.exports = {
    RULE_TYPE_TEXT                   : 0,
    RULE_TYPE_TIME                   : 1,

    RULE_ELAPSED_TIME                : "Elapsed Time",
    RULE_ELAPSED_TIME_NR             : 0,
    RULE_ELAPSED_TIME_DELTA          : "Δ Elapsed Time",
    RULE_ELAPSED_TIME_DELTA_NR       : 1,    
    RULE_CPU_PERC                    : "CPU %",
    RULE_CPU_PERC_NR                 : 2,
    RULE_PROGRESS_PERC               : "Progress %",
    RULE_PROGRESS_PERC_NR            : 3,
    RULE_TIME_LEFT                   : "Time Left",
    RULE_TIME_LEFT_NR                : 4,
    RULE_USE                         : "Use",
    RULE_USE_NR                      : 5,
    RULE_TIME                        : "Time",
    RULE_TIME_NR                     : 6,
    RULE_CONNECTION                  : "Connection",
    RULE_CONNECTION_NR               : 7,
    RULE_DEADLINE                    : "Deadline",
    RULE_DEADLINE_NR                 : 8,

    RULE_ACTION_NO                   : "No action",
    RULE_ACTION_NO_NR                : -1,    
    RULE_ACTION_ALLOW_WORK           : "Resume work fetch",
    RULE_ACTION_ALLOW_WORK_NR        : 0,    
    RULE_ACTION_NO_WORK              : "Suspend work fetch",
    RULE_ACTION_NO_WORK_NR           : 1,
    RULE_ACTION_RESUME_NETWORK       : "Resume network",
    RULE_ACTION_RESUME_NETWORK_NR    : 2,    
    RULE_ACTION_NO_NETWORK      	 : "Suspend network",
    RULE_ACTION_NO_NETWORK_NR     	 : 3,    
    RULE_ACTION_ALLOW_PROJECT        : "Resume project",
    RULE_ACTION_ALLOW_PROJECT_NR     : 4,    
    RULE_ACTION_SUSPEND_PROJECT      : "Suspend project",
    RULE_ACTION_SUSPEND_PROJECT_NR   : 5,    
    RULE_ACTION_RUN_EXE              : "Run executable",
    RULE_ACTION_RUN_EXE_NR           : 6,    
    RULE_ACTION_SNOOZE               : "Snooze",
    RULE_ACTION_SNOOZE_NR            : 7,
    RULE_ACTION_SNOOZE_GPU           : "Snooze GPU",
    RULE_ACTION_SNOOZE_GPU_NR        : 8,    
    RULE_ACTION_EMAIL                : "Send email",
    RULE_ACTION_EMAIL_NR             : 9,    
    RULE_ACTION_ALERT                : "Alert on screen",
    RULE_ACTION_ALERT_NR             : 10,
    RULE_ACTION_SUSPEND_TASK         : "Suspend task",
    RULE_ACTION_SUSPEND_TASK_NR      : 11,

    RULE_STATUS_RUNNING              : "Running",
    RULE_STATUS_RUNNING_NR           : 0

}