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

let gRulesMainwindow = null;


class RulesProcess{
  makeComputerList(gb)
  {
    makeComputerList(gb);
    gRulesMainwindow = gb.mainWindow;
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

  connectionsCheck(gb)
  {
    try {
      let connections = gb.connections;
      let emailReason = "";
      let bShowAlert = false;
      for (let c=0; c < connections.length;c++)
      {
        let con = connections[c];        
        let ruleLen = con.rules.list.length;
        if (ruleLen === null) continue;

        if (con.rules.auth === con.auth)  continue;
        con.rules.auth = con.auth;
        for (let r=0;r<ruleLen;r++)
        {
          let rule = con.rules.list[r];
          if (rule.ruleType !== constants.RULE_CONNECTION_NR) continue;
          let bAlert = rule.ruleAction === constants.RULE_ACTION_ALERT_NR || rule.ruleAction2 === constants.RULE_ACTION_ALERT_NR;
          let bEmail = rule.ruleAction === constants.RULE_ACTION_EMAIL_NR || rule.ruleAction2 === constants.RULE_ACTION_EMAIL_NR
          if (bEmail || bAlert)
          {
            if(con.auth)
            {
              if (rule.value === "lost")
              {
                if (!con.rules.seenLost)
                {
                  continue;
                }
              }
              if (bEmail) emailReason += "Connected to: " + con.computerName + " , rule: " + rule.name +  ". \r\n";
              if (bAlert) bShowAlert = true;

            }
            else
            {
              if (bAlert) bShowAlert = true;
              if (con.lostConnection)
              {
                con.rules.seenLost = true;
                if (bEmail) emailReason += "Lost connection to: " + con.computerName + " , rule: " + rule.name +  ". \r\n";
              }
              else
              {
                if (bEmail) emailReason += "No connection with: " + con.computerName  + " , rule: " + rule.name +  ". \r\n";
              }
            }            
          }         
        }
      }
      if (emailReason.length > 0)
      {
        setTimeout(triggerEmail,50,gb.rules,emailReason,"Connection rule");
      }      
      if (bShowAlert)
      {
        gb.mainWindow.hide();        
        gb.mainWindow.show();
        logging.logRules("Trigger: Connection rule, Action: alert");
      }      
    } catch (error) {
      logging.logError('RulesProcess,connectionsCheck', error);      
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
        if ((con.computerName.indexOf(computerName) >=0) || computerName.length === 0)
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
      let rule = con.rules.list[i];
      if (!rule.enabled) continue;
      let name = rule.name;
      if (con.auth)
      {
        rule.versionS = rule.version.replace('.','');
        
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
        rule.url = "";
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
        checkRules(gRulesMainwindow,this,results);
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

// All rules, except connection.
function checkRules(window,con,results)
{

  try {
    let time = Date.now()/1000;
    let rules = con.rules.list;
    for (let i=0; i<rules.length; i++)
    {
      let item = rules[i];      
      for (let r=0; r<results.length; r++)
      {
        let result = results[r];
        if (item.project.length !== 0 && item.url !== result.project_url[0]) continue;
        if (item.versionS.length !== 0 && item.versionS !== result.version_num[0]) continue;
        if (item.app.length !== 0)
        {
          let wuName = result.wu_name[0];
          let app = conState.getApp(con,wuName);
          if (item.app !== app) continue;
        }
        matchApp(window,con,item,result,time);
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
function matchApp(window,con,rule,item,time)
{
  try {
    let wu = item.name[0];
    let arr = con.rules.active[rule.name];
    if (arr ===  void 0)
    {
      con.rules.compiled = false; //todo why end up here
      return;
    }

    let pos = arr.wu.indexOf(wu);
    switch(rule.ruleType)
    {
      case constants.RULE_ELAPSED_TIME_NR:
        handleElapsed(window,con,rule,item,arr,wu,pos,time)       
      break;
      case constants.RULE_ELAPSED_TIME_DELTA_NR:
        handleElapsedDelta(window,con,rule,item,arr,wu,pos,time)    
      break;
      case constants.RULE_CPU_PERC_NR:
      break;
      case constants.RULE_PROGRESS_PERC_NR:
      break;
      case constants.RULE_TIME_LEFT_NR:
        handleTimeLeft(window,con,rule,item,arr,wu,pos,time) 
      break;
      case constants.RULE_USE_NR:
      break;
      case constants.RULE_TIME_NR:
      break;
      case constants.RULE_DEADLINE_NR:
      break;
      case constants.RULE_ACTION_NO_NR:
      break;
    }    
  } catch (error) {
    logging.logError('RulesProcess,matchApp', error);   
  }
}

function handleElapsed(window,con,rule,item,arr,wu,pos,time)
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
        trigger(window,con,rule,reason,item);        
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

function handleElapsedDelta(window,con,rule,item,arr,wu,pos,time)
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
            trigger(window,con,rule,reason,item);
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

function handleTimeLeft(window,con,rule,item,arr,wu,pos,time)
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
        trigger(window,con,rule,reason,item);        
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

function trigger(window,con,rule, reason, item)
{
  setTimeout(trigger2,50,window,con,rule,reason,item);  // start async.
}

function trigger2(window,con,rule,reason,item)
{
  try {
    logTrigger(con,rule,reason);    
    action(window,con,rule,rule.ruleAction,item);
    action(window,con,rule,rule.ruleAction2,item);
  } catch (error) {
    logging.logError('RulesProcess,trigger2', error);   
  }
}

function action(window,con,rule,action,item)
{
  try {
    switch (action)
    {
      case constants.RULE_ACTION_NO_NR:
      break;
      case constants.RULE_ACTION_SUSPEND_TASK_NR:
        ruleTask(con,item,"suspend_result",R_SEND_TASKS);
        logAction(con,rule,"Action: suspend task");        
      break;
      case constants.RULE_ACTION_ALERT_NR:
        window.hide();        
        window.show();
        logAction(con,rule,"Action: alert");
      break;
      case constants.RULE_ACTION_EMAIL_NR:
        setTimeout(triggerEmail,50,con.rules,reason,item.name);
        logAction(con,rule,"Action: email");
      break;      
      default:
        logProblem(con,rule,"Rule action not supported :" + action);
    }    
  } catch (error) {
    logging.logError('RulesProcess,action', error);  
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

function triggerEmail(rules, reason, name)
{
  try {
    const Email = require('./email');
    const email = new Email();

    let eSubject = "BoincTasks Js: " + name;
    let eBody = "Rule triggered: " + name + "\r\n";
    eBody += reason;
    logging.logRules("Trigger: " + name + " , " +  reason);
    email.send(rules, eSubject, eBody)    
  } catch (error) {
    logging.logError('RulesProcess,triggerEmail', error); 
  }
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
