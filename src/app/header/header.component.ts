import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, signal, inject, Injectable } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSharingService } from '../services/data-sharing.service';


@Component({
  selector: 'app-header',
  imports: [MatIconModule, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: 0}),
        animate('500ms ease-out', style({ opacity: 1, height: '*'}))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0, height: '0'}))
      ])

    ])
  ],
})
export class HeaderComponent {
  isProfileMenuOpen = signal(false); // Usando Angular Signals para el estado del menú
  isSearching = signal(false);
  searchQuery = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private dataSharingService = inject(DataSharingService);

  private logoutUrl = 'http://20.81.172.55:3900/api/user/logout';

  private searchUrl = 'http://20.81.172.55:3900/api/participantes/formulario-completo';
  /**
   * Alterna la visibilidad del menú desplegable del perfil
   */
  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(value => !value);
  }

   onSearch(): void {
     const query = this.searchQuery.trim();
    if (!query) return;

    this.isSearching.set(true);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Buscamos por id_respuesta o documento (la API detectará el parámetro)
    const isNumeric = /^\d+$/.test(query);
    const param = 'id_participante' ;
    const timestamp = new Date().getTime();
    const finalUrl = `${this.searchUrl}?${param}=${query}&_t=${timestamp}`;

    this.http.get<any>(finalUrl, {headers}).subscribe({
      next: (response) => {
        this.isSearching.set(false);
        console.log('Respuesta recibida en búsqueda:', response);
        const info = response?.data;
        let idParticipante = info?.id_participante;
        const nombreParticipante = info?.nombre || info?.participants?.nombre || response?.participants?.nombre;
        let idEncontrado =
          response?.data?.id_respuesta ||
          response?.formulario?.id_respuesta ||
          response?.id_respuesta ||
          (Array.isArray(response) ? response[0]?.id_respuesta : null);

        if (!idEncontrado && isNumeric && response) {
          idEncontrado = query;
        }

        if (idEncontrado) {
          // Notificamos a toda la aplicación del cambio de ID
          this.dataSharingService.setIdRespuesta(idEncontrado);
          this.dataSharingService.cargarDatosParticipante(idParticipante);

          console.log('Búsqueda exitosa con token. Sincronizando ID:', idEncontrado, 'Con nombre', nombreParticipante );
          alert(`La búsqueda fue exitosa para el formulario: ${idEncontrado}, del participante: ${idParticipante}`);
        } else {
          alert('No se encontró el registro solicitado');
        }
      },
      error: (err) => {
        this.isSearching.set(false);
        console.error('Error en búsqueda con JWT:', err);

        // Manejo básico de error de expiración de token (401)
        if (err.status === 401) {
          alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
          this.finalizarSesionLocal();
        } else {
          alert('Hubo un error al consultar la información.');
        }
      }
    });
  }
  /**
   * Realiza el cierre de sesión llamando a la API y limpiando los datos locales
   */
  logout(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(this.logoutUrl, {}, { headers }).subscribe({
      next: () => this.finalizarSesionLocal(),
      error: () => this.finalizarSesionLocal()
    });
  }

  /**
   * Limpia el almacenamiento local (tokens, datos de usuario) y redirige al login
   */
  private finalizarSesionLocal(): void {
    // Eliminamos el token de autenticación
    localStorage.removeItem('token');

    // Limpiamos el resto del almacenamiento para mayor seguridad
    localStorage.clear();

    // Redirigimos al usuario a la página de inicio de sesión
    this.router.navigate(['/login']);
  }
}
