import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // 🟢 Importación de ReactiveFormsModule
import { Participante, ParticipanteService } from '../../../services/participante.service';
import { LucideAngularModule, Search, Plus, SortAsc, Filter } from 'lucide-angular';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-dashboard-listado-participantes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule, RouterLink],
  templateUrl: './dashboard-listado-participantes.component.html',
  styleUrl: './dashboard-listado-participantes.component.css'
})
export class DashboardListadoParticipantesComponent implements OnInit {
// Íconos de Lucide (reemplazo de mat-icon)
  iconPlus = Plus;
  iconSearch = Search;
  iconSort = SortAsc;
  iconFilter = Filter;

  // Datos
  participantesOriginales: Participante[] = [];
  participantesFiltrados: Participante[] = [];

  // Búsqueda
  busquedaControl = new FormControl('');

  // Estado de carga
  isLoading: boolean = true;

  // Mapeo para los encabezados de la tabla
  columnasVisibles = [
    { key: 'nombre_completo', label: 'Nombre' },
    { key: 'proyecto', label: 'Proyecto' },
    { key: 'documento', label: 'Número de Identificación' },
    { key: 'caracterizacion_finalizada', label: 'Caracterización finalizada' },
    { key: 'monitoreo_finalizado', label: 'Monitoreo finalizado' },
    { key: 'plan_formacion_finalizado', label: 'Plan de formación finalizado' },
    { key: 'visita_implementacion_finalizada', label: 'Visita de implementación finalizada' },
    { key: 'visita_seguimiento_finalizada', label: 'Visita de seguimiento finalizada' },
  ];

  constructor(private participanteService: ParticipanteService) {
    // Inicializar Lucide Icons
    LucideAngularModule.pick({ Search, Plus, SortAsc, Filter });
  }

  ngOnInit(): void {
    this.cargarParticipantes();
    this.setupBusquedaListener();
  }

  /**
   * Carga los participantes desde el servicio
   */
  cargarParticipantes(): void {
    this.isLoading = true;
    this.participanteService.getListadoParticipantes().subscribe({
      next: (data: Participante[]) => {
        this.participantesOriginales = data;
        this.participantesFiltrados = [...this.participantesOriginales];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar la lista de participantes:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Configura el listener de búsqueda con debounce
   */
  setupBusquedaListener(): void {
    this.busquedaControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.aplicarFiltro(query || '');
      });
  }

  /**
   * Aplica el filtro de búsqueda por nombre o documento
   */
  aplicarFiltro(query: string): void {
    const lowerCaseQuery = query.toLowerCase();

    if (!lowerCaseQuery) {
      this.participantesFiltrados = [...this.participantesOriginales];
      return;
    }

    this.participantesFiltrados = this.participantesOriginales.filter(p => {
      const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
      return nombreCompleto.includes(lowerCaseQuery) || p.documento.includes(lowerCaseQuery);
    });
  }

  getSiNo(value: boolean): string {
    return value ? 'Sí' : 'No';
  }
}
