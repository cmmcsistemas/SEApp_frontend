import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaDeNegocioComponent } from './idea-de-negocio.component';

describe('IdeaDeNegocioComponent', () => {
  let component: IdeaDeNegocioComponent;
  let fixture: ComponentFixture<IdeaDeNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeaDeNegocioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaDeNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
