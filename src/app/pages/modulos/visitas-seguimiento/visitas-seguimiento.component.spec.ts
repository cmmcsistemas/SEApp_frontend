import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitasSeguimientoComponent } from './visitas-seguimiento.component';

describe('VisitasSeguimientoComponent', () => {
  let component: VisitasSeguimientoComponent;
  let fixture: ComponentFixture<VisitasSeguimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitasSeguimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitasSeguimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
