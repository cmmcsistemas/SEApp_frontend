import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracterizacionFormularioDosComponent } from './caracterizacion-formulario-dos.component';

describe('CaracterizacionFormularioDosComponent', () => {
  let component: CaracterizacionFormularioDosComponent;
  let fixture: ComponentFixture<CaracterizacionFormularioDosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaracterizacionFormularioDosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaracterizacionFormularioDosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
