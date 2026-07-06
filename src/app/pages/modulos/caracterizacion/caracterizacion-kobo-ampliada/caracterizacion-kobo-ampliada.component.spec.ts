import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracterizacionKoboAmpliadaComponent } from './caracterizacion-kobo-ampliada.component';

describe('CaracterizacionKoboAmpliadaComponent', () => {
  let component: CaracterizacionKoboAmpliadaComponent;
  let fixture: ComponentFixture<CaracterizacionKoboAmpliadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaracterizacionKoboAmpliadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaracterizacionKoboAmpliadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
