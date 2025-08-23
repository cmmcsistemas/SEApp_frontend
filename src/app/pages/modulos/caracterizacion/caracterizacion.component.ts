import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataSharingService } from '../../../services/data-sharing.service'; // Asegúrate que la ruta sea correcta
import { Subscription } from 'rxjs';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-caracterizacion',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './caracterizacion.component.html',
  styleUrls: ['./caracterizacion.component.css']
})
export class CaracterizacionComponent implements OnInit, OnDestroy {
  grupoSeleccionado: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private dataSharingService: DataSharingService) {}

  ngOnInit(): void {
    // Nos suscribimos al observable del servicio
    this.subscription = this.dataSharingService.grupoParticipante$.subscribe(grupo => {
      this.grupoSeleccionado = grupo;
    });
  }

  ngOnDestroy(): void {
    // Es una buena práctica desuscribirse para evitar fugas de memoria
    this.subscription.unsubscribe();
  }
}