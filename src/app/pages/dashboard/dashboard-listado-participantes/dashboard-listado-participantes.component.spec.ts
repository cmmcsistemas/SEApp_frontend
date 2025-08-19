import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardListadoParticipantesComponent } from './dashboard-listado-participantes.component';

describe('DashboardListadoParticipantesComponent', () => {
  let component: DashboardListadoParticipantesComponent;
  let fixture: ComponentFixture<DashboardListadoParticipantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardListadoParticipantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardListadoParticipantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
