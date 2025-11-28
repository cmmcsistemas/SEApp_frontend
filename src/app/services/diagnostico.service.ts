import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para definir la estructura de la respuesta de la API
export interface DiagnosticoPregunta {
  id_campo: number;
  nombre_campo: string;
  opciones: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {
  private apiUrl = 'http://20.81.172.55:3900/api/formularios/por-tipo/2';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene las preguntas del diagnóstico desde el backend.
   * @returns Un Observable con el array de preguntas.
   */
  getPreguntasDiagnostico(): Observable<DiagnosticoPregunta[]> {
    return this.http.get<DiagnosticoPregunta[]>(this.apiUrl);
  }
}
