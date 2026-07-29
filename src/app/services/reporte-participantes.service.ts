// services/reporte-participantes.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { environment } from '../../environments/environment'; // ajusta la ruta si difiere

export interface ColumnaReporte {
  key: string;
  label: string;
  fija: boolean;
}

export interface OpcionesFiltro {
  modulos: string[];
  proyectos: string[];
}

export interface RespuestaListado {
  columnas: ColumnaReporte[];
  datos: Array<Record<string, any>>;
  total: number;
  opciones: OpcionesFiltro;
}

export interface FiltrosListado {
  participante?: string;
  nombres?: string;
  apellidos?: string;
  modulo?: string;
  proyecto?: string;
  agrupar?: 'participante';
}

@Injectable({ providedIn: 'root' })
export class ReporteParticipantesService {
  private http = inject(HttpClient);
  private apiUrl = `http://20.81.172.55:3900/api/formularios/reportes/participantes`;
private apiUrlexcel = `http://20.81.172.55:3900/api/formularios/informe-kobo-participantes`;


  /** Trae las respuestas de formularios con sus columnas (label) y filtros aplicados. */
  getListado(filtros: FiltrosListado = {}): Observable<RespuestaListado> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor != null && `${valor}`.trim() !== '') {
        params = params.set(clave, `${valor}`.trim());
      }
    }
    return this.http.get<RespuestaListado>(`${this.apiUrl}`, { params });
  }

  /** URL del Excel respetando los mismos filtros (para abrir/descargar). */
  urlExcel(filtros: FiltrosListado = {}): string {
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor != null && `${valor}`.trim() !== '') {
        params.set(clave, `${valor}`.trim());
      }
    }
    const qs = params.toString();
    return `${this.apiUrlexcel}${qs ? '?' + qs : ''}`;
  }
}
