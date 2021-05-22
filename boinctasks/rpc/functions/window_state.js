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

//const Logging = require('./logging');
//const logging = new Logging();

const ReadWrite  = require('./readwrite');
const readWrite = new ReadWrite();


class WindowState{
    set(id, x,y,width,height,bMax = false)
    {
        let bFull = false;
        try 
        {
            let item = new Object()
            item.x = x;
            item.y = y;
            item.width = width;
            item.height = height;
            item.max = bMax;

            let file = id + ".json";

            readWrite.write("settings\\position", file,JSON.stringify(item));
        } catch (error) {
//            logging.logError('WindowState,set', error);
        }  
    }      
    get(id,width,height) 
    {
        let item = null;
        try
        {       
            let file = id + ".json";
            item = JSON.parse(readWrite.read("settings\\position", file));
        } catch (error) {
 //           logging.logError('WindowState,set', error);
        }  
        if (item === null)
        {
            item = new Object();              
            item.width = width;
            item.height = height;
            item.x = 100;
            item.y = 100;
            item.max = false;
        }
        return item;
    }
}
module.exports = WindowState;