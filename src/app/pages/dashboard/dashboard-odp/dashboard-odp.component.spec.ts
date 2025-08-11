import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOdpComponent } from './dashboard-odp.component';

describe('DashboardOdpComponent', () => {
  let component: DashboardOdpComponent;
  let fixture: ComponentFixture<DashboardOdpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOdpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardOdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
