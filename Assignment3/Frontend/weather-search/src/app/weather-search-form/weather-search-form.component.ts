import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { WeatherService } from './weather.service';
import { DayViewTableComponent } from '../day-view-table/day-view-table.component';
import { DailyTempChartComponent } from '../daily-temp-chart/daily-temp-chart.component';
import { MeteogramChartComponent } from '../meteogram-chart/meteogram-chart.component';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as faStarSolid, faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';

type WeatherCodeData = {
  [key: number]: string;
};

interface Suggestions {
  displayText: string;
  city: string;
  state: string;
}

function locationValidator(component: WeatherSearchFormComponent): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      
      const street = form.get('street')?.value;
      const city = form.get('city')?.value;
      const state = form.get('state')?.value;
      const currentLocation = form.get('currentLocation')?.value;

      const isRequiredFieldsFilled = street && city && state;
      const isLocationValid = currentLocation && component.iplatitude !== undefined && component.iplongitude !== undefined;

      if (isRequiredFieldsFilled || isLocationValid) {
          return null;
      }
      return { invalidLocation: true };
  };
}

@Component({
  standalone: true,
  selector: 'app-weather-search-form',
  templateUrl: './weather-search-form.component.html',
  styleUrls: ['./weather-search-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule, DayViewTableComponent, DailyTempChartComponent, MeteogramChartComponent, FontAwesomeModule],
})

export class WeatherSearchFormComponent implements OnInit {
  searchForm: FormGroup;
  googleGeocodeApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  apiUrl = 'https://assignment3-440202.wl.r.appspot.com/';
  googleApiKey = "AIzaSyDM8hn7BgNIIjOLPUxfGtIeOamc7vBb5To";
  states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", 
    "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
  stateAbbreviations: { [key: string]: string } = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", 
    "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", 
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", 
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", 
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", 
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", 
    "WI": "Wisconsin", "WY": "Wyoming"
  };
  suggestedCities: Suggestions[] = [];
  showSuggestions: boolean = false;
  selectSuggestions: boolean = false;
  favorites: any[] = [];
  city: string = '';
  state: string = '';
  dailyData: any;
  hourlyData: any;
  latitude: number | undefined;
  longitude: number | undefined;
  iplatitude: number | undefined;
  iplongitude: number | undefined;
  selectedTab: string = 'results';
  searched: boolean = false;
  selectedSubTab: string = 'dayView';
  isFavorite: boolean = false;
  isErrorFound: boolean = false;
  faStarSolid = faStarSolid;
  faStarRegular = faStarRegular;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
  faXTwitter = faXTwitter;
  faTrashAlt = faTrashAlt;
  showDetailsView: boolean = false;
  detailsIndex: number = 0;
  selectedDayWeather: any = {};
  map: google.maps.Map | undefined;
  loading: boolean = false;
  gettingLocation: boolean = false;
  animationClass: string = 'slide-in';
  weatherStatus: WeatherCodeData = {
    1000: "Clear",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    1001: "Cloudy",
    2100: "Light Fog",
    2000: "Fog",
    4000: "Drizzle",
    4200: "Light Rain",
    4001: "Rain",
    4201: "Heavy Rain",
    5001: "Flurries",
    5100: "Light Snow",
    5000: "Snow",
    5101: "Heavy Snow",
    6000: "Freezing Drizzle",
    6200: "Light Freezing Drizzle",
    6001: "Freezing Rain",
    6201: "Heavy Freezing Rain",
    7102: "Light Ice Pellets",
    7000: "Ice Pellets",
    7101: "Heavy Ice Pellets",
    8000: "Thunderstorm"
  };
  

  constructor(private fb: FormBuilder, private http: HttpClient, private weatherService: WeatherService, private cdr: ChangeDetectorRef) {
    this.searchForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      currentLocation: [false]
    }, {validators: locationValidator(this)});
  }

  ngOnInit(): void {
    this.searchForm.get('currentLocation')?.valueChanges.subscribe((useCurrentLocation: boolean) => {
      if (useCurrentLocation) {
        this.searchForm.get('street')?.disable();
        this.searchForm.get('city')?.disable();
        this.searchForm.get('state')?.disable();
      } else {
        this.searchForm.get('street')?.enable();
        this.searchForm.get('city')?.enable();
        this.searchForm.get('state')?.enable();
      }
    });

    this.searchForm.get('city')?.valueChanges.pipe(
      filter(value => value && value.trim().length > 0),
      switchMap(value => {
        if (this.selectSuggestions) {
          this.selectSuggestions = false;
          return [];
        }
        return this.weatherService.getAutocompleteSuggestions(value);
      })
    ).subscribe(suggestions => {
      this.suggestedCities = suggestions;
      this.showSuggestions = this.suggestedCities.length > 0;
    });
  }

  getLocation(): void {
    console.log(this.iplatitude, this.iplongitude);
    if(this.iplatitude && this.iplongitude){
      this.iplatitude = undefined;
      this.iplongitude = undefined;
      this.searchForm.updateValueAndValidity();
    }
    else{
      this.getCurrentLocation();
    }
  }

  selectSuggestion(suggestion: Suggestions): void {
    const fullState = this.stateAbbreviations[suggestion.state] || suggestion.state;
    this.searchForm.patchValue({
      city: suggestion.city,
      state: fullState
    });
    this.city = suggestion.city;
    this.state = fullState;
    setTimeout(() => {
      this.showSuggestions = false;
      this.suggestedCities = [];
      this.selectSuggestions = true;
    }, 100);
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.loading = true;
      this.gettingLocation = true;
      this.clearFields();
      if (this.searchForm.get('currentLocation')?.value && this.iplatitude && this.iplongitude) {
        this.latitude = this.iplatitude;
        this.longitude = this.iplongitude;
        this.getWeatherData(this.latitude, this.longitude);
      } else {
        const { street, city, state } = this.searchForm.value;
        this.getCoordinates(street, city, state);
      }
    }
  }

  async getCoordinates(street: string, city: string, state: string): Promise<void> {
    const address = `${street}, ${city}, ${state}`;
    try {
      const response: any = await lastValueFrom(
        this.http.get(this.googleGeocodeApiUrl, { 
          params: {
            address: address,
            key: this.googleApiKey
          }
        })
      );
      if (response.status === 'OK' && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;
        this.getWeatherData(latitude, longitude);
      } else {
        console.error('Error getting coordinates:', response);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.iplatitude = position.coords.latitude;
          this.iplongitude = position.coords.longitude;
          this.isErrorFound = false;
          this.searchForm.updateValueAndValidity();
        },
        (error) => {
          this.isErrorFound = true;
          console.error('Error getting current location:', error, "Error found: ", this.isErrorFound);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.isErrorFound = true;
    }
  }

  async getCityStateFromCoordinates(latitude: number, longitude: number): Promise<void> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleApiKey}`;
    try {
      const response: any = await lastValueFrom(this.http.get(url));
      if (response.status === 'OK' && response.results.length > 0) {
        const addressComponents = response.results[0].address_components;
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            this.city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            this.state = component.short_name; 
          }
        }
      } else {
        console.error('No results found');
      }
    } catch (error) {
      console.error('Geocoding API request failed', error);
    }
  }

  async getWeatherData(latitude: number, longitude: number): Promise<void> {
    this.latitude = latitude;
    this.longitude = longitude;
    this.gettingLocation = false;
    const daily = 'day';
    const hourly = 'hour';
    await this.getCityStateFromCoordinates(latitude, longitude);
    try {
      this.dailyData = await firstValueFrom(this.weatherService.getWeather(latitude.toString(), longitude.toString(), daily));
      this.hourlyData = await firstValueFrom(this.weatherService.getWeather(latitude.toString(), longitude.toString(), hourly));
      this.setSelectedDayWeather();
      this.searched = true;
      this.cdr.detectChanges();
      this.loading = false;
      this.gettingLocation = false;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      this.isErrorFound = true;
      this.loading = false;
    }
  }

  async getFavorites() {
    try {
      this.favorites = await lastValueFrom(this.http.get<any[]>(`${this.apiUrl}get-favourites`));
    } catch (error) {
      console.error('Error retrieving favorites:', error);
    }
  }

  async removeFavorite(fav: any) {
    const requestData = {
      city: fav.city,
      state: fav.state,
      latitude: fav.latitude,
      longitude: fav.longitude
    };
    try {
      await lastValueFrom(this.http.delete(`${this.apiUrl}remove-favourite`, { body: requestData }));
      this.favorites = this.favorites.filter(f => f !== fav);
      if (this.longitude==requestData.longitude && this.latitude==requestData.latitude){
        this.isFavorite = false;
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  async toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    const endpoint = this.isFavorite ? 'add-favourite' : 'remove-favourite';
    const requestData = {
      city: this.city,
      state: this.state,
      latitude: this.latitude,
      longitude: this.longitude
    };
    try {
      if (this.isFavorite) {
        await lastValueFrom(this.http.post(`${this.apiUrl}${endpoint}`, requestData));
      } else {
        await lastValueFrom(this.http.delete(`${this.apiUrl}${endpoint}`, { body: requestData }));
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  }
  
  onLocationClick(fav: any) {
    this.clearFields();
    this.city = fav.city,
    this.state = fav.state,
    this.latitude = fav.latitude,
    this.longitude = fav.longitude
    this.isFavorite = true;
    this.loading = true;
    this.gettingLocation = true;
    if(this.latitude && this.longitude){
      this.getWeatherData(this.latitude, this.longitude);
    }
  }

  showOrHideDetails() {
    this.searched = !this.searched;
    this.showDetailsView = !this.showDetailsView;
    if (this.showDetailsView) {
      this.animationClass = 'slide-in-right';
    } else {
        this.animationClass = 'slide-in-left';
    }
    setTimeout(() => {
      if (this.showDetailsView && this.selectedDayWeather && this.latitude && this.longitude) {
        this.loadMap(this.latitude, this.longitude);
      }
    }, 100);
  }

  async handleDateClick(index: number){
    this.detailsIndex = index;
    await this.setSelectedDayWeather();
    this.searched = false;
    this.showDetailsView = true;
      setTimeout(() => {
        if (this.showDetailsView && this.selectedDayWeather && this.latitude && this.longitude) {
          this.loadMap(this.latitude, this.longitude);
        }
    }, 100);
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  formatTime(timeString: string): string {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(timeString).toLocaleTimeString(undefined, options);
  }

  async setSelectedDayWeather(){
    const intervals = this.dailyData.data.timelines[0].intervals;

    if (intervals && intervals[this.detailsIndex]) {
      const dayData = intervals[this.detailsIndex];
      const values = dayData.values;

      this.selectedDayWeather = {
        Date: this.formatDate(dayData.startTime),
        Status: this.weatherStatus[values.weatherCode],
        MaxTemp: `${values.temperatureMax}°F`,
        MinTemp: `${values.temperatureMin}°F`,
        ApparentTemp: `${values.temperature}°F`,
        Sunrise: this.formatTime(values.sunriseTime),
        Sunset: this.formatTime(values.sunsetTime),
        Humidity: `${values.humidity}%`,
        Windspeed: `${values.windSpeed} km/h`,
        Visibility: `${values.visibility} km`,
        CloudCover: `${values.cloudCover}%`
      };
    }
  }
  
  async loadMap(lat: number, lng: number): Promise<void> {
    try{
      if (typeof google !== 'undefined' && google.maps && google.maps.importLibrary) {
        const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
        const { Marker } = await google.maps.importLibrary('marker') as any;
        const mapElement = document.getElementById('map') as HTMLElement;

        if (mapElement) {
          const map = new Map(mapElement, {
            center: { lat, lng },
            zoom: 14,
          });
          new Marker({
            position: { lat, lng },
            map,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
          });
        } else {
          console.error('Map element not found.');
        }
      } else {
        console.error('Google Maps is not available or the library has not loaded.');
      }
    } catch (error) {
      console.error('Error loading the Google Maps library:', error);
    }
  }

  clearForm(): void {
    this.searchForm.reset({
      street: '',
      city: '', 
      state: '',
      currentLocation: false
    });
    this.suggestedCities = [];
    this.searched = false;
    this.city = '';
    this.state = '';
    this.dailyData = [];
    this.hourlyData = [];
    this.isFavorite = false;
    this.detailsIndex = 0;
    this.showDetailsView = false;
    this.isErrorFound = false;
    this.selectedTab = 'results';
    this.animationClass = 'slide-in';
    this.loading = false;
    this.latitude = undefined;
    this.longitude = undefined;
    this.iplatitude = undefined;
    this.iplongitude = undefined;
    this.searchForm.updateValueAndValidity();
  }

  clearFields(): void {
    this.suggestedCities = [];
    this.searched = false;
    this.city = '';
    this.state = '';
    this.dailyData = [];
    this.hourlyData = [];
    this.isFavorite = false;
    this.detailsIndex = 0;
    this.showDetailsView = false;
    this.isErrorFound = false;
    this.selectedTab = 'results';
    this.selectedSubTab = 'dayView';
    this.animationClass = 'slide-in';
    this.loading = false;
  }

  async selectTab(tab: string) {
    if (tab === 'favorites') {
      await this.getFavorites();
    }
    this.selectedTab = tab;
  }

  selectSubTab(subTab: string) {
    this.selectedSubTab = subTab;
  }
}
