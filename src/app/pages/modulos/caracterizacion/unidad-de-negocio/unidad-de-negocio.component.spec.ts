import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadDeNegocioComponent } from './unidad-de-negocio.component';

describe('UnidadDeNegocioComponent', () => {
  let component: UnidadDeNegocioComponent;
  let fixture: ComponentFixture<UnidadDeNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadDeNegocioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadDeNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
