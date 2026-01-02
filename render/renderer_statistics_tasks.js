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

let g_chartTitle = "";
let g_chartTitleSub = "";
let g_data = null;

let g_showComputer = true;
let g_selProject = null;
let g_selComputer = null;
let g_timzone = "";

let g_trans = null;

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send('statistics_tasks_boinc',"ready");
    graphSize();
    g_timzone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    addEventListener("resize", (event) => {          
        graphSize();
    });

    ipcRenderer.on('projects', (event,projects,computers) => {
        SetHtml('project_list',projects);
        SetHtml('computer_list',computers);
    });

    ipcRenderer.on('graph', (event,data) => {       
        g_data = data;
        initGraph();
        addData();
    });

    document.getElementById('project_list').addEventListener("click", function(event){  
        getSelected();
    });

    document.getElementById('computer_list').addEventListener("click", function(event){  
        getSelected();
    });

    document.getElementById('select_hide').addEventListener("click", function(event){  
        if (g_showComputer)
        {
            SetHtml('select_hide',">");
            document.getElementById('computer_list_all').style.display = "none";
            document.getElementById('project_list_all').style.display = "none";
            
            g_showComputer = false;                     
        }
        else
        {
            SetHtml('select_hide',g_trans.DBS_BUTTON_HIDE);
            document.getElementById('computer_list_all').style.display = "block";
            document.getElementById('project_list_all').style.display = "block";
            g_showComputer = true;
        }

        graphSize();
        getSelected();
    });

    ipcRenderer.on('translations', (event, dlg) => {
          // testing only
         // dlg.DBS_STAT_TASKS = "xTasks";       
         // dlg.DBS_BUTTON_HIDE = "xHide";
         // dlg.DBS_TITLE = 'xBoinc Tasks Statistics';

          //xdlg.DBS_STAT_COMPUTER = "xComputer";
          //xdlg.DBS_STAT_PROJECT = "xProject";          
          //xdlg.DBS_COMPUTERS = "xShow these computers";          
          //xdlg.DBS_PROJECTS  = "xShow these projects";            
          //dlg.DBS_MONTH_T = ['xJan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'xDec'];
          //

        g_trans = dlg;
        SetHtml('trans_computers', g_trans.DBS_COMPUTERS);   
        SetHtml('trans_projects', g_trans.DBS_PROJECTS);           
        SetHtml('select_hide',g_trans.DBS_BUTTON_HIDE);   
    });
});

function getSelected()
{
    g_selProject = [];
    for (var option of document.getElementById('project_list').options)
    {
        if (option.selected) {
            g_selProject.push(option.value);
        }
    } 

    g_selComputer = [];
    for (var option of document.getElementById('computer_list').options)
    {
        if (option.selected) {
            g_selComputer.push(option.value);
        }
    } 
    initGraph();
    addData();
}

function addData(selected)
{
    try {
        if (g_selComputer.length >= 1)
        {
            if (g_selProject.length === 1)
            {
                addDataSingleProject(selected);
                return
            }
        }
        addDataSingleComputer(selected);
    } catch (error) {   
        var jj = 1;    
    }
}

function addDataSingleProject(selected)
{
    try {
        if (g_selComputer.length >= 1)
        {
            let project = g_selProject[0];
            g_chartTitle = g_trans.DBS_STAT_PROJECT + ": " + project;
            gStatisticsChart.setTitle({ text: g_chartTitle });   
            for (let i=0;i<g_data.length;i++)
            {
                var dataArray = g_data[i];
                let computer = dataArray.computerName;  
                let seriesName = computer;
                if (g_selComputer.indexOf(computer) >=0)
                {
                    if (project === dataArray.project)
                    {
                        gStatisticsChart.addSeries({
                        name: seriesName,
                        type: 'line',
                        data: dataArray.data,
                        visible: true,
                        animation: false                
                        });
                    }
                }
            }
        }
    } catch (error) {
        var ii = 0;
    }
}

function addDataSingleComputer(selected)
{
    try {
        if (g_selComputer.length >= 1)
        {        
            let computerName = g_selComputer[0];
            g_chartTitle = g_trans.DBS_STAT_COMPUTER + ": " + computerName;
            gStatisticsChart.setTitle({ text: g_chartTitle });                        
            for (let i=0;i<g_data.length;i++)
            {
                var dataArray = g_data[i];
                let project = dataArray.project;
                let seriesName = project;
                if (g_selProject.indexOf(project) >=0)
                {
                    if (computerName === dataArray.computerName)
                    {
                        gStatisticsChart.addSeries({
                        name: seriesName,
                        type: 'line',
                        data: dataArray.data,
                        visible: true,
                        animation: false                
                        });
                    }
                }
            }
        }       
    } catch (error) {
        var ii = 0;
    }
}



let gStatisticsChart = null;

function initGraph(graphTitel)
{
    try {
        Highcharts.setOptions({
            lang: {
                shortMonths: g_trans.DBS_MONTH_T
            },
            time: {
                timezone: g_timzone
            }
        });                    
    } catch (error) {
        var ii = 1;
    }
    let iHeight = graphHeight();
    gStatisticsChart = Highcharts.chart("stats_chart",{	
        chart: {
            height: iHeight,
            events: {
                load: function () { // change legend symbol
              //  $(".highcharts-legend-item path").attr('stroke-width', 10);
            },
            redraw: function () { // change legend symbol
              //  $(".highcharts-legend-item path").attr('stroke-width', 10);
            }
            },
            zoomType: 'x',
            backgroundColor: 'rgb(245, 245, 245)',
            yAxis: {
                gridLineDashStyle: 'longdash'
            },      
        },  
        title: {
            text: g_chartTitle,
        },
        subtitle: {
            text: g_chartTitleSub,
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year                
                month: '%e. %b %Y' ,              
                year: '%e. %b %Y',
                all:  '%y',
            },
            title: {
                text: "",
            type: 'datetime',
                labels: {
                format: '{value:%Y-%m-%d}',
                }
            },                            
        },
        yAxis: {
            title: {
                text: g_trans.DBS_STAT_TASKS
            },
            min: 0,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },               
        navigator: {
            enabled: false
        },       	
        plotOptions: {
            series: {
                showInNavigator: false,
                lineWidth: 1,
                events: {
                    legendItemClick: function (x) {
                    }
                }  
            }
        },
                    
        legend: {
            enabled: true,           
            layout: 'horizontal',
                // square
                symbolHeight: 12,
                symbolWidth: 12,
                symbolRadius: 6,
                align: 'right',
                verticalAlign: 'top',
                borderWidth: 0
            },
        credits: {
                enabled: false
        },  

	});	
    graphSize();

}

function graphSize()
{
    let iWidth = graphWidth();
    let iHeight = graphHeight();
    if (gStatisticsChart != null)
    {
        gStatisticsChart.setSize(iWidth,iHeight);
    }
}


function graphWidth()
{
    let iWidthSel = document.getElementById('computer_list_all').offsetWidth; 
    let iWidth = window.innerWidth;
    if (g_showComputer)
    {
        iWidth -= iWidthSel;
        iWidth -= 34;
    }
    else
    {
        iWidth -= 58;
    }
    return iWidth;
}

function graphHeight()
{
    var iHeight  = window.innerHeight;   
    iHeight -= 40;
    if (iHeight < 400) iHeight = 400;
    return iHeight;
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