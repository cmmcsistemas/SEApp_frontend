import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracterizacionColectivosComponent } from './caracterizacion-colectivos.component';

describe('CaracterizacionColectivosComponent', () => {
  let component: CaracterizacionColectivosComponent;
  let fixture: ComponentFixture<CaracterizacionColectivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaracterizacionColectivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaracterizacionColectivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
