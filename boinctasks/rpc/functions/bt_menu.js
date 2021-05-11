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

const ReadWrite  = require('./readwrite');
const readWrite = new ReadWrite();

let g_menu = null;

class BtMenu{
    set(item,value)
    {
        if (g_menu == null)
        {
            g_menu = Object();
        }
        g_menu[item] = value;
    }
    check(item)
    {
        let ret = false;
        try {
            if (g_menu === null) return false;
            if (g_menu[item] === true) return true;
        } catch (error) {            
        }
        return ret;
    }
    write()
    {
        try {
            readWrite.write("settings\\menu","menu.json",JSON.stringify(g_menu));
            readWrite.write("settings\\menu","menu_backup.json",JSON.stringify(g_menu));
        } catch (error) {
            var ii = 1;
        }
    }
    read()
    {
        try {
            g_menu = JSON.parse(readWrite.read("settings\\menu","menu.json")); 
            if (g_menu === null)
            {
                g_menu = JSON.parse(readWrite.read("settings\\menu", "menu_backup.json")); 
                return g_menu;               
            }
            return g_menu;        
        } catch (error) {           
        }
    }  
  }
  
  module.exports = BtMenu;