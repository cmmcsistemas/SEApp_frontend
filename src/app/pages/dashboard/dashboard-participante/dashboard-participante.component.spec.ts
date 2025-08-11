import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardParticipanteComponent } from './dashboard-participante.component';

describe('DashboardParticipanteComponent', () => {
  let component: DashboardParticipanteComponent;
  let fixture: ComponentFixture<DashboardParticipanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardParticipanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardParticipanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
