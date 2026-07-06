import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private http = inject(HttpClient);
  private searchParticipanteUrl = 'http://20.81.172.55:3900/api/participantes/search';
  private searchColectivoUrl = 'http://20.81.172.55:3900/api/colectivo/searchColectivo';
  // Usamos BehaviorSubject para que los nuevos suscriptores reciban el último valor emitido.
  private grupoParticipanteSource = new BehaviorSubject<string>('');
  // Observable que los componentes pueden suscribirse para recibir actualizaciones.
  grupoParticipante$: Observable<string> = this.grupoParticipanteSource.asObservable();

  // 🟢 Cambiamos la lógica para enfocarnos en id_respuesta (Respuesta del Formulario)
  private idRespuestaSource = new BehaviorSubject<number | string | null>(null);
  idRespuesta$: Observable<number | string | null> = this.idRespuestaSource.asObservable();

  // 🟢 3. NUEVO: Estado del ID del Participante
  private idParticipanteSource = new BehaviorSubject<number | string | null>(null);
  idParticipante$: Observable<number | string | null> = this.idParticipanteSource.asObservable();

  // 🟢 4. NUEVO: Nombre del Participante para mostrar en la UI
  private nombreParticipanteSource = new BehaviorSubject<string | null>(null);
  nombreParticipante$: Observable<string | null> = this.nombreParticipanteSource.asObservable();

  private documentoParticipanteSource = new BehaviorSubject<string | number | null>(null);
  documentoParticipante$: Observable<string | number | null> = this.documentoParticipanteSource.asObservable();

  private participanteCompletoSource = new BehaviorSubject<any | null>(null);
  participanteCompleto$ = this.participanteCompletoSource.asObservable();

   private colectivoSeleccionadoSource = new BehaviorSubject<any | null>(null);
  colectivoSeleccionado$ = this.colectivoSeleccionadoSource.asObservable();


  updateGrupoParticipante(grupo: string): void {
    this.grupoParticipanteSource.next(grupo);
  }

  /**
   * 🟢 Almacena el id_respuesta generado por el backend al crear la cabecera del formulario.
   */
  setIdRespuesta(id: number | string): void {
    this.idRespuestaSource.next(id);
  }

  /**
   * 🟢 Recupera el id_respuesta para usarlo en peticiones add-data.
   */
  getIdRespuesta(): number | string | null {
    return this.idRespuestaSource.value;
  }

  cargarDatosParticipante(idParticipante: any): void {
    if (!idParticipante) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // La API requiere el parámetro 'query'
    this.http.get<any>(`${this.searchParticipanteUrl}?query=${idParticipante}`, { headers }).subscribe({
      next: (res) => {

        let p = null;

        if (Array.isArray(res)) {
          p = res[0];
        } else if (res.participants && Array.isArray(res.participants)) {
          p = res.participants[0]; // Estructura observada en image_2ba420.png
        } else if (res.data) {
          p = Array.isArray(res.data) ? res.data[0] : res.data;
        } else {
          p = res;
        }

        if (p) {
          const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim();
          this.nombreParticipanteSource.next(nombreCompleto || 'Participante Encontrado');
          this.documentoParticipanteSource.next(p.documento || null);
          this.idParticipanteSource.next(p.id_participante || idParticipante);

          this.participanteCompletoSource.next(p);

          console.log('✅ Datos de participante cargados en el servicio:', nombreCompleto);
        }
      },
      error: (err) => {
        console.error('❌ Erro al cargar datos extendidos del participante:', err);
      }
    });
  }

    /**
   * Carga datos de un Colectivo (Organización)
   */
  cargarDatosColectivo(idColectivo: any): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`${this.searchColectivoUrl}?query=${idColectivo}`, { headers }).subscribe({
      next: (res) => {
        const c = res.colectivos && res.colectivos.length > 0 ? res.colectivos[0] : (res.data || res);
        if (c) {
          this.colectivoSeleccionadoSource.next(c);
          this.nombreParticipanteSource.next(c.nombre_colectivo || c.colectivo);
          this.documentoParticipanteSource.next(c.nit);
          this.idParticipanteSource.next(c.id_colectivo);
        }
      },
      error: (err) => console.error('❌ Error al cargar colectivo:', err)
    });
  }
}
