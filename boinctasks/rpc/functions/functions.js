
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

const btC = require('../functions/btconstants');

class Functions{
    sendRequest(client, request)
    {
        try {
            var requestBody = "<boinc_gui_rpc_request>\n" + request + "</boinc_gui_rpc_request>\n\u0003";
            client.client_completeData = "";
            client.write(requestBody, "utf8");        
        } catch (error) {
            return null;
        }
    } 

    isDefined(check)
    {
        try {
            if (check === null) return false;
            if (check !== void 0)
            {
                return true;
            }
            return false; 
        } catch (error) {
            return false;
        }                  
    } 

    getFormattedTimeDiff(time, noNeg=false)
    {
        var current = new Date().getTime() / 1000;
        var diff= parseInt(time - current);
        if (noNeg)
        {
             if (diff < 0) return "";
        }
        return this.getFormattedTimeInterval(diff);
    }
    
    getFormattedTimeInterval(seconds)
    {
        let time = ""
        let bNeg = false;
        try {
            if (seconds < 0)
            {
                bNeg = true;
                seconds = Math.abs(seconds);
            } 
            var dd = "";            
            if (seconds >= 86400) {
                var days = parseInt(seconds / 86400);
                seconds -= days * 86400
                dd = days + "d,";
            }
            var date = new Date(seconds*1000);
            var hh = date.getUTCHours();
            var mm = date.getUTCMinutes();
            var ss = date.getSeconds();
            if (hh < 10) {hh = "0"+hh;}
            if (mm < 10) {mm = "0"+mm;}
            if (ss < 10) {ss = "0"+ss;}
    
            time += dd + hh+":"+mm+":"+ss;
            if (bNeg) time ="-" + time;
            return time
        } catch (error) {
            this.logError('Functions,getFormattedTimeInterval', error);            
            return "";
        }
        return str
    }

    getFormattedTime(time)
    {
        let timeS = "Invalid";
        try {
            let d = new Date(time*1000);
            let options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            timeS = d.toLocaleDateString(btC.LOCALE, options);            
        } catch (error) {   
        }
        return timeS;
    }

    getBtLocale(app)
    {
        try {
            let loc = app.getLocale();
            btC.LOCALE = loc;    
        } catch (error) {
            this.logError('Functions,getLocale', error);            
        }           
    }

    normalizeUrl(url)
    {
        url = url.replace("https","http");
        return url;
    }
}
module.exports = Functions;