import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

declare const google: any;

interface WeatherCode {
  description: string;
  url: string;
}

type WeatherCodeData = {
  [key: number]: WeatherCode;
};

@Component({
  selector: 'app-day-view-table',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './day-view-table.component.html',
  styleUrl: './day-view-table.component.css'
})

export class DayViewTableComponent {
  @Input() dailyData: any;
  @Input() latitude: number | undefined;
  @Input() longitude: number | undefined;
  @Output() dateClicked = new EventEmitter<number>();
  dayDataFormatted: any[] = [];


  WEATHERCODE_DATA: WeatherCodeData = {
    1000: {
        description: "Clear",
        url: "assets/images/WeatherSymbols/clear_day.svg"
    },
    1100: {
        description: "Mostly Clear",
        url: "assets/images/WeatherSymbols/mostly_clear_day.svg"
    },
    1101: {
        description: "Partly Cloudy",
        url: "assets/images/WeatherSymbols/partly_cloudy_day.svg"
    },
    1102: {
        description: "Mostly Cloudy",
        url: "assets/images/WeatherSymbols/mostly_cloudy.svg"
    },
    1001: {
        description: "Cloudy",
        url: "assets/images/WeatherSymbols/cloudy.svg"
    },
    2100: {
        description: "Light Fog",
        url: "assets/images/WeatherSymbols/fog_light.svg"
    },
    2000: {
        description: "Fog",
        url: "assets/images/WeatherSymbols/fog.svg"
    },
    4000: {
        description: "Drizzle",
        url: "assets/images/WeatherSymbols/drizzle.svg"
    },
    4200: {
        description: "Light Rain",
        url: "assets/images/WeatherSymbols/rain_light.svg"
    },
    4001: {
        description: "Rain",
        url: "assets/images/WeatherSymbols/rain.svg"
    },
    4201: {
        description: "Heavy Rain",
        url: "assets/images/WeatherSymbols/rain_heavy.svg"
    },
    5001: {
        description: "Flurries",
        url: "assets/images/WeatherSymbols/flurries.svg"
    },
    5100: {
        description: "Light Snow",
        url: "assets/images/WeatherSymbols/snow_light.svg"
    },
    5000: {
        description: "Snow",
        url: "assets/images/WeatherSymbols/snow.svg"
    },
    5101: {
        description: "Heavy Snow",
        url: "assets/images/WeatherSymbols/snow_heavy.svg"
    },
    6000: {
        description: "Freezing Drizzle",
        url: "assets/images/WeatherSymbols/freezing_drizzle.svg"
    },
    6200: {
        description: "Light Freezing Drizzle",
        url: "assets/images/WeatherSymbols/freezing_rain_light.svg"
    },
    6001: {
        description: "Freezing Rain",
        url: "assets/images/WeatherSymbols/freezing_rain.svg"
    },
    6201: {
        description: "Heavy Freezing Rain",
        url: "assets/images/WeatherSymbols/freezing_rain_heavy.svg"
    },
    7102: {
        description: "Light Ice Pellets",
        url: "assets/images/WeatherSymbols/ice_pellets_light.svg"
    },
    7000: {
        description: "Ice Pellets",
        url: "assets/images/WeatherSymbols/ice_pellets.svg"
    },
    7101: {
        description: "Heavy Ice Pellets",
        url: "assets/images/WeatherSymbols/ice_pellets_heavy.svg"
    },
    8000: {
        description: "Thunderstorm",
        url: "assets/images/WeatherSymbols/tstorm.svg"
    },
    1: {
        description: "Mostly Clear",
        url: "assets/images/WeatherSymbols/mostly_clear_day.svg"
    }
  }

  ngOnChanges(): void {
    if(this.dailyData===undefined) return;
    this.dayDataFormatted = this.transformData(this.dailyData);
  }

  transformData(rawData: any): any[] {
    return rawData.data.timelines[0].intervals.map((interval: any) => {
      const date = new Date(interval.startTime);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      return {
        Date: formattedDate,
        Status: this.WEATHERCODE_DATA[interval.values.weatherCode].description,
        Url: this.WEATHERCODE_DATA[interval.values.weatherCode].url,
        High: interval.values.temperatureMax,
        Low: interval.values.temperatureMin,
        Wind: interval.values.windSpeed
      };
    });
  }

  onDateClick(index: number) {
    this.dateClicked.emit(index);
  }
}
