// src/app/services/data-sharing.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  // Usamos BehaviorSubject para que los nuevos suscriptores reciban el último valor emitido.
  private grupoParticipanteSource = new BehaviorSubject<string>('');

  // Observable que los componentes pueden suscribirse para recibir actualizaciones.
  grupoParticipante$: Observable<string> = this.grupoParticipanteSource.asObservable();

  constructor() { }

  /**
   * Actualiza el valor del grupo de participante y notifica a los suscriptores.
   * @param grupo El nombre del grupo de participante seleccionado.
   */
  updateGrupoParticipante(grupo: string): void {
    this.grupoParticipanteSource.next(grupo);
  }
}
