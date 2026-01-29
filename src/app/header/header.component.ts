import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, CommonModule, HttpClientModule],
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

  private http = inject(HttpClient);
  private router = inject(Router);

  private logoutUrl = 'http://20.81.172.55:3900/api/user/logout';

  /**
   * Alterna la visibilidad del menú desplegable del perfil
   */
  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(value => !value);
  }

  /**
   * Realiza el cierre de sesión llamando a la API y limpiando los datos locales
   */
  logout(): void {
    // Realizamos la petición de logout al servidor
    this.http.post(this.logoutUrl, {}).subscribe({
      next: () => {
        console.log('Sesión cerrada exitosamente en el servidor');
        this.finalizarSesionLocal();
      },
      error: (err: unknown) => {
        console.error('Error al cerrar sesión en el servidor, procediendo con limpieza local:', err);
        // Forzamos el cierre local incluso si la API falla por red o estado
        this.finalizarSesionLocal();
      }
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
