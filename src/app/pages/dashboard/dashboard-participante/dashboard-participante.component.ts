import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ViewChild, OnInit, ElementRef, AfterViewInit, Inject, PLATFORM_ID} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js/auto';
import { Participante, ParticipanteService } from '../../../services/participante.service';

Chart.register(...registerables);

interface MonitoreoData {
  etiquetas: string[];
  data: number[];
  fecha: string;
  color: string;
}
interface Comment {
  user: string;
  cedula: string;
  contacto: string;
  grupo: string;
  proyecto: string[];
  total: number;
}

interface Perfil {
  emprendedor: number;
  empleabilidad: number;
}

interface RadarData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    pointBackgroundColor: string;
    pointBorderColor: string;
    pointHoverBackgroundColor: string;
    pointHoverBorderColor: string;
  }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-participante.component.html',
  styleUrl: './dashboard-participante.component.css'
})

export class DashboardParticipanteComponent implements OnInit, AfterViewInit{

  comments: Comment[] = [
    { user: 'Nombre del Usuario', cedula: '123456', contacto: '316 4537665', grupo: 'Emprendedor', proyecto: ['Bordando','CF3-'], total: 50 },
    // ... más objetos comment
  ];
  perfiles: Perfil[] = [
    {
      emprendedor: 80,
      empleabilidad: 23
    },
  ];

  participante: Participante | undefined;
  isLoading: boolean = true;

  @ViewChild('radarCanvas') radarCanvas!: ElementRef;
  radarChart!: Chart;


  rutaPasos = [
    { codigo: 'CB', completado: true },
    { codigo: 'CA', completado: true },
    { codigo: 'M1', completado: true },
    { codigo: 'M2', completado: true },
    { codigo: 'M3', completado: true },
    { codigo: 'M4', completado: false }
  ];

  constructor(
    private participanteService: ParticipanteService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const documentoParticipante = '49779308'; // Documento de Sofía Rodríguez
    this.cargarParticipante(documentoParticipante);
  }

  ngAfterViewInit(): void {
    if (this.participante) {
      this.createRadarChart();
    }
  }

  cargarParticipante(documentoOrName: string): void {
    this.isLoading = true;
    // 🟢 Usa el método getParticipanteDetalle, que ahora usa la API de búsqueda
    this.participanteService.getParticipanteDetalle(documentoOrName).subscribe({
      next: (data: Participante | undefined) => {
        this.participante = data;
        this.isLoading = false;
        // Si ya está listo el ViewChild, renderizar gráfico
        if (this.radarCanvas) {
          this.createRadarChart();
        }
      },
      error: (err) => {
        console.error('Error al cargar detalle del participante:', err);
        this.isLoading = false;
      }
    });
  }

createRadarChart(): void {
  if (this.radarCanvas?.nativeElement) {
    const data: ChartData<'radar'> = {
      labels: ['Desarrollo productivo', 'Innovación', 'Gestión ambiental', 'Desarrollo social', 'Mercadeo'],
      datasets: [
        {
          label: 'Monitoreo 1',
          data: [65, 59, 90, 81, 56],
          backgroundColor: 'rgba(135, 188, 37, 0.4)',
          borderColor: 'rgba(135, 188, 37, 1)',
          pointBackgroundColor: 'rgba(135, 188, 37, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(135, 188, 37, 1)'
        },
        {
          label: 'Monitoreo 2',
          data: [28, 48, 40, 19, 96],
          backgroundColor: 'rgba(126, 186, 39, 0.4)',
          borderColor: 'rgba(126, 186, 39, 1)',
          pointBackgroundColor: 'rgba(126, 186, 39, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(126, 186, 39, 1)'
        }
      ]
    };
    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100,
            pointLabels: {
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };
    this.radarChart = new Chart(this.radarCanvas.nativeElement, config);
  } else {
    console.error('Elemento canvas de radar no encontrado en createRadarChart!');
  }
}

  getRutaClass(index: number): string {
    if (!this.participante) return 'bg-gray-300 text-gray-700';

    // Suponemos que ruta_finalizada es el número de pasos completados (1 a 6)
    return index < this.participante.ruta_finalizada
      ? 'bg-green-600 text-white'
      : 'bg-gray-300 text-gray-700';
  }

  // Datos simulados para Plan de Formación y Visitas
  planFormacion = [
    { nombre: 'Desarrollo productivo y calidad', cantidad: 3 },
    { nombre: 'Desarrollo personal y familiar', cantidad: 2 },
    { nombre: 'Desarrollo organizacional', cantidad: 2 },
    { nombre: 'Desarrollo tecnológico', cantidad: 1 },
  ];

  visitasImplementacion = [
    { num: 1, fecha: '09/06/2023' },
    { num: 2, fecha: '09/06/2023' },
    { num: 3, fecha: '09/06/2023' },
  ];

  visitasSeguimiento = [
    { num: 1, fecha: '09/06/2024' },
  ];

 }


