import { TestBed } from '@angular/core/testing';

import { PlanFormacionService } from './plan-formacion.service';

describe('PlanFormacionService', () => {
  let service: PlanFormacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanFormacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
