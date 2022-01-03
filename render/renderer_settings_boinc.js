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

$(document).ready(function() {
    gLocale =  navigator.language,
    ipcRenderer.on('settings', (event,obj) => {
        gError = false;
        updateOk("")
        updateError("");
        process(obj);
        $("#all_settings").removeClass( "hidden" );
    });
    ipcRenderer.on('header_status', (event,status) => {
        $("#header_status").html(status);
    });    
    ipcRenderer.on('settings_ok', (event) => {
        ok();
    });

    $( "#apply1" ).on( "click", function(event) {
        apply()
    });  
    $( "#apply2" ).on( "click", function(event) {
        apply()
    }); 
    $( "#apply3" ).on( "click", function(event) {
        apply()
    });         

    $( "#default" ).on( "click", function(event) {
        defaultSettings()
    });  

    ipcRenderer.on('translations', (event, dlg) => {
        $("#trans_processor").html( dlg.DBO_PROCESSOR_TITLE);
        $("#trans_allowed").html( dlg.DBO_PROCESSOR_COMPUTERING_ALLOWED);
        $("#trans_while_on_batteries").html( dlg.DBO_PROCESSOR_WHILE_BATTERIES);
        $("#trans_while_in_use").html( dlg.DBO_PROCESSOR_WHILE_IN_USE);
        $("#trans_GPU_in_use").html( dlg.DBO_PROCESSOR_GPU_WHILE_IN_USE);
        $("#trans_cpu_idle").html( dlg.DBO_PROCESSOR_ONLY_IDLE);
        $("#trans_minutes1").html( dlg.DBO_MINUTES);
        $("#trans_usage_less").html( dlg.DBO_PROCESSOR_ONLY_USAGE_LESS);
        $("#trans_allowed_between1").html( dlg.DBO_ALLOWED_BETWEEN);
        $("#trans_every_day1").html( dlg.DBO_PROCESSOR_EVERY_DAY);
        $("#tans_hhmm1").html( dlg.DBO_HHMM);
        $("#trans_sunday1").html( dlg.DBO_SUNDAY);
        $("#trans_monday1").html( dlg.DBO_MONDAY);
        $("#trans_tuesday1").html( dlg.DBO_TUESDAY);
        $("#trans_wednesday1").html( dlg.DBO_WEDNESDAY);
        $("#trans_thursday1").html( dlg.DBO_THURSDAY);
        $("#trans_friday1").html( dlg.DBO_FRIDAY);
        $("#trans_saturday1").html( dlg.DBO_SATURDAY);
        $("#trans_switch").html( dlg.DBO_PROCESSOR_SWITCH);
        $("#trans_minutes2").html( dlg.DBO_MINUTES);
        $("#trans_use_most1").html( dlg.DBO_USE_AT_MOST);
        $("#trans_perc_processors").html( dlg.DBO_PERC_PROCESSOR);
        $("#trans_use_most2").html( dlg.DBO_USE_AT_MOST);
        $("#trans_perc_cpu").html( dlg.DBO_PERC_CPU);
        $("#apply1").html( dlg.DBO_BUTTON_APPLY);
        $("#trans_network").html( dlg.DBO_NETWORK_TITLE);
        $("#trans_max_down").html( dlg.DBO_NETWORK_MAX_DOWN);
        $("#trans_kbytess1").html( dlg.DBO_KBYTES_S);
        $("#trans_max_up").html( dlg.DBO_NETWORK_MAX_UP);
        $("#trans_kbytess2").html( dlg.DBO_KBYTES_S);
        $("#trans_at_most").html( dlg.DBO_NETWORK_TRANSFER_MOST);
        $("#trans_mbytes_every").html( dlg.DBO_MBYTES_EVERY);
        $("#trans_days1").html( dlg.DBO_DAYS);
        $("#trans_work_buffer").html( dlg.DBO_NETWORK_MIN_BUFFER);
        $("#trans_days2").html( dlg.DBO_DAYS);
        $("#trans_add_buffer").html( dlg.DBO_NETWORK_ADD_BUFFER);
        $("#trans_days3").html( dlg.DBO_DAYS);
        $("#trans_allowed_between2").html( dlg.DBO_ALLOWED_BETWEEN);
        $("#trans_every_day2").html( dlg.DBO_PROCESSOR_EVERY_DAY);
        $("#tans_hhmm2").html( dlg.DBO_HHMM);
        $("#trans_sunday2").html( dlg.DBO_SUNDAY);
        $("#trans_monday2").html( dlg.DBO_MONDAY);
        $("#trans_tuesday2").html( dlg.DBO_TUESDAY);
        $("#trans_wednesday2").html( dlg.DBO_WEDNESDAY);
        $("#trans_thursday2").html( dlg.DBO_THURSDAY);
        $("#trans_friday2").html( dlg.DBO_FRIDAY);
        $("#trans_saturday2").html( dlg.DBO_SATURDAY);
        $("#apply2").html( dlg.DBO_BUTTON_APPLY);
        $("#trans_disk").html( dlg.DBO_DISK_TITLE);
        $("#trans_use_most3").html( dlg.DBO_USE_AT_MOST);
        $("#trans_giga_disk1").html( dlg.DBO_DISK_GIGABYTE);
        $("#trans_leave_least1").html( dlg.DBO_LEAVE_AT_LEAST);
        $("#trans_giga_disk2").html( dlg.DBO_DISK_GIGABYTE);
        $("#trans_use_most4").html( dlg.DBO_USE_AT_MOST);
        $("#trans_disk_space").html( dlg.DBO_DISK_PERS_DISK);
        $("#trans_write_disk").html( dlg.DBO_DISK_WRITE);
        $("#trans_seconds").html( dlg.DBO_SECONDS);
        $("#trans_use_most5").html( dlg.DBO_USE_AT_MOST);
        $("#trans_swap").html( dlg.DBO_DISK_PAGE_SWAP);
        $("#trans_memory").html( dlg.DBO_MEMORY_TITLE);
        $("#trans_use_most6").html( dlg.DBO_USE_AT_MOST);
        $("#trans_perc_use").html( dlg.DBO_WHEN_IN_USE);
        $("#trans_use_most7").html( dlg.DBO_USE_AT_MOST);
        $("#trans_perc_idle").html( dlg.DBO_WHEN_IDLE);
        $("#trans_leave_mem").html( dlg.DBO_MEMORY_LEAVE);
        $("#apply3").html( dlg.DBO_BUTTON_APPLY);
        $("#default").html( dlg.DBO_BUTTON_RESET);

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
    $('#apply1').attr("disabled", enable);
    $('#apply2').attr("disabled", enable);
    $('#apply3').attr("disabled", enable);    
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

        $("error_msg").html("");

        $("#processor_onbatteries").prop("checked", obj.run_on_batteries[0]==='1');
        $("#processor_inuse").prop("checked", obj.run_if_user_active[0]==='1');    
        $("#processor_usegpu").prop("checked", obj.run_gpu_if_user_active[0]==='1');

        $("#processor_idle").val(toDecimalFloat(obj.idle_time_to_run[0]));
        $("#processor_usage").val(toDecimalFloat(obj.cpu_usage_limit[0]));        

        $("#processor_everydayb").val(toTime(obj.start_hour[0]));
        $("#processor_everydaye").val(toTime(obj.end_hour[0]));        

        $("#processor_switch").val(toDecimalFloat(obj.cpu_scheduling_period_minutes[0]));
        $("#processor_usemost").val(toDecimalFloat(obj.max_ncpus_pct[0]));
        $("#processor_usemostcpu").val(toDecimalFloat(obj.cpu_usage_limit[0]));

        $("#network_dlrate").val(toDecimalFloat(obj.max_bytes_sec_down[0]));
        $("#network_uprate").val(toDecimalFloat(obj.max_bytes_sec_up[0]));
        $("#network_transfer").val(toDecimalFloat(obj.daily_xfer_limit_mb[0]));
        $("#network_transfer_day").val(toDecimalInt(obj.daily_xfer_period_days[0]));
        $("#network_buffermin").val(toDecimalFloat(obj.work_buf_min_days[0]));
        $("#network_bufferadd").val(toDecimalFloat(obj.work_buf_additional_days[0]));

        $("#network_everydayb").val(toTime(obj.net_start_hour[0]));
        $("#network_everydaye").val(toTime(obj.net_end_hour[0]));
        
        $("#disk_usemost").val(toDecimalFloat(obj.disk_max_used_gb[0]));        
        $("#disk_least").val(toDecimalFloat(obj.disk_min_free_gb[0]));
        $("#disk_mostp").val(toDecimalFloat(obj.disk_max_used_pct[0]));
        $("#disk_every").val(toDecimalFloat(obj.disk_interval[0]));
        $("#disk_swap").val(toDecimalFloat(obj.vm_max_used_pct[0]));

        $("#memory_usebusy").val(toDecimalFloat(obj.ram_max_used_busy_pct[0]));
        $("#memory_useidle").val(toDecimalFloat(obj.ram_max_used_idle_pct[0]));

        $("#memory_leave").prop("checked", obj.leave_apps_in_memory[0]==='1');
        
        processDays(false,"processor_use_",obj.day_prefs);
        processDays(true,"network_use_",obj.day_prefs);

    } catch (error) {
        var ii = 1;
    }
}

function clearDays()
{
    for (let i=0;i<7;i++)
    {
        let idj = "#processor_use_" + i;        
        $(idj+'c').prop("checked", false);
        $(idj+'b').html("");
        $(idj+'e').html("");   
        idj = "#network_use_" + i;        
        $(idj+'c').prop("checked", false);
        $(idj+'b').html("");
        $(idj+'e').html("");                
    }
}

function processDays(net,id,days)
{
    for (let i=0;i<days.length;i++)
    {
        let item = days[i];
        let dayofweek = parseInt(item.day_of_week);
        let idj = "#" + id + dayofweek;

        if (item.net_end_hour == undefined)
        {
            if (!net)
            {
                $(idj+'c').prop("checked", true);
                $(idj+'b').val(toTime(item.start_hour));
                $(idj+'e').val(toTime(item.end_hour));
            }
        }
        else
        {
            if (net)
            {           
                $(idj+'c').prop("checked", true);
                $(idj+'b').val(toTime(item.net_start_hour));
                $(idj+'e').val(toTime(item.net_end_hour));
            }
        }

    }
}

function toDecimalFloat(val)
{
    let nr = val;
    try {
        nr = Intl.NumberFormat(gLocale, { minimumFractionDigits: 0 }).format(val);
        if (isNaN(nr))
        {
            errorFloat(val);
            nr = 0;
        }         
    } catch (error) {}
    return nr;
}

function toDecimalInt(val)
{
    let vali = parseInt(val);
    if (isNaN(vali))
    {
        errorFloat(vali);
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
        items.run_on_batteries = getBool($("#processor_onbatteries").is(":checked"));
        items.run_if_user_active = getBool($("#processor_inuse").is(":checked"));    
        items.run_gpu_if_user_active = getBool($("#processor_usegpu").is(":checked"));
    
        items.idle_time_to_run = getFloat($("#processor_idle").val());
        items.cpu_usage_limit = getFloat($("#processor_usage").val());
    
        items.start_hour = getTime($("#processor_everydayb").val());
        items.end_hour = getTime($("#processor_everydaye").val());
    
        items.cpu_scheduling_period_minutes = getFloat($("#processor_switch").val());
        items.max_ncpus_pct = getFloat($("#processor_usemost").val());
        items.cpu_usage_limit = getFloat($("#processor_usemostcpu").val());
    
        items.max_bytes_sec_down = getFloat($("#network_dlrate").val());
        items.max_bytes_sec_up = getFloat($("#network_uprate").val());
        items.daily_xfer_limit_mb = getFloat($("#network_transfer").val());
        items.daily_xfer_period_days = getFloat($("#network_transfer_day").val());
        items.work_buf_min_days = getFloat($("#network_buffermin").val());
        items.work_buf_additional_days = getFloat($("#network_bufferadd").val());
    
        items.net_start_hour = getTime($("#network_everydayb").val());
        items.net_end_hour = getTime($("#network_everydaye").val());
        
        items.disk_max_used_gb = getFloat($("#disk_usemost").val());        
        items.disk_min_free_gb = getFloat($("#disk_least").val());
        items.disk_max_used_pct = getFloat($("#disk_mostp").val());
        items.disk_interval = getFloat($("#disk_every").val());
        items.vm_max_used_pct = getFloat($("#disk_swap").val());
    
        items.ram_max_used_busy_pct = getFloat($("#memory_usebusy").val());
        items.ram_max_used_idle_pct = getFloat($("#memory_useidle").val());
    
        items.leave_apps_in_memory = getBool($("#memory_leave").is(":checked"));
        
        items.day_prefs = [];
        getDaysP(items);
        getDaysN(items);       
    } catch (error) {
        updateError("Processing error: " + error);
    }
    return items;
}

function getFloat(val)
{
    try {
        val = val.replaceAll(",",".");
        let nr = parseFloat(val);
        if (isNaN(nr)) 
        {
            errorFloat(val);
            nr = 0;
        }
        return nr;
    } catch (error) {                
    }
    errorFloat(val);
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
    
        if (isNaN(hour)) errorFloat(hour);        
        hour = parseInt(hour);
        if (hour < 0) errorTime(sTime);
        if (hour > 24) errorTime(sTime);
    
        if (isNaN(minutes)) errorFloat(minutes);        
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
            let idj = "#processor_use_" + i;     
            if ($(idj+'c').is(":checked"))      
            {            
                let item = new Object();         
                item.net = false;
                item.day = i;        
                item.start_hour = getTime($(idj+'b').val());
                item.end_hour = getTime($(idj+'e').val());
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
            let idj = "#network_use_" + i;     
            if ($(idj+'c').is(":checked"))      
            {
                let item = new Object();      
                item.net = true; 
                item.day = i;       
                item.net_start_hour = getTime($(idj+'b').val());
                item.net_end_hour = getTime($(idj+'e').val());
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

function errorFloat(msg)
{
    updateError("Invalid number: " + msg);
    gError = true;
}

function updateError(msg)
{
    $("#error_msg1").html(msg);  
    $("#error_msg2").html(msg);  
    $("#error_msg3").html(msg);  
    updateOk("");
}

function updateOk(msg)
{
    $("#ok_msg1").html(msg);     
    $("#ok_msg2").html(msg); 
    $("#ok_msg3").html(msg);     
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
    $("#processor_onbatteries").prop("checked", false);
    $("#processor_inuse").prop("checked", true);    
    $("#processor_usegpu").prop("checked", false);

    $("#processor_idle").val(5);
    $("#processor_usage").val(25);        

    $("#processor_everydayb").val("00:00");
    $("#processor_everydaye").val("00:00");        

    $("#processor_switch").val(120);
    $("#processor_usemost").val(50);
    $("#processor_usemostcpu").val(60);

    $("#network_dlrate").val(0);
    $("#network_uprate").val(0);
    $("#network_transfer").val(0);
    $("#network_transfer_day").val(0);
    $("#network_buffermin").val(0);
    $("#network_bufferadd").val(0);

    $("#network_everydayb").val("00:00");
    $("#network_everydaye").val("00:00");
    
    $("#disk_usemost").val(10);        
    $("#disk_least").val(1);
    $("#disk_mostp").val(50);
    $("#disk_every").val(60);
    $("#disk_swap").val(30);

    $("#memory_usebusy").val(40);
    $("#memory_useidle").val(100);

    $("#memory_leave").prop("checked", false);
}