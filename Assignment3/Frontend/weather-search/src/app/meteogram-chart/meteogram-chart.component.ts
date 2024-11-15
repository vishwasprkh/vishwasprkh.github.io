import { Component, Input, OnChanges } from '@angular/core';
import { Chart, ChartModule } from 'angular-highcharts';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import WindbarbModule from 'highcharts/modules/windbarb';

WindbarbModule(Highcharts);

interface Interval {
  startTime: string;
  values: {
    temperature: number;
    humidity: number;
    pressureSeaLevel: number;
    windSpeed: number;
    windDirection: number;
  };
}

@Component({
  selector: 'app-meteogram-chart',
  standalone: true,
  imports: [ CommonModule, ChartModule ],
  templateUrl: './meteogram-chart.component.html',
  styleUrl: './meteogram-chart.component.css'
})
export class MeteogramChartComponent implements OnChanges{
  @Input() hourlyData: any;
  hourlyFormattedData: any;
  chart: Chart | undefined;

  ngOnChanges(): void {
    if(this.hourlyData===undefined) return;
    const intervals: Interval[] = this.hourlyData.data.timelines[0].intervals;
    this.hourlyFormattedData = this.transformData(intervals);
    this.chart = new Chart({
      chart: {
        spacingLeft: 0,
        spacingRight: 0,
        plotBorderWidth: 1,
        height: 400,
        alignTicks: false,
      },
      title: {
        text: 'Hourly Weather (For Next 5 Days)',
        align: 'center',
        style: {
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }
      },
      tooltip: {
        shared: true,
        useHTML: true,
        headerFormat: '<small>{point.x:%A, %b %e, %H:%M}</small><br>'
      },
      xAxis: [{
        type: 'datetime',
        minPadding: 0,
        maxPadding: 0,
        tickInterval: 3600 * 2000,
        minorTickInterval: 3600 * 1000,
        gridLineWidth: 1,
        minorGridLineWidth: 1,
        tickLength: 0,
        gridLineColor: 'rgba(128, 128, 128, 0.2)',
        labels: {
          format: '{value:%H}'
        },
        crosshair: true,
        title: {
          text: null
        }
      }, {
        linkedTo: 0,
        type: 'datetime',
        tickInterval: 24 * 36e5,
        labels: {
          format: '{value:%a %b %e}',
        },
        opposite: true,
        title: {
          text: null
        }
      }],
      yAxis: [{
        title: {
          text: null
        },
        tickInterval: 5,
        labels: {
          format: '{value}°',
          style: {
            fontSize: '10px'
          },
          x: -3
        },
        gridLineColor: 'rgba(128, 128, 128, 0.1)'
      }, {
        title: {
          text: '',
        },
        labels: {
          enabled: false
        },
        opposite: true,
        gridLineWidth: 0
      }, {
        title: {
          text: ''
        },
        labels: {
          format: '{value}',
          style: {
            fontSize: '10px',
            color: '#EFAD3C'
          }
        },
        opposite: true,
        gridLineWidth: 0
      }],
      legend: {
        enabled: false
      },
      series: [{
        name: 'Temperature',
        data: this.hourlyFormattedData.temperatures,
        type: 'spline',
        marker: {
          enabled: false,
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y}°C</b><br/>'
        },
        zIndex: 1,
        color: '#F13638'
      }, {
        name: 'Humidity',
        data: this.hourlyFormattedData.humidity,
        type: 'column',
        color: '#87CCFE',
        yAxis: 1,
        pointPadding: 0,
        groupPadding: 0,
        tooltip: {
          valueSuffix: ' %'
        },
        dataLabels: {
          enabled: true,
          inside: false,
          style: {
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }
      }, {
        name: 'Air Pressure',
        data: this.hourlyFormattedData.pressures,
        type: 'spline',
        color: '#EFAD3C',
        dashStyle: 'Dot',
        marker: {
          enabled: false
        },
        yAxis: 2,
        tooltip: {
          valueSuffix: ' hPa'
        }
      }, {
        name: 'Wind',
        type: 'windbarb',
        id: 'windbarbs',
        color: '#524EBB',
        lineWidth: 1.5,
        data: this.hourlyFormattedData.winds.filter((_: any, i: number) => i % 2 === 0),
        vectorLength: 8,
        yOffset: 7,
        tooltip: {
          valueSuffix: ' m/s'
        }
      }]
    });
  }

  transformData(intervals: Interval[]): any {
    const temperatures: any[] = [];
    const humidity: any[] = [];
    const winds: any[] = [];
    const pressures: any[] = [];

    let totalPressure = 0;
    intervals.forEach(interval => {
      totalPressure += interval.values.pressureSeaLevel;
    });

    const avgPressure = totalPressure / intervals.length;

    intervals.forEach(interval => {
      const time = Date.parse(interval.startTime);
      const values = interval.values;
      temperatures.push({ x: time, y: Math.trunc(values.temperature) });
      humidity.push({ x: time, y: Math.trunc(values.humidity) });
      winds.push({ x: time, value: values.windSpeed, direction: values.windDirection });
      pressures.push({ x: time, y: Math.trunc(avgPressure) });
    });

    return { temperatures, humidity, winds, pressures };
  }
}
