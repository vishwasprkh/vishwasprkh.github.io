import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Chart, ChartModule } from 'angular-highcharts'
import HC_more from 'highcharts/highcharts-more'
import * as Highcharts from 'highcharts'

HC_more(Highcharts);

@Component({
  selector: 'app-daily-temp-chart',
  standalone: true,
  imports: [ CommonModule, ChartModule ],
  templateUrl: './daily-temp-chart.component.html',
  styleUrl: './daily-temp-chart.component.css'
})
export class DailyTempChartComponent implements OnChanges{
  @Input() dailyData: any;
  dayDataFormatted: any[] = [];
  chart: Chart | undefined;

  ngOnChanges(): void {
    if(this.dailyData===undefined) return;
    this.dayDataFormatted = this.transformData(this.dailyData);

    if (this.dayDataFormatted.length > 0) {
      this.chart = new Chart({
        title: {
          text: 'Temperature Ranges (Min, Max)'
        },
        xAxis: {
          categories: this.dayDataFormatted.map(day => day.Date),
          tickLength: 10,
          tickWidth: 1
        },
        yAxis: {
          title: {
            text: null
          }
        },
        legend: {
          enabled: false
        },
        tooltip: {
          shared: true,
          crosshairs: true,
          valueSuffix: '°F'
        } as Highcharts.TooltipOptions,
        series: [
          {
            name: 'Temperature Range (°F)',
            type: 'arearange',
            data: this.dayDataFormatted.map(day => [day.Date, day.Low, day.High]),
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, '#f8a829'],
                [1, '#cce8fc'],
              ],
            },
            marker: {
              enabled: true,
              fillColor: '#2caefc' 
            },
          }
        ],
        chart: {
          type: 'arearange'
        }
      });
    }
  }

  transformData(rawData: any): any[] {
    return rawData.data.timelines[0].intervals.map((interval: any) => {
      const date = new Date(interval.startTime);
      const formattedDate = date.toLocaleDateString('en-us', {
        day: '2-digit',
        month: 'short'
      }).replace(',', '')
      return {
        Date: formattedDate,
        High: interval.values.temperatureMax,
        Low: interval.values.temperatureMin
      }
    })
  }
}
