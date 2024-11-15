import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayViewTableComponent } from './day-view-table.component';

describe('DayViewTableComponent', () => {
  let component: DayViewTableComponent;
  let fixture: ComponentFixture<DayViewTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayViewTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayViewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
