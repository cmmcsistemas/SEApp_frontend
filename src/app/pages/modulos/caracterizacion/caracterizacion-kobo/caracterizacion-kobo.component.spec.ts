import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracterizacionKoboComponent } from './caracterizacion-kobo.component';

describe('CaracterizacionKoboComponent', () => {
  let component: CaracterizacionKoboComponent;
  let fixture: ComponentFixture<CaracterizacionKoboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaracterizacionKoboComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaracterizacionKoboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
