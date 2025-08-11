import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitasImplementacionComponent } from './visitas-implementacion.component';

describe('VisitasImplementacionComponent', () => {
  let component: VisitasImplementacionComponent;
  let fixture: ComponentFixture<VisitasImplementacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitasImplementacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitasImplementacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
