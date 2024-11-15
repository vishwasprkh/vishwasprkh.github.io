import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherSearchFormComponent } from './weather-search-form.component';

describe('WeatherSearchFormComponent', () => {
  let component: WeatherSearchFormComponent;
  let fixture: ComponentFixture<WeatherSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherSearchFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
