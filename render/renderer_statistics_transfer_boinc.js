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
let g_selComputer = null;

let g_trans = null;

$(document).ready(function() {
    ipcRenderer.send('statistics_transfer_boinc',"ready");
    graphSize();
    $(window).resize(function()
    {
//        SetTitlePosition();        
        graphSize();
    });

    ipcRenderer.on('computers', (event,computers) => {
        $("#computer_list").html(computers);
        getSelected();
    });

    ipcRenderer.on('graph', (event,data) => {       
        g_data = data;
        initGraph();
        addData();
    });

    $('#computer_list').on('change', function() {
        getSelected();
    });

    $( "#select_hide" ).on( "click", function() {
        if (g_showComputer)
        {
            $("#select_hide").html(">"); 
            $("#computer_list_all").hide();             
            g_showComputer = false;                     
        }
        else
        {
            $("#select_hide").html(g_trans.DBS_BUTTON_HIDE);             
            $("#computer_list_all").show();             
            g_showComputer = true;
        }
        graphSize(); 
        initGraph();
        addData();
    });

    ipcRenderer.on('translations', (event, dlg) => {
        g_trans = dlg;
        $("#trans_computers").html( dlg.DBS_COMPUTERS);
        $("#select_hide").html( dlg.DBS_BUTTON_HIDE);

    });
});

function getSelected()
{
    g_selComputer = [];
    $('#computer_list option:selected').each(function()
    {
        let sel = $(this).val()
        g_selComputer.push(sel);
    });    

    initGraph();
    addData();
}

function addData(selected)
{
    try {
        addDataSingleComputer(selected);
    } catch (error) {   
        var jj = 1;    
    }
}

function addDataSingleComputer()
{
    try {
        for (let i=0;i<g_selComputer.length;i++)        
        {        
            let computerName = g_selComputer[i];
            g_chartTitle = g_trans.DBS_STAT_TITLE;
            gStatisticsChart.setTitle({ text: g_chartTitle });                        
            for (let i=0;i<g_data.length;i++)
            {
                var dataArray = g_data[i];
                let seriesName = computerName;
                {
                    if (computerName === dataArray.computerName)
                    {
                        gStatisticsChart.addSeries({
                            name: seriesName + " ⇧",
                            type: 'line',
                            dashStyle: 'longdash',
                            data: dataArray.up,
                            visible: true,
                            animation: false                
                        });                        
                        gStatisticsChart.addSeries({
                            name: seriesName + " ⇓",
                            type: 'line',
                            data: dataArray.down,
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
                text: g_trans.DBS_STAT_TRANSFER
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
            formatter: function () {
                return this.points.reduce(function (s, point) {
                    return s + '<br/>' + point.series.name + ': ' + formatByteSize(point.y);
                }, '<b>' + Highcharts.dateFormat('%e - %b - %Y', new Date(this.x)) + '</b>');
            },
            shared: true            
            /*
            headerFormat: '<b></b><br>',
                pointFormat: '{series.name}, {point.x:%b %e}, ' + g_trans.DBS_STAT_TRANSFER + ': {${point.y/1024000}:.6f} ',
            valueSuffix: ' MB',
            */
        } 
	});	

}

function formatByteSize(nr)
{
    let str = "";
    let kb = 1024;
    let mb = kb*1024;
    let gb = mb*1024;

    switch (true)
    {
        case (nr > gb):
            str = (nr/gb).toFixed(2) + ' GB';            
        break;
        case (nr > mb):
            str = (nr/mb).toFixed(2) + ' MB';            
        break;
        case (nr > kb):
            str = (nr/kb).toFixed(2) + ' KB';            
        break;
        default:
            str = nr + ' B';
    }
    return str;
}

function graphSize()
{
    let iWidthSel = $("#computer_list_all").width();
    let iWidth = $( window ).width();
    if (g_showComputer)
    {
        iWidth -= iWidthSel;
        iWidth -= 34;        
    }
    else
    {
        iWidth -= 58;
    }
    var iHeight  = $( window ).height();
    iHeight -= 40;
    if (iHeight < 400) iHeight = 400;
    $('#stats_chart').css({width: iWidth, height: iHeight});
    if (gStatisticsChart != null)  gStatisticsChart.redraw()
}