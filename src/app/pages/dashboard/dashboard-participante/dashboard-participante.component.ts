import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ViewChild, OnInit, ElementRef, AfterViewInit, Inject, PLATFORM_ID} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js/auto';


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

  @ViewChild('radarCanvas') radarCanvas!: ElementRef;
  radarChart!: Chart;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
   // console.log('Datos de perfiles', this.perfiles);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createRadarChart(); // Ahora creamos el gráfico de radar
    } else {
      console.log('No se ejecuta createRadarChart en el servidor');
    }
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

 }


