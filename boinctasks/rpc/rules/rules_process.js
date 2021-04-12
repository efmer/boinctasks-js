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
const Functions = require('../functions/functions');
const functions = new Functions();
const constants = require('./rules_constants');
const State = require('../misc/state');
const conState = new State();

const ConnectionsShadow = require('../misc/connections_shadow');
const connectionsShadow = new ConnectionsShadow();

/*
con rules compiled
    rules computerList[]
    rules list[] = rule list
    rules active rulename1 wu
                           state
                           ticks number of times the rule is found.
                           data
                           timeOut last seen time
    rules active rulename2
*/

const R_STAT_ACTIVE = 1;
const R_STAT_TRIGGER = 2;
const R_SEND_TASKS = 1;
const R_SEND_PROJECTS = 2;

class RulesProcess{
  makeComputerList(gb)
  {
    makeComputerList(gb);
  }
  compileCon(con)
  {
    compileCon(con);    
  }
  getRules(con,gb)
  {
    try 
    {   
      con.client_callbackI = rulesData;
      con.client_completeData = "";
      functions.sendRequest(con.client_socket, "<get_results><active_only></active_only></get_results>"); // many machine don't support <active_only></active_only>
    } catch (error) {
      logging.logError('RulesProcess,getRules', error);               
      this.mode = 'errorc';
      this.error = error;
    }  
  }
}
module.exports = RulesProcess;

function makeComputerList(gb)
{
  try {
    gb.rules.computerList = [];
    let list = gb.rules.list;
    let connections = gb.connections;
    for (let i=0; i<list.length;i++)
    {
      let rule = list[i];
      if (!rule.enabled) continue;
      let computerName = rule.computer;
      let computerFound = "";
      logging.logRules("Found:  rule: " + rule.name + " ,computer: " + computerName + " ,project: " + rule.project + " ,app: " + rule.version + " " + rule.app);
      for (let c=0; c < connections.length;c++)
      {
        let con = connections[c];         
        if (con.check === "0") continue;
        if (con.computerName === computerName || computerName.length === 0)
        {        
          computerFound = con.computerName;
          con.rules.list.push(rule);
          let pos = gb.rules.computerList.indexOf(computerFound);
          if (pos < 0)
          {
            logging.logRules("Using: computer: " +  con.computerName);              
            gb.rules.computerList.push(computerFound);
          }
        }
      }
      if (computerFound.length <= 0)
      {
        logging.logRules(">>>>>>>> Missing Computer: " + computerName + " in rule: " + rule.name);
      }
    }
    gb.rules.compiled = true;     
  } catch (error) {
    logging.logError('RulesProcess,compileRules', error);   
  }    
}

// con.rules.active
function compileCon(con)
{
  try {
    for (let i=0; i<con.rules.list.length;i++)
    {
      if (con.auth)
      {
        let rule = con.rules.list[i];
        if (!rule.enabled) continue;
        let project = rule.project;
        let url = conState.getProjectUrl(con,project);
        if (url.lenght === 0) con.rules.compiled = false; 
        else con.rules.compiled = true;           
        rule.url = url;
        rule.versionS = rule.version.replace('.','');
        
        let name = rule.name;
        let act = con.rules.active;
        act[name] = new Object;
        act[name].wu = [];
        act[name].state = [];
        act[name].ticks = [];
        act[name].data = [];
        act[name].timeOut = [];
      }
      else
      {
        con.rules.compiled = false; 
        rules.url = "";
      }
    }
  } catch (error) {
    logging.logError('RulesProcess,compileCon', error);   
  }    
}

function rulesData()
{
    try 
    {      
        let results = parseResults(this.client_completeData);
        if (results === null)
        {
            this.mode = "empty"; 
            return;
        }
        checkRules(this,results);
        this.mode = "OK";             
    } catch (error) {
        logging.logError('RulesProcess,rulesData', error);           
        this.mode = 'errorc';
        this.error = error;
    }
} 

function parseResults(xml)
{
    var rulesReturn = null;
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, result) {
            if (result !== void 0)
            {
                let resultsArray = result['boinc_gui_rpc_reply']['results'];
                if (resultsArray !== void 0)
                {
                    if (resultsArray[0].result != void 0 )
                    {
                        rulesReturn = resultsArray[0].result;
                        return rulesReturn;
                    }
                }
            }
        });
    } catch (error) {
        logging.logError('RulesProcess,parseResults', error);         
    }
    return rulesReturn;
}

function checkRules(con,results)
{
  // computer already matches
  try {
    let time = Date.now()/1000;
    let rules = con.rules.list;
    for (let i=0; i<rules.length; i++)
    {
      let item = rules[i]
      for (let r=0; r<results.length; r++)
      {
        let result = results[r];
        if (item.project.length !== 0 && item.url !== result.project_url[0]) continue;
        if (item.version.length !== 0 && item.versionS !== result.version_num[0]) continue;
        if (item.app.length !== 0)
        {
          let wuName = result.wu_name[0];
          let app = conState.getApp(con,wuName);
          if (item.app !== app) continue;
        }
        matchApp(con,item,result,time);
      }  
    }
    cleanup(con,rules,time);
  } catch (error) {
    logging.logError('RulesProcess,checkRules', error);     
  }
}

function cleanup(con,rules,time)
{
  try {
    let timeOut = time - 300; // remove after 5 minutes
    for (let r=0;r<rules.length;r++)
    {
      let rule = rules[r];
      let arr = con.rules.active[rule.name];
      for (let a=arr.wu.length-1;a>=0;a--)
      {
        if (arr.timeOut[a] < timeOut)
        {
          logging.logRules("Cleanup: " + rule.name + ",wu: " +  arr.wu[a]);          
          arr.wu.splice(a,1);
          arr.state.splice(a,1);
          arr.ticks.splice(a,1);
          arr.timeOut.splice(a,1)
          arr.data.splice(a,1); 
        }
      }
    }  
  } catch (error) {
    logging.logError('RulesProcess,cleanup', error);  
  }
}

// matches computer, project and app
function matchApp(con,rule,item,time)
{
  try {
    let wu = item.name[0];
    let arr = con.rules.active[rule.name];
    let pos = arr.wu.indexOf(wu);
 
    switch(rule.ruleType)
    {
      case constants.RULE_ELAPSED_TIME_NR:
        handleElapsed(con,rule,item,arr,wu,pos,time)       
      break;
      case constants.RULE_ELAPSED_TIME_DELTA_NR:
        handleElapsedDelta(con,rule,item,arr,wu,pos,time)    
      break;
      case constants.RULE_CPU_PERC_NR:
      break;
      case constants.RULE_PROGRESS_PERC_NR:
      break;
      case constants.RULE_TIME_LEFT_NR:
        handleTimeLeft(con,rule,item,arr,wu,pos,time) 
      break;
      case constants.RULE_USE_NR:
      break;
      case constants.RULE_TIME_NR:
      break;
      case constants.RULE_CONNECTION_NR:
      break;
      case constants.RULE_DEADLINE_NR:
      break;
      case constants.RULE_ACTION_NO_NR:
    }    
  } catch (error) {
    logging.logError('RulesProcess,matchApp', error);   
  }
}

function handleElapsed(con,rule,item,arr,wu,pos,time)
{
  try {
    let elapsed = item.final_elapsed_time[0];
    let active = item.active_task;
    if (active !== void 0)
    {
      elapsed = active[0].elapsed_time[0];
    }
    if (elapsed > rule.value)
    {
      if (pos < 0)
      {
        arr.wu.push(wu);
        arr.state.push(R_STAT_TRIGGER);
        arr.ticks.push(1);
        arr.timeOut.push(time);
        arr.data.push("");         
        let reason = "Elapsed time: " + functions.getFormattedTimeInterval(elapsed) + ",wu: " + wu;
        trigger(con,rule,reason,item);        
      }
      else
      {
        arr.timeOut[pos] = time;
      }
    }  
  } catch (error) {
    logging.logError('RulesProcess,handleElapsed', error);   
  }
}

function handleElapsedDelta(con,rule,item,arr,wu,pos,time)
{
  try {
    let elapsed = item.final_elapsed_time[0]
    let active = item.active_task;
    if (active !== void 0)
    {
      elapsed = active[0].elapsed_time[0];
    }
    if (pos < 0)
    {
      arr.wu.push(wu);
      arr.state.push(R_STAT_ACTIVE);
      arr.ticks.push(0);
      arr.timeOut.push(time);
      arr.data.push(elapsed);      
    }
    else
    {
      let elapsedD = elapsed - arr.data[pos];
      arr.data[pos] = elapsed;
      let tick = arr.ticks[pos]++;
      arr.timeOut[pos] = time;
      if (elapsedD < rule.value)
      {
        if (tick === 1)
        {
          let reason = "Δ Elapsed time: " + functions.getFormattedTimeInterval(elapsedD) + ",wu: " + wu + ",tick: " + tick;
          logActive(con,rule,reason);
        }
        if (arr.state[pos] !== R_STAT_TRIGGER)
        {        
          if (tick /2 >= rule.time)
          {
            arr.state[pos] = R_STAT_TRIGGER;          
            let reason = "Δ Elapsed time: " + functions.getFormattedTimeInterval(elapsedD) + ",wu: " + wu + ",tick: " + tick;
            trigger(con,rule,reason,item);
          }
        }
      }
      else
      {
        arr.ticks[pos] = 0;
        arr.timeOut[pos] = time;
      }
    }
  } catch (error) {
    logging.logError('RulesProcess,handleElapsedDelta', error);   
  }
}

function handleTimeLeft(con,rule,item,arr,wu,pos,time)
{
  try {
    let remaining = item.estimated_cpu_time_remaining[0];
    if ((remaining > 1) && (remaining < rule.value))
    {
      if (pos < 0)
      {
        arr.wu.push(wu);
        arr.state.push(R_STAT_TRIGGER);
        arr.ticks.push(1);
        arr.timeOut.push(time);
        arr.data.push(""); 
        let reason = "Time left: " + functions.getFormattedTimeInterval(remaining) + ",wu: " + wu;
        trigger(con,rule,reason,item);        
      }
      else
      {
        arr.timeOut[pos] = time;
      }
    }  
  } catch (error) {
    logging.logError('RulesProcess,handleTimeLeft', error);   
  } 
}

function trigger(con,rule, reason, item)
{
  setTimeout(trigger2,50,con, rule, reason, item);  // start async.
}

function trigger2(con,rule,reason,item)
{
  try {
    logTrigger(con,rule,reason)
    switch (rule.ruleAction)
    {
      case constants.RULE_ACTION_SUSPEND_TASK_NR:
        ruleTask(con,item,"suspend_result",R_SEND_TASKS);
        logAction(con,rule,"Action: suspend task");        
      break;
      default:
        logProblem(con,rule,"Rule action not supported :" + rule.ruleAction);
    }
  } catch (error) {
    logging.logError('RulesProcess,trigger', error);   
  }
}

function ruleTask(con,item,request,what)
{
  try {
    let wu = item.name[0];
    let url = item.project_url[0]    
    switch(what)
    {
        case R_SEND_TASKS:
          ruleSendCommand(con,request, url, wu);
        break;
        case R_SEND_PROJECTS:
          ruleSendCommandProject(con,request, url);
        break;
    }
  } catch (error) {
    logging.logError('RulesProcess,tasks', error);      
  } 
}

function ruleSendCommand(con,request, url, wu)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n<name>"+ wu + "</name>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req);
}

function ruleSendCommandProject(con,request, url)
{
    let req = "<" + request + ">\n<project_url>" + url + "</project_url>\n</" + request + ">";
    connectionsShadow.addSendArray(con,req);
}

function logProblem(con,rule,reason)
{
  logRule(">>>>>>>>>> problem: ",con,rule,reason);
}

function logAction(con,rule,reason)
{
  logRule("Action: ",con,rule,reason);
}

function logActive(con,rule,reason)
{
  logRule("Active: ",con,rule,reason);
}

function logTrigger(con,rule,reason)
{
  logRule("Trigger: ", con,rule,reason);
}

function logRule(txt, con,rule,reason)
{
  logging.logRules(txt + rule.name + " ," + con.computerName +  " ," +  reason);
}
