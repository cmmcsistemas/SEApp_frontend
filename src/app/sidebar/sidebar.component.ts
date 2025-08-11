import { Component, signal, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, RouterModule, RouterOutlet, NavigationEnd, IsActiveMatchOptions } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {filter} from 'rxjs/operators';


@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, RouterOutlet, CommonModule,MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: 0}),
        animate('100ms ease-out', style({ opacity: 1}))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0}))
      ])

    ])
  ],
})
export class SidebarComponent implements OnInit {
isModulosOpen = signal(false);
isDashboardOpen = signal(false);

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Al iniciar, comprueba si alguna ruta de módulos está activa
    if (this.isAnyModuleActive()) {
      this.isModulosOpen.set(true); // Si es así, abre el sub-menú por defecto
      this.isDashboardOpen.set(false);
    }
    if (this.isAnyDashboardActive()) {
      this.isModulosOpen.set(false); // Si es así, abre el sub-menú por defecto
      this.isDashboardOpen.set(true);
    }

    // Escucha los cambios de ruta para mantener el estado del sub-menú
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Si navegamos fuera de una ruta de módulos, cierra el sub-menú
      if (!this.isAnyModuleActive()) {
        this.isModulosOpen.set(false);
      }
      if (!this.isAnyDashboardActive()) {
        this.isDashboardOpen.set(false);
      }
    });
  }

  toggleModulos(): void {
    this.isModulosOpen.set(!this.isModulosOpen());
  }

  toggleDashboard(): void {
    this.isDashboardOpen.set(!this.isDashboardOpen());
  }

  // Función corregida para comprobar si la ruta actual está dentro de los módulos
  isAnyModuleActive(): boolean {
    // Define las opciones de coincidencia
    const matchOptions: IsActiveMatchOptions = {
      paths: 'subset', // Usa 'subset' para coincidencia de prefijo
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    };

    return this.router.isActive('/modulos', matchOptions);
  }

  isAnyDashboardActive(): boolean {
    // Define las opciones de coincidencia
    const matchOptions: IsActiveMatchOptions = {
      paths: 'subset', // Usa 'subset' para coincidencia de prefijo
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    };

    return this.router.isActive('/dashboard', matchOptions);
  }

  // La función isActivate para routerLinkActive en los enlaces del sidebar
  // Puedes mantenerla si la usas, o dejar que routerLinkActive se encargue directamente
  isActivate(route: string): boolean {
    const matchOptions: IsActiveMatchOptions = {
      paths: 'exact', // O 'subset' si quieres que sea activo para subrutas también
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    };
    return this.router.isActive(route, matchOptions);
  }
}
