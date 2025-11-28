import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Define la estructura esperada para las preguntas de Diagnóstico/Monitoreo
 * que vienen del backend.
 */
export interface DiagnosticoPregunta {
  id_campo: number;      // ID único de la pregunta (numérico)
  nombre_campo: string;  // Texto de la pregunta
  opciones: string[];    // Array de opciones de respuesta (debe ser ['Sí', 'No'])
}

@Injectable({
  providedIn: 'root'
})
export class MonitoreoService {
  // URL de la API para obtener las preguntas de Monitoreo
  // El endpoint 'M1' indica que son las preguntas de monitoreo.
  private apiUrl = 'http://20.81.172.55:3900/api/formularios/por-tipo/M1';

  // Opciones estándar para las preguntas de Sí/No
  private opcionesSiNo: string[] = ['Sí', 'No'];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene las preguntas del monitoreo desde el backend.
   * La respuesta de la API es mapeada para asegurar que las opciones sean 'Sí'/'No'
   * y que cumpla con la estructura DiagnosticoPregunta.
   * * @returns Observable de DiagnosticoPregunta[]
   */
  getPreguntasMonitoreo(): Observable<DiagnosticoPregunta[]> {
    console.log(`Realizando consulta a: ${this.apiUrl}`);

    return this.http.get<DiagnosticoPregunta[]>(this.apiUrl).pipe(
      // Mapeamos la respuesta para normalizar el campo de opciones,
      // forzándolas a ser 'Sí' y 'No' para el componente actual de radio buttons.
      map(preguntas => preguntas.map(pregunta => ({
        ...pregunta,
        // Forzamos las opciones a ser ['Sí', 'No'] para mantener la coherencia
        // con el componente de radio buttons.
        opciones: this.opcionesSiNo,
      }))),
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores de la solicitud HTTP.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido. Intenta nuevamente.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = `Error del lado del cliente: ${error.error.message}`;
    } else {
      // El backend retornó un código de respuesta fallido
      errorMessage = `Error del servidor: Código ${error.status}, mensaje: ${error.message}`;
    }
    console.error('Ocurrió un error al obtener las preguntas:', errorMessage);
    // Retornamos un Observable con un error que será manejado en el componente
    return throwError(() => new Error(errorMessage));
  }
}
