import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteogramChartComponent } from './meteogram-chart.component';

describe('MeteogramChartComponent', () => {
  let component: MeteogramChartComponent;
  let fixture: ComponentFixture<MeteogramChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeteogramChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeteogramChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
