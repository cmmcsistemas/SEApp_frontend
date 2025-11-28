import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DiagnosticoEmpresarialPregunta {
  id_campo: number;      // ID único de la pregunta (numérico)
  nombre_campo: string;  // Texto de la pregunta
  opciones: string[];    // Array de opciones de respuesta
}


@Injectable({
  providedIn: 'root'
})
export class MonitoreoDiagnosticoService {
  private apiUrl = 'http://20.81.172.55:3900/api/formularios/por-tipo/M1-Diagnostico';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene las preguntas del diagnóstico desde el backend.
   * @returns Un Observable con el array de preguntas.
   */
  getPreguntasDiagnostico(): Observable<DiagnosticoEmpresarialPregunta[]> {
    return this.http.get<DiagnosticoEmpresarialPregunta[]>(this.apiUrl);
  }
}
