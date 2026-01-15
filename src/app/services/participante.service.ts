import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Participante {
  id_participante: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  // Campos dummy para el Dashboard, que simulan el estado de los procesos
  proyecto: string; // Asumimos que viene o se puede obtener
  caracterizacion_finalizada: boolean;
  monitoreo_finalizado: boolean;
  plan_formacion_finalizado: boolean;
  visita_implementacion_finalizada: boolean;
  visita_seguimiento_finalizada: boolean;
  //
  ruta_actual: string; // Ejemplo: 'M2'
  ruta_finalizada: number; // Progreso 1-6
  microempresario: string;
}

interface ApiResponse {
  status: string;
  message: string;
  participants: Participante[]; // Aquí están los datos reales
}

interface SearchResponse {
  status: string;
  message: string;
  total: number;
  participants: Participante[]; // La API de búsqueda usa 'participants' (plural)
}

@Injectable({
  providedIn: 'root'
})
export class ParticipanteService {

  private apiUrl = 'http://20.81.172.55:3900/api/participantes/list/';

  private apiDetailUrl = 'http://20.81.172.55:3900/api/participantes/search';


  constructor(private http: HttpClient) { }

  getListadoParticipantes(): Observable<Participante[]> {

    // 🟢 CÓDIGO CORREGIDO PARA LA API REAL
    // Usamos el pipe y map para extraer el array de la propiedad 'participantes'
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      // Mapeamos la respuesta para extraer SOLO el array 'participantes'
      map(response => {
        // Aseguramos que los campos de estado (que faltan en la respuesta API)
        // tengan valores por defecto para que la interfaz Participante se cumpla.
        // Asignamos un valor 'false' por defecto para que el dashboard funcione.
        return response.participants.map(p => ({
          ...p,
          proyecto: p.proyecto || 'N/A', // Usar el proyecto si existe
          caracterizacion_finalizada: false,
          monitoreo_finalizado: false,
          plan_formacion_finalizado: false,
          visita_implementacion_finalizada: false,
          visita_seguimiento_finalizada: false,
                    // Añadir datos de dashboard (simulados)
          ruta_actual: (p as any).ruta_actual || 'CB',
          ruta_finalizada: (p as any).ruta_finalizada || 1,
          microempresario: (p as any).microempresario || 'Participante',
        }));
      })
    );

  }


  getParticipanteDetalle(documentoOrName: string): Observable<Participante | undefined> {
    // Reutilizamos el método searchParticipant
    return this.searchParticipant(documentoOrName).pipe(
        // Extraemos el primer elemento del array resultante
        map(results => results.length > 0 ? results[0] : undefined)
    );
  }

   searchParticipant(query: string): Observable<Participante[]> {
    if (!query || query.trim().length === 0) {
      return of([]); // Retorna array vacío si la búsqueda es vacía
    }

    // Construye el URL con el parámetro de consulta
    const url = `${this.apiDetailUrl}?query=${encodeURIComponent(query)}`;

    // La API devuelve SearchResponse (con la clave 'participants' en plural)
    return this.http.get<SearchResponse>(url).pipe(
      map(response => {
        // Devuelve el array de participantes, o un array vacío si es null/undefined
        const participantsArray = response.participants ?? [];

        // Mapea los resultados para asegurar que se cumplan las propiedades de dashboard
        return participantsArray.map(p => ({
          ...p,
          // Asignar valores por defecto a propiedades de Dashboard/Simuladas
          proyecto: (p as any).proyecto || 'N/A',
          caracterizacion_finalizada: (p as any).caracterizacion_finalizada ?? false,
          monitoreo_finalizado: (p as any).monitoreo_finalizado ?? false,
          plan_formacion_finalizado: (p as any).plan_formacion_finalizado ?? false,
          visita_implementacion_finalizada: (p as any).visita_implementacion_finalizada ?? false,
          visita_seguimiento_finalizada: (p as any).visita_seguimiento_finalizada ?? false,
          ruta_actual: (p as any).ruta_actual || 'CB',
          ruta_finalizada: (p as any).ruta_finalizada || 1,
          microempresario: (p as any).microempresario || 'Participante',
        }));
      })
    );
  }
}
