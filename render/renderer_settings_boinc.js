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

'use strict';

const {ipcRenderer } = require('electron');

let gLocale = "";
let gError = false;

document.addEventListener("DOMContentLoaded", () => {
    gLocale =  navigator.language,
    ipcRenderer.on('settings', (event,obj) => {
        gError = false;
        updateOk("")
        updateError("");
        process(obj);
        document.getElementById('all_settings').classList.remove("hidden");  
    });
    ipcRenderer.on('header_status', (event,status) => {
        SetHtml("header_status",status);
    });    
    ipcRenderer.on('settings_ok', (event) => {
        ok();
    });

    document.getElementById('apply1').addEventListener("click", function(event){      
        apply()
    });  
    document.getElementById('apply2').addEventListener("click", function(event){      
        apply()
    }); 
    document.getElementById('apply3').addEventListener("click", function(event){     
        apply()
    });         

    document.getElementById('default').addEventListener("click", function(event){   
        defaultSettings()
    });  

    ipcRenderer.on('translations', (event, dlg) => {
        SetHtml("trans_processor",dlg.DBO_PROCESSOR_TITLE);
        SetHtml("trans_allowed",dlg.DBO_PROCESSOR_COMPUTERING_ALLOWED);
        SetHtml("trans_while_on_batteries",dlg.DBO_PROCESSOR_WHILE_BATTERIES);
        SetHtml("trans_while_in_use",dlg.DBO_PROCESSOR_WHILE_IN_USE);
        SetHtml("trans_GPU_in_use",dlg.DBO_PROCESSOR_GPU_WHILE_IN_USE);
        SetHtml("trans_cpu_idle",dlg.DBO_PROCESSOR_ONLY_IDLE);
        SetHtml("trans_minutes1",dlg.DBO_MINUTES);
        SetHtml("trans_usage_less",dlg.DBO_PROCESSOR_ONLY_USAGE_LESS);
        SetHtml("trans_allowed_between1",dlg.DBO_ALLOWED_BETWEEN);
        SetHtml("trans_every_day1",dlg.DBO_PROCESSOR_EVERY_DAY);
        SetHtml("tans_hhmm1",dlg.DBO_HHMM);
        SetHtml("trans_sunday1",dlg.DBO_SUNDAY);
        SetHtml("trans_monday1",dlg.DBO_MONDAY);
        SetHtml("trans_tuesday1",dlg.DBO_TUESDAY);
        SetHtml("trans_wednesday1",dlg.DBO_WEDNESDAY);
        SetHtml("trans_thursday1",dlg.DBO_THURSDAY);
        SetHtml("trans_friday1",dlg.DBO_FRIDAY);
        SetHtml("trans_saturday1",dlg.DBO_SATURDAY);
        SetHtml("trans_switch",dlg.DBO_PROCESSOR_SWITCH);
        SetHtml("trans_minutes2",dlg.DBO_MINUTES);
        SetHtml("trans_use_most1",dlg.DBO_USE_AT_MOST);
        SetHtml("trans_perc_processors",dlg.DBO_PERC_PROCESSOR);
        SetHtml("trans_use_most2",dlg.DBO_USE_AT_MOST);
        SetHtml("trans_perc_cpu",dlg.DBO_PERC_CPU);
        SetHtml("apply1",dlg.DBO_BUTTON_APPLY);
        SetHtml("trans_network",dlg.DBO_NETWORK_TITLE);
        SetHtml("trans_max_down",dlg.DBO_NETWORK_MAX_DOWN);
        SetHtml("trans_kbytess1",dlg.DBO_KBYTES_S);
        SetHtml("trans_max_up",dlg.DBO_NETWORK_MAX_UP);
        SetHtml("trans_kbytess2",dlg.DBO_KBYTES_S);
        SetHtml("trans_at_most",dlg.DBO_NETWORK_TRANSFER_MOST);
        SetHtml("trans_mbytes_every",dlg.DBO_MBYTES_EVERY);
        SetHtml("trans_days1",dlg.DBO_DAYS);
        SetHtml("trans_work_buffer",dlg.DBO_NETWORK_MIN_BUFFER);
        SetHtml("trans_days2",dlg.DBO_DAYS);
        SetHtml("trans_add_buffer",dlg.DBO_NETWORK_ADD_BUFFER);
        SetHtml("trans_days3",dlg.DBO_DAYS);
        SetHtml("trans_allowed_between2",dlg.DBO_ALLOWED_BETWEEN);
        SetHtml("trans_every_day2",dlg.DBO_PROCESSOR_EVERY_DAY);
        SetHtml("tans_hhmm2",dlg.DBO_HHMM);
        SetHtml("trans_sunday2",dlg.DBO_SUNDAY);
        SetHtml("trans_monday2",dlg.DBO_MONDAY);
        SetHtml("trans_tuesday2",dlg.DBO_TUESDAY);
        SetHtml("trans_wednesday2",dlg.DBO_WEDNESDAY);
        SetHtml("trans_thursday2",dlg.DBO_THURSDAY);
        SetHtml("trans_friday2",dlg.DBO_FRIDAY);
        SetHtml("trans_saturday2",dlg.DBO_SATURDAY);
        SetHtml("apply2",dlg.DBO_BUTTON_APPLY);
        SetHtml("trans_disk",dlg.DBO_DISK_TITLE);
        SetHtml("trans_use_most3",dlg.DBO_USE_AT_MOST);
        SetHtml("trans_giga_disk1",dlg.DBO_DISK_GIGABYTE);
        SetHtml("trans_leave_least1",dlg.DBO_LEAVE_AT_LEAST);
        SetHtml("trans_giga_disk2",dlg.DBO_DISK_GIGABYTE);
        SetHtml("trans_use_most4",dlg.DBO_USE_AT_MOST);
        SetHtml("trans_disk_space",dlg.DBO_DISK_PERS_DISK);
        SetHtml("trans_write_disk",dlg.DBO_DISK_WRITE);
        SetHtml("trans_seconds",dlg.DBO_SECONDS);
        SetHtml("trans_use_most5",dlg.DBO_USE_AT_MOST);
        SetHtml("trans_swap",dlg.DBO_DISK_PAGE_SWAP);
        SetHtml("trans_memory",dlg.DBO_MEMORY_TITLE);
        SetHtml("trans_use_most6",dlg.DBO_USE_AT_MOST);
        SetHtml("trans_perc_use",dlg.DBO_WHEN_IN_USE);
        SetHtml("trans_use_most7",dlg.DBO_USE_AT_MOST);
        SetHtml("trans_perc_idle",dlg.DBO_WHEN_IDLE);
        SetHtml("trans_leave_mem",dlg.DBO_MEMORY_LEAVE);
        SetHtml("apply3",dlg.DBO_BUTTON_APPLY);
        SetHtml("default",dlg.DBO_BUTTON_RESET);

    });

});

function ok()
{
    gError = false;
    updateError("");
    updateOk("Updated successfully");   
    disableApply(false);
}

function disableApply(enable)
{
    document.getElementById('apply1').disabled = enable; 
    document.getElementById('apply2').disabled = enable; 
    document.getElementById('apply3').disabled = enable;    
}


function apply()
{       
    let settings = fetch();
    if (!gError)
    {
        disableApply(true);
        updateError("");
        updateOk ("");
        ipcRenderer.send('settings_boinc',"settings",settings);
    }
    gError = false;
}

function process(obj)
{
    try {      
        disableApply(false);
        clearDays()

        var id;
        SetCheck("processor_onbatteries",obj.run_on_batteries[0]==='1');
        SetCheck("processor_inuse",obj.run_if_user_active[0]==='1');
        SetCheck("processor_usegpu",obj.run_gpu_if_user_active[0]==='1');

        id = 'processor_idle';SetValue(id,toDecimalFloat(obj.idle_time_to_run[0],id));
        id = 'processor_usage';SetValue(id,toDecimalFloat(obj.suspend_cpu_usage[0],id));

        SetValue("processor_everydayb",toTime(obj.start_hour[0]));
        SetValue("processor_everydaye",toTime(obj.end_hour[0]));        

        id = 'processor_switch'; SetValue(id, toDecimalFloat(obj.cpu_scheduling_period_minutes[0],id));
        id = 'processor_usemost'; SetValue(id,toDecimalFloat(obj.max_ncpus_pct[0],id));
        id = 'processor_usemostcpu'; SetValue(id,toDecimalFloat(obj.cpu_usage_limit[0],id));

        id = 'network_dlrate'; SetValue(id,toDecimalFloat(obj.max_bytes_sec_down[0],id));
        id = 'network_uprate'; SetValue(id,toDecimalFloat(obj.max_bytes_sec_up[0],id));
        id = 'network_transfer'; SetValue(id,toDecimalFloat(obj.daily_xfer_limit_mb[0],id));
        id = 'network_transfer_day'; SetValue(id,toDecimalInt(obj.daily_xfer_period_days[0],id));
        id = 'network_buffermin'; SetValue(id,toDecimalFloat(obj.work_buf_min_days[0],id));
        id = 'network_bufferadd'; SetValue(id,toDecimalFloat(obj.work_buf_additional_days[0],id));

        SetValue("network_everydayb",toTime(obj.net_start_hour[0]));
        SetValue("network_everydaye",toTime(obj.net_end_hour[0]));
        
        id = 'disk_usemost'; SetValue(id,toDecimalFloat(obj.disk_max_used_gb[0],id));
        id = 'disk_least'; SetValue(id,toDecimalFloat(obj.disk_min_free_gb[0],id));
        id = 'disk_mostp'; SetValue(id,toDecimalFloat(obj.disk_max_used_pct[0],id));
        id = 'disk_every'; SetValue(id,toDecimalFloat(obj.disk_interval[0],id));
        id = 'disk_swap'; SetValue(id, toDecimalFloat(obj.vm_max_used_pct[0],id));

        id='memory_usebusy'; SetValue(id,toDecimalFloat(obj.ram_max_used_busy_pct[0],id));
        id='memory_useidle'; SetValue(id,toDecimalFloat(obj.ram_max_used_idle_pct[0],id));

        SetCheck("memory_leave",obj.leave_apps_in_memory[0]==='1');
    
        id = "processor_use_";processDays(false, id ,obj.day_prefs);
        id = "network_use_"; processDays(true,id,obj.day_prefs);

        var checkboxes = document.querySelectorAll('input[type=checkbox]');
        for (var checkbox of checkboxes)
        {
            checkbox.addEventListener('change', function(event)
            {
                // warning fires on every checkbox
                ShowHideDays('processor_use_');
                ShowHideDays('network_use_');              

            });
        }
    } catch (error) {
        updateError("Processing error (process id): " + id + " - " + error);        
    }
}

function clearDays()
{
    for (let i=0;i<7;i++)
    {
        let idj = "processor_use_" + i;        
        SetCheck(idj+'c',false);
        SetHtml(idj+'b',"");
        SetHtml(idj+'e', "");   
        idj = "network_use_" + i;        
        SetCheck(idj+'c',false);
        SetHtml(idj+'b',"");
        SetHtml(idj+'e',"");                
    }
}

function processDays(net,id,days)
{
    if (days == undefined)
    {
        return;
    }
    for (let i=0;i<days.length;i++)
    {
        let item = days[i];
        let dayofweek = parseInt(item.day_of_week);
        let idj = id + dayofweek;

        if (item.net_end_hour == undefined)
        {
            if (!net)
            {
                SetCheck(idj+'c',true);
                SetValue(idj+'b',toTime(item.start_hour));
                SetValue(idj+'e',toTime(item.end_hour));
                HideItem(idj+'b',false);
                HideItem(idj+'e',false);                
            }
        }
        else
        {
            if (net)
            {           
                SetCheck(idj+'c',true);                
                SetValue(idj+'b',toTime(item.net_start_hour));
                SetValue(idj+'e',toTime(item.net_end_hour));
                HideItem(idj+'b',false);
                HideItem(idj+'e',false);                
            }
        }

    }
}

function ShowHideDays(id,days)
{
    for (var i=0;i<=6;i++)
    {
        if (document.getElementById(id + i +'c').checked)
        {
            HideItem(id + i + 'b',false);
            HideItem(id + i +'e',false);             
        }
        else
        {
            HideItem(id + i +'b',true);
            HideItem(id + i +'e',true);             
        }
    }
}

function toDecimalFloat(val,id)
{
    let nr = val;
    try {
        nr = Intl.NumberFormat(gLocale, { minimumFractionDigits: 0 }).format(val);
        if (nr == NaN)
        {
            errorFloat(val,id);
            nr = 0;
        }         
    } catch (error) {}
    return nr;
}

function toDecimalInt(val,id)
{
    let vali = parseInt(val);
    if (vali == NaN)
    {
        errorFloat(vali,id);
        vali = 0;
    }
    return vali;
}

function toTime(val)
{
	let hour = parseInt(val);
    hour = hour.toString();
    hour = hour.padStart(2,'0');
	let minutes = parseInt((60.0 * (val - hour)+.5));
    minutes = minutes.toString();
    minutes = minutes.padStart(2,'0');    
    return hour+ ":" + minutes;
}

// apply read back

function fetch()
{
    let items = new Object();

    try {
        items.run_on_batteries = getBool(document.getElementById("processor_onbatteries").checked);
        items.run_if_user_active = getBool(document.getElementById("processor_inuse").checked);    
        items.run_gpu_if_user_active = getBool(document.getElementById("processor_usegpu").checked);
    
        var id;
        id = 'processor_idle';items.idle_time_to_run = getFloat(document.getElementById(id).value,id);
        id = 'processor_usage';items.suspend_cpu_usage = getFloat(document.getElementById(id).value,id);
    
        items.start_hour = getTime(document.getElementById("processor_everydayb").value);
        items.end_hour = getTime(document.getElementById("processor_everydaye").value);
    
        id = 'processor_switch';items.cpu_scheduling_period_minutes = getFloat(document.getElementById(id).value,id);
        id = 'processor_usemost';items.max_ncpus_pct = getFloat(document.getElementById(id).value,id);
        id = 'processor_usemostcpu';items.cpu_usage_limit = getFloat(document.getElementById(id).value,id);
    
        id = 'network_dlrate';items.max_bytes_sec_down = getFloat(document.getElementById(id).value,id);
        id = 'network_uprate';items.max_bytes_sec_up = getFloat(document.getElementById(id).value,id);
        id = 'network_transfer';items.daily_xfer_limit_mb = getFloat(document.getElementById(id).value,id);
        id = 'network_transfer_day';items.daily_xfer_period_days = getFloat(document.getElementById(id).value,id);
        id = 'network_buffermin';items.work_buf_min_days = getFloat(document.getElementById(id).value,id);
        id = 'network_bufferadd';items.work_buf_additional_days = getFloat(document.getElementById(id).value,id);
    
        items.net_start_hour = getTime(document.getElementById("network_everydayb").value);
        items.net_end_hour = getTime(document.getElementById("network_everydaye").value);
        
        id = 'disk_usemost';items.disk_max_used_gb = getFloat(document.getElementById(id).value,id);        
        id = 'disk_least';items.disk_min_free_gb = getFloat(document.getElementById(id).value,id);
        id = 'disk_mostp';items.disk_max_used_pct = getFloat(document.getElementById(id).value,id);
        id = 'disk_every';items.disk_interval = getFloat(document.getElementById(id).value,id);
        id = 'disk_swap';items.vm_max_used_pct = getFloat(document.getElementById(id).value,id);
    
        id = 'memory_usebusy';items.ram_max_used_busy_pct = getFloat(document.getElementById(id).value,id);
        id = 'memory_useidle';items.ram_max_used_idle_pct =getFloat(document.getElementById(id).value,id);
    
        items.leave_apps_in_memory = getBool( document.getElementById("memory_leave").checked);
        
        items.day_prefs = [];
        getDaysP(items);
        getDaysN(items);       
    } catch (error) {
        updateError("Processing error (fetch): " + error);
    }
    return items;
}

function getFloat(val,id)
{
    try {
        val = val.replaceAll(",",".");
        val = val.replaceAll(" ","");
        let nr = parseFloat(val);
        if (isNaN(nr)) 
        {
            errorFloat(val,id);
            nr = 0;
        }
        return nr;
    } catch (error) {                
    }
    errorFloat(val,id);
    return 0;
}

function getTime(sTime)
{
    try {        
        if (sTime == "" || sTime == "0")		// shortcuts
        {
            sTime = "00:00";
        }
        let pos = sTime.indexOf(':');
        if (pos < 0) errorTime(sTime);
    
        let hour = sTime.substring(0,pos);
        if (hour.length != 2) errorTime(sTime);
        let minutes  = sTime.substring(pos+1);
        if (minutes.length != 2) errorTime(sTime);
    
        if (isNaN(hour)) errorFloat(hour, 'Time hour');
        hour = parseInt(hour);
        if (hour < 0) errorTime(sTime);
        if (hour > 24) errorTime(sTime);
    
        if (isNaN(minutes)) errorFloat(minutes, 'Time minute');
        minutes = parseInt(minutes);
        if (minutes < 0) errorTime(sTime);
        if (minutes > 59) errorTime(sTime);
    
        minutes /= 60.0;
        let time = hour + minutes;
        return time;      
    } catch (error) {
        errorTime(sTime);
    }
    return 0;
}

function getBool(val)
{
    if (val) return "1";
    return "0";
}

function getDaysP(items)
{
    try {
        for (let i=0;i<7;i++)
        {
            let idj = "processor_use_" + i;
            let idjc = document.getElementById(idj+'c');
            if (idjc.checked)      
            {            
                let item = new Object();         
                item.net = false;
                item.day = i;        
                item.start_hour = getTime(document.getElementById(idj+'b').value);
                item.end_hour = getTime(document.getElementById(idj+'e').value);
                items.day_prefs.push(item);            
            }
        }     
    } catch (error) {
        errorTime("");  
    }
}

function getDaysN(items)
{
    try {     
        for (let i=0;i<7;i++)
        {
            let idj = "network_use_" + i;
            let idjc = document.getElementById(idj+'c');
            if (idjc.checked)
            {
                let item = new Object();      
                item.net = true; 
                item.day = i;       
                item.net_start_hour = getTime(document.getElementById(idj+'b').value);
                item.net_end_hour = getTime(document.getElementById(idj+'e').value);
                items.day_prefs.push(item);
            }
        }        
    } catch (error) {
        errorTime("");        
    }
}

function errorTime(msg)
{
    updateError("Invalid time: " + msg);
    gError = true;
}

function errorFloat(msg,id)
{
    updateError("In: " + id + " Invalid number: " + msg );
    gError = true;
}

function updateError(msg)
{
    SetHtml("error_msg1",msg);  
    SetHtml("error_msg2",msg);  
    SetHtml("error_msg3",msg);  
    updateOk("");
}

function updateOk(msg)
{
    SetHtml("ok_msg1",msg);     
    SetHtml("ok_msg2",msg); 
    SetHtml("ok_msg3",msg);     
}

function abort(dashboardWindows, selected, connections)
{
    dialog.showMessageBox(dashboardWindows,
    {
      title: 'Abort?',
      message: 'You are about to abort/delete tasks' ,
      detail: 'Do you want to delete the selected tasks?',
      buttons: ['Cancel', 'Yes delete'],
      defaultId: 0, // bound to buttons array
      cancelId: 1 // bound to buttons array
    })
    .then(result => {
      if (result.response === 0) {
        // cancel
      } else if (result.response === 1) {
        // yes
        task(selected,connections,"abort_result",false);
      }
    }
    );
}


function defaultSettings()
{
    SetCheck("processor_onbatteries", false);
    SetCheck("processor_inuse", true);    
    SetCheck("processor_usegpu", false);

    SetValue("processor_idle",5);
    SetValue("processor_usage",25);        

    SetValue("processor_everydayb","00:00");
    SetValue("processor_everydaye","00:00");        

    SetValue("processor_switch",120);
    SetValue("processor_usemost",50);
    SetValue("processor_usemostcpu",60);

    SetValue("network_dlrate",0);
    SetValue("network_uprate",0);
    SetValue("network_transfer",0);
    SetValue("network_transfer_day",0);
    SetValue("network_buffermin",0);
    SetValue("network_bufferadd",0);

    SetValue("network_everydayb","00:00");
    SetValue("network_everydaye","00:00");
    
    SetValue('disk_usemost',10);
    SetValue('disk_least',1);
    SetValue('disk_mostp',50);
    SetValue('disk_every',60);
    SetValue('disk_swap',30);

    SetValue('memory_usebusy',40);
    SetValue('memory_useidle',100);

    SetCheck("memory_leave",false);
}

function SetHtml(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.innerHTML = data; 
    data = null;
  } catch (error) {
    let i = 1;
  }
}

function SetValue(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.value = data;     
  } catch (error) {
    let i = 1;
  }
}

function SetCheck(tag,data)
{
  try {
    let el = document.getElementById(tag);
    el.checked = data; 
  } catch (error) {
    let i = 1;
  }
}

function HideItem(tag,show)
{
    document.getElementById(tag).hidden = show;
}