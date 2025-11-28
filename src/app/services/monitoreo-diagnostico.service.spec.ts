import { TestBed } from '@angular/core/testing';

import { MonitoreoDiagnosticoService } from './monitoreo-diagnostico.service';

describe('MonitoreoDiagnosticoService', () => {
  let service: MonitoreoDiagnosticoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitoreoDiagnosticoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
