import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, CommonModule],
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

  constructor() { }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.set(!this.isProfileMenuOpen());
  }

  // Si necesitas manejar la búsqueda, podrías tener una propiedad:
  // searchTerm: string = '';
  // onSearch() {
  //   console.log('Buscando:', this.searchTerm);
  //   // Lógica para enviar la búsqueda
  // }
}
