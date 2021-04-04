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

const Logging = require('./logging');
const logging = new Logging();
const os = require('os');
const ReadWrite  = require('./readwrite');
const readWrite = new ReadWrite();

class Boinc{
    getPassword()
    {
        let password = "";
        try 
        {
            let platform = os.platform();
            switch (platform)
            {
                case "win32" :
                    {
                        let winPath = "C:\\ProgramData\\BOINC\\gui_rpc_auth.cfg";                        
                        password = readWrite.readAbsolute(winPath);
                        if (password.length === 0)
                        {
                            logging.logDebug('No password found in: ' + winPath); 
                            logging.log('No password found in: ' + winPath);
                        }
                        else
                        {
                            logging.logDebug('Localhost password found in: ' + winPath); 
                        }
                    }
                break;
                case "linux" :
                    let linuxPath = "/etc/boinc-client/gui_rpc_auth.cfg";                     
                    logging.logDebug('Password might be in: ' + linuxPath); 
                    /*
                    {
                        let linuxPath = "/etc/boinc-client/gui_rpc_auth.cfg";                        
                        password = readWrite.readAbsolute(linuxPath);
                        if (password.length === 0)
                        {
                            logging.logDebug('No password found in: ' + linuxPath); 
                            logging.log('No password found in: ' + linuxPath);
                        }
                        else
                        {
                            logging.logDebug('Localhost password found in: ' + linuxPath); 
                        }
                    }
                    */
                break;
                case "darwin" :
                    {
                        let winPath = "/Library/Application Support/BOINC Data/gui_rpc_auth.cfg";                        
                        password = readWrite.readAbsolute(winPath);
                        if (password.length === 0)
                        {
                            logging.logDebug('No password found in: ' + winPath); 
                            logging.log('No password found in: ' + winPath);
                        }
                        else
                        {
                            logging.logDebug('Localhost password found in: ' + winPath); 
                        }
                    }
                break;                
                default:
                    logging.logDebug('BOINC, getPassword, not yet defined: ' + platform); 
            }
        
        } catch (error) {   
            logging.logError('Boinc,getPassword', error);   
        }        
        return password;
    }
}
module.exports = Boinc;