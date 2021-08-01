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

const { ipcRenderer } = require('electron')
const shell = require('electron').shell

let gLanguageSettingsItem = null;

$(document).ready(function() {

    ipcRenderer.on('translations', (event, dlg) => {
        $("#trans_GNU").html( dlg.DAB_LICENCE);

        const links = document.querySelectorAll('a[href]')
        Array.prototype.forEach.call(links, function (link) {
           const url = link.getAttribute('href')
           if (url.indexOf('http') === 0) {
              link.addEventListener('click', function (e) {
                  e.preventDefault()
                  shell.openExternal(url)
              })
           }
        })        
    });

    ipcRenderer.on('settings_language', (event, item) => {
        gLanguageSettingsItem = item;
    });

    $( "#lang_english" ).on( "click", function(event) {
        setLang('lang_english');
    });
    $( "#lang_dutch" ).on( "click", function(event) {
        setLang('lang_dutch');
    });
    $( "#lang_french" ).on( "click", function(event) {
        setLang('lang_french');
    });
});

function setLang(lang)
{
    gLanguageSettingsItem.language = lang;
    if (gLanguageSettingsItem !== null)
    {
        ipcRenderer.send('settings_language', gLanguageSettingsItem);     
    }
}