import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmpliadaComponent } from './ampliada.component';

describe('AmpliadaComponent', () => {
  let component: AmpliadaComponent;
  let fixture: ComponentFixture<AmpliadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmpliadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmpliadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
