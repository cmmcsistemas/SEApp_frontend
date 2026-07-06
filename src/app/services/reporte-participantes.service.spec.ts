import { TestBed } from '@angular/core/testing';

import { ReporteParticipantesService } from './reporte-participantes.service';

describe('ReporteParticipantesService', () => {
  let service: ReporteParticipantesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporteParticipantesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
