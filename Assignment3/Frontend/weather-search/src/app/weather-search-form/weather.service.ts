import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, filter, map, Observable, of } from 'rxjs';

interface Suggestions {
  displayText: string;
  city: string;
  state: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://assignment3-440202.wl.r.appspot.com/';

  constructor(private http: HttpClient) {}

  getWeather(latitude: string, longitude: string, duration: string): Observable<any> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('duration', duration);
    return this.http.get(`${this.apiUrl}/weather`, { params });
  }

  getAutocompleteSuggestions(input: string): Observable<Suggestions[]> {
    return this.http.get<any>(`${this.apiUrl}/autocomplete`, { params: { input } }).pipe(
      filter(response => response.status === 'OK'),
      map(response => 
        response.predictions.map((prediction: { terms: { value: string; }[]; }) => {
          const city = prediction.terms[0]?.value || '';
          const state = prediction.terms[1]?.value || '';
          return {
            displayText: `${city}, ${state}`,
            city,
            state
          };
        })
      ),
      catchError(error => {
        console.error('Error fetching autocomplete suggestions:', error);
        return of([]);
      })
    );
  }
}
