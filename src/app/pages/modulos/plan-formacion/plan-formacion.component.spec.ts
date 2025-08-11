import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanFormacionComponent } from './plan-formacion.component';

describe('PlanFormacionComponent', () => {
  let component: PlanFormacionComponent;
  let fixture: ComponentFixture<PlanFormacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanFormacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanFormacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
