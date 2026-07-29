import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, Plus, Filter, X, Download } from 'lucide-angular';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  ReporteParticipantesService,
  ColumnaReporte,
  FiltrosListado,
} from '../../../services/reporte-participantes.service';

@Component({
  selector: 'app-dashboard-listado-participantes',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
  templateUrl: './dashboard-listado-participantes.component.html',
  styleUrl: './dashboard-listado-participantes.component.css',
})
export class DashboardListadoParticipantesComponent implements OnInit {
  private reporteService = inject(ReporteParticipantesService);

  // Íconos de Lucide
  iconPlus = Plus;
  iconSearch = Search;
  iconFilter = Filter;
  iconClear = X;
  iconDownload = Download;

  // Datos de la tabla
  columnas: ColumnaReporte[] = [];
  datos: Array<Record<string, any>> = [];
  total = 0;

  // Opciones para los desplegables
  modulosDisponibles: string[] = [];
  proyectosDisponibles: string[] = [];

  isLoading = true;

  // Formulario de filtros
  filtros = new FormGroup({
    participante: new FormControl(''),
    nombres: new FormControl(''),
    apellidos: new FormControl(''),
    modulo: new FormControl(''),
    proyecto: new FormControl(''),
    agruparPorParticipante: new FormControl(false),
  });

  ngOnInit(): void {
    this.cargar();

    this.filtros.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => this.cargar());
  }

    private construirFiltros(): FiltrosListado {
    const { agruparPorParticipante, ...resto } = this.filtros.value;
    return {
      ...resto,
      ...(agruparPorParticipante ? { agrupar: 'participante' } : {}),
    } as FiltrosListado;
  }
  /** Consulta el listado aplicando los filtros actuales. */
  cargar(): void {
    this.isLoading = true;
    const valores = this.construirFiltros();

    this.reporteService.getListado(valores).subscribe({
      next: (resp) => {
        this.columnas = resp.columnas;
        this.datos = resp.datos;
        this.total = resp.total;
        this.modulosDisponibles = resp.opciones.modulos;
        this.proyectosDisponibles = resp.opciones.proyectos;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el listado de participantes:', err);
        this.isLoading = false;
      },
    });
  }

  limpiarFiltros(): void {
    this.filtros.reset({
      participante: '',
      nombres: '',
      apellidos: '',
      modulo: '',
      proyecto: '',
       agruparPorParticipante: false,
    });
  }

  descargarExcel(): void {
    const url = this.reporteService.urlExcel(this.construirFiltros());
    window.open(url, '_blank');
  }

  /** Muestra un guion cuando el valor está vacío. */
  mostrarValor(valor: any): string {
    if (valor === null || valor === undefined || valor === '') return '—';
    return String(valor);
  }

  trackByColumna = (_: number, c: ColumnaReporte) => c.key;
  trackByFila = (_: number, f: Record<string, any>) => f['id_respuesta'];
}
