import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracterizacionKoboDiagnosticoComponent } from './caracterizacion-kobo-diagnostico.component';

describe('CaracterizacionKoboDiagnosticoComponent', () => {
  let component: CaracterizacionKoboDiagnosticoComponent;
  let fixture: ComponentFixture<CaracterizacionKoboDiagnosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaracterizacionKoboDiagnosticoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaracterizacionKoboDiagnosticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
