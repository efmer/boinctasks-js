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

const electron = require('electron');
const path = require('path');
const fs = require('fs');


const gUserDataPath = (electron.app || electron.remote.app).getPath('userData');

class ReadWrite{
    write(folder,fileName,data)
    {
        let dir = "";
        let dirF = "";
        try {
            dir = path.join(gUserDataPath, folder);
            if (!fs.existsSync(dir))
            {
                fs.mkdirSync(dir, {recursive: true});
            }
            dirF = path.join(dir, fileName);
            fs.writeFileSync(dirF, data);
        } catch (error) {
            return false;        
        }   
        return dir;     
    }

    read(folder,fileName)
    {
        try {
            let dir = path.join(gUserDataPath, folder);        
            let dirF = path.join(dir, fileName);
            return fs.readFileSync(dirF);
            
        } catch (error) {
            return null;    
        }        
    }

    readAbsolute(fileName)
    {
        try {     
            return fs.readFileSync(fileName);
            
        } catch (error) {
            return "";    
        }        
    }

    readResource(folder,fileName)
    {
        try {          
            let dirF = path.join(folder, fileName);              
            return fs.readFileSync(dirF);
        } catch (error) {
            return "";    
        }
    }

    rename(folder,oldFile,newFile)
    {
        try {
            let dir = path.join(gUserDataPath, folder);
            if (!fs.existsSync(dir))
            {
                fs.mkdirSync(dir);
            }
            let dirOld = path.join(dir, oldFile);
            let dirNew = path.join(dir, newFile);
            fs.renameSync(dirOld,dirNew)   
        } catch (error) {
            
        }
    }
}

module.exports = ReadWrite;