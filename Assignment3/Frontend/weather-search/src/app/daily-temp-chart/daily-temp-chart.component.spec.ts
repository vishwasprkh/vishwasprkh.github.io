import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyTempChartComponent } from './daily-temp-chart.component';

describe('DailyTempChartComponent', () => {
  let component: DailyTempChartComponent;
  let fixture: ComponentFixture<DailyTempChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyTempChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyTempChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
