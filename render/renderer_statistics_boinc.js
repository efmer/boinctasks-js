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

let g_showProject = true;
let g_selProject = null;
let g_selComputer = null;

let g_trans = null;

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send('statistics_boinc',"projects");
    graphSize();
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
        let selected = creditSelected(); 
        addData(selected);
    });

    document.getElementById('radio_credit').addEventListener("click", function(event){  
        let selected = creditSelected(); 
        initGraph();
        addData(selected);
    }); 

    document.getElementById('project_list').addEventListener("click", function(event){  
        getSelected();
    });

    document.getElementById('computer_list').addEventListener("click", function(event){      
        getSelected();
    });

    document.getElementById('select_hide').addEventListener("click", function(event){         
        if (g_showProject)
        {
            SetHtml('select_hide',">");
            document.getElementById('project_list_all').style.display = "none";
            document.getElementById('computer_list_all').style.display = "none";            
            g_showProject = false;                     
        }
        else
        {
            SetHtml('select_hide',g_trans.DBS_BUTTON_HIDE);
            document.getElementById('project_list_all').style.display = "block";
            document.getElementById('computer_list_all').style.display = "block";          
            g_showProject = true;
        }
        graphSize();
        getSelected();
    });

    ipcRenderer.on('translations', (event, dlg) => {
        g_trans = dlg;
        SetHtml('trans_host_average',dlg.DBS_HOST_AVERAGE);
        SetHtml('trans_host_total',dlg.DBS_HOST_TOTAL)
        SetHtml('trans_user_average',dlg.DBS_USER_AVERAGE)
        SetHtml('trans_user_total',dlg.DBS_USER_TOTAL)
        SetHtml('trans_projects',dlg.DBS_PROJECTS)
        SetHtml('trans_computers',dlg.DBS_COMPUTERS)
        SetHtml('select_hide',dlg.DBS_BUTTON_HIDE)
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
    let selected = creditSelected(); 

    initGraph();
    addData(selected);
}

function creditSelected()
{
    let selected = -1;
    var element = document.getElementsByName('radio_credit');
     for (let i = 0; i < element.length; i++) {
        if (element[i].checked)
        {
            selected=element[i].value;
        }
    }
    return selected;
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
                        data: dataArray[selected],
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
                        data: dataArray[selected],
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
                shortMonths: g_trans.DBS_MONTH_T,
                decimalPoint: '.',
                thousandsSep: ','
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
//                $(".highcharts-legend-item path").attr('stroke-width', 10);
            },
            redraw: function () { // change legend symbol
//                $(".highcharts-legend-item path").attr('stroke-width', 10);
            }
            },
            zoomType: 'x',
            backgroundColor: 'rgb(245, 245, 245)',
            yAxis: {
                gridLineDashStyle: 'longdash'
            }    
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
            }
        },
        yAxis: {
            title: {
                text: g_trans.DBS_STAT_CREDITS
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
        //				if (g_single_multiple_selection == 1)
        //				{
        //					HideSeries();
        //				}
        //				LegendSelectionChanged();
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
        tooltip: {
         headerFormat: '<b></b><br>',
         pointFormat: '{series.name}, {point.x:%b %e}, ' + g_trans.DBS_STAT_CREDITS + ': {point.y:,.2f} '
        } 
	});	
    graphSize();
}

function graphWidth()
{
    let iWidthSel = document.getElementById('project_list_all').offsetWidth; 
    let iWidth = window.innerWidth;
    if (g_showProject)
    {
        iWidth -= iWidthSel;
        iWidth -= 54;
    }
    else
    {
        iWidth -= 78;
    }
    return iWidth;
}

function graphHeight()
{
    var iHeight  = window.innerHeight;
    let iHeightRadio = document.getElementById('radio_credit').offsetHeight;
    iHeight -= iHeightRadio;    
    iHeight -= 40;
    if (iHeight < 400) iHeight = 400;
    return iHeight;
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