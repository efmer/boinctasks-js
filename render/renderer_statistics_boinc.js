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

$(document).ready(function() {
    ipcRenderer.send('statistics_boinc',"projects");
    graphSize();
    $(window).resize(function()
    {
//        SetTitlePosition();        
        graphSize();
    });

    ipcRenderer.on('projects', (event,projects,computers) => {
        $("#project_list").html(projects); 
        $("#computer_list").html(computers);         
    });

    ipcRenderer.on('graph', (event,data) => {       
        g_data = data;
        initGraph();
        let selected = $("input[name='radio_credit']:checked").val()  
        addData(selected);
    });

    $('#radio_credit').change(function(){
        let selected = $("input[name='radio_credit']:checked").val()  
        initGraph();
        addData(selected);
    }); 

    $('#project_list').on('change', function() {
        getSelected();
    });

    $('#computer_list').on('change', function() {
        getSelected();
    });

    $( "#select_hide" ).on( "click", function() {    
        if (g_showProject)
        {
            $("#select_hide").html(">"); 
            $("#project_list_all").hide(); 
            $("#computer_list_all").hide();             
            g_showProject = false;                     
        }
        else
        {
            $("#select_hide").html(g_trans.DBS_BUTTON_HIDE);             
            $("#project_list_all").show();
            $("#computer_list_all").show();             
            g_showProject = true;
        }
        graphSize();
        let selected = $("input[name='radio_credit']:checked").val()  
        initGraph();
        addData(selected);
    });

    ipcRenderer.on('translations', (event, dlg) => {
        g_trans = dlg;
        $("#trans_host_average").html( dlg.DBS_HOST_AVERAGE);
        $("#trans_host_total").html( dlg.DBS_HOST_TOTAL);
        $("#trans_user_average").html( dlg.DBS_USER_AVERAGE);
        $("#trans_user_total").html( dlg.DBS_USER_TOTAL);
        $("#trans_projects").html( dlg.DBS_PROJECTS);
        $("#trans_computers").html( dlg.DBS_COMPUTERS);
        $("#select_hide").html( dlg.DBS_BUTTON_HIDE);

    });
});

function getSelected()
{
    g_selProject = [];
    $('#project_list option:selected').each(function()
    {
        let sel = $(this).val()
        g_selProject.push(sel);
    });    

    g_selComputer = [];
    $('#computer_list option:selected').each(function()
    {
        let sel = $(this).val()
        g_selComputer.push(sel);
    });    

    let selected = $("input[name='radio_credit']:checked").val()  
    initGraph();
    addData(selected);
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

    gStatisticsChart = new Highcharts.chart({	
        chart: {
            events: {
                load: function () { // change legend symbol
                $(".highcharts-legend-item path").attr('stroke-width', 10);
            },
            redraw: function () { // change legend symbol
                $(".highcharts-legend-item path").attr('stroke-width', 10);
            }
            },
            zoomType: 'x',
            backgroundColor: 'rgb(245, 245, 245)',
            yAxis: {
                gridLineDashStyle: 'longdash'
            },
            renderTo: 'stats_chart',        
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

}

function graphSize()
{
    let iWidthSel = $("#project_list_all").width();
    let iWidth = $( window ).width();
    if (g_showProject)
    {
        iWidth -= iWidthSel;
        iWidth -= 34;
    }
    else
    {
        iWidth -= 58;
    }
    var iHeight  = $( window ).height();
    let iHeightRadio = $("#radio_credit").height();
    iHeight -= iHeightRadio;    
    iHeight -= 40;
    if (iHeight < 400) iHeight = 400;
    $('#stats_chart').css({width: iWidth, height: iHeight});
    if (gStatisticsChart != null)  gStatisticsChart.redraw()
}