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


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit, AfterViewInit{



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

  @ViewChild('barCanvas') barCanvas!: ElementRef;
  barChart!: Chart;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
   // console.log('Datos de perfiles', this.perfiles);
  }

  ngAfterViewInit(): void { // Mueve la creación del gráfico aquí
  if (isPlatformBrowser(this.platformId)){
    console.log('barCanvas en ngAfterViewInit:', this.barCanvas);
    this.createBarChart();
  } else {
    console.log('No se ejecuta createBarChart en el servidor');
  }
  }


  createBarChart(): void {
    if (this.barCanvas?.nativeElement) {
      const data: ChartData<'bar'> = {
        labels: ['Emprendedor', 'Empleabilidad'],
        datasets: [
          {
            label: 'Perfil',
            data: [this.perfiles[0]?.emprendedor, this.perfiles[0]?.empleabilidad],
            backgroundColor: ['rgba(135, 188, 37, 1)', 'rgba(126, 186, 39, 1)'],

          },
        ],
      };
      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: data,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100, // Establecer el máximo del eje Y al 100%
              title: {
                display: true,
                text: 'Porcentaje (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Categoría'
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      };

      this.barChart = new Chart(
        this.barCanvas.nativeElement,
        config
      );
    } else {
      console.error('Elemento canvas no encontrado en createBarChart!');
    }
  }


 }


