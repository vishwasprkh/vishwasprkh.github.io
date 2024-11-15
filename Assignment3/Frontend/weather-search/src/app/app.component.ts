import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherSearchFormComponent } from './weather-search-form/weather-search-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherSearchFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'weather-search';
}
