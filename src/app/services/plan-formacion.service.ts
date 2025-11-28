import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Programa {
  id_detalle: number;
  nombre_programa: string;
  nombre_linea: string;
  nombre_nivel: string;
  nombre_titulo_programa: string;
  seleccionado?: boolean; // Añadido para manejo local
}

@Injectable({
  providedIn: 'root'
})
export class PlanFormacionService {
  private apiUrl = 'http://20.81.172.55:3900/api/planes-de-formacion/vista-programas-participante';


  constructor(private http: HttpClient) { }

  vistaProgramaParticipante(): Observable<Programa[]> {

   return this.http.get<Programa[]>(this.apiUrl);

  }
}
