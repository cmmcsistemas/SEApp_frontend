import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataSharingService } from '../../../services/data-sharing.service'; // Asegúrate que la ruta sea correcta
import { Subscription } from 'rxjs';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-caracterizacion',
  imports: [RouterLink, RouterOutlet, CommonModule, RouterLinkActive],
  templateUrl: './caracterizacion.component.html',
  styleUrls: ['./caracterizacion.component.css']
})
export class CaracterizacionComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  showUnidadNegocio = false;
  showIdeaNegocio = false;

  constructor(private dataSharingService: DataSharingService) {}

  ngOnInit(): void {
    // Suscribirse al servicio para escuchar cambios
    this.subscription = this.dataSharingService.grupoParticipante$.subscribe(grupo => {
      // Habilitar los enlaces según el grupo seleccionado
      this.showUnidadNegocio = grupo === '2';
      this.showIdeaNegocio = grupo === '1';
    });
  }

  ngOnDestroy(): void {
    // Es una buena práctica desuscribirse para evitar fugas de memoria
    this.subscription.unsubscribe();
  }
}
