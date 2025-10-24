import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MonitoreoService } from '../../../services/monitoreo.service';


interface Pregunta {
  id_campo: number;
  nombre_campo: string;
  opciones: string[];
}

@Component({
  selector: 'app-monitoreos',
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, RouterLink, RouterLinkActive],
  templateUrl: './monitoreos.component.html',
  styleUrl: './monitoreos.component.css'
})
export class MonitoreosComponent implements OnInit {
  monitoreoGeneralForm!: FormGroup;
  monitoreoDiagnosticoForm!: FormGroup;
  monitoreoAccesoFinancieroForm!: FormGroup; // Formulario para la sección estática "Acceso Financiero" (Paso 2 y 3)
  monitoreoDiagnosticoEmpresarialForm!: FormGroup; // Formulario para la sección dinámica "Diagnóstico Empresarial" (Paso 4)


  preguntasAccesoFinanciero: Pregunta[] = [];
  preguntasHogar: Pregunta[] = []; //13 preguntas extraidas de la base de datos
  preguntasDiagnosticoEmpresarial: Pregunta[] = []; //45 preguntas extraidas de la base de datos



  opciones: string[] = [];
  codigoCiiu = ['CIIU 1', 'CIIU 2', 'CIIU 3'];
  private preguntas: any[] = [];

  pasoActual: number = 1;
  preguntasPorPaso = 13;
  totalPasos = 4;
  pasoActualDiagnostico: number = 1;

  constructor(private fb: FormBuilder, private apiService: MonitoreoService) {
    // Inicializamos el formulario vacío
    this.monitoreoDiagnosticoForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.monitoreoGeneralForm = this.fb.group({
      grupoParticipante: ['', Validators.required],
      estadoParticipante: ['', Validators.required],
      perteneceAsociacion: ['', [Validators.required, Validators.email]],
      nombreAsociacion: [''],
      asociacionMujeres: ['', Validators.required],
      codigoCiiu: ['', Validators.required],
      sectorEmpresarial: [''],
      arriendoServicios: [''],
      educacion: [''],
      obligaciones: [''],
      gastosOcacionales: [''],
      gastosTotales: [''],
      trabajosIndependientes: [''],
      emprendimientos: [''],
      otrosFamiliares: [''],
      pension: [''],
      empleados: [''],
      otrosIngresos: [''],
      otrosExplique: [''],
      totalIngresos: [''],
      totalIngresosDependiente: [''],
      distribucionIngresos:['']

           // ✅ Segundo bloque de preguntas (Paso 2)
    });

    //preguntas de si y no
    this.loadPreguntasHogar();

    // Calculamos el número total de pasos basado en el total de preguntas
    this.totalPasos = Math.ceil(this.preguntas.length / this.preguntasPorPaso);

    // Creamos un FormControl por cada pregunta dinámicamente
    this.preguntas.forEach(pregunta => {
      const controlName = `pregunta_${pregunta.id}`;
      // Añadimos un control al formGroup con un valor inicial nulo y lo marcamos como requerido
      this.monitoreoDiagnosticoForm.addControl(
        controlName,
        this.fb.control(null, Validators.required)
      );
    });
  }

    loadPreguntasHogar(): void {
    // Llamada a la API para obtener las preguntas tipo M1 (109-121)
    this.apiService.getPreguntasMonitoreo().subscribe({
      next: (preguntas) => {
        this.preguntasHogar = preguntas;
        // Añadir dinámicamente los controles al formulario de diagnóstico
        preguntas.forEach(pregunta => {
          const controlName = `pregunta_${pregunta.id_campo}`;
          // Añadimos el control con el validador de requerido
          this.monitoreoDiagnosticoForm.addControl(controlName, new FormControl('', Validators.required));
        });
        console.log('Preguntas de hogar cargadas y formulario actualizado.');
      },
      error: (err) => {
        console.error('Error al cargar preguntas del hogar:', err);
        // Manejo de error: podrías mostrar un mensaje al usuario
      }
    });
  }

  get preguntasPasoActualHogar(): Pregunta[] {
    const inicio = (this.pasoActualDiagnostico - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntasHogar.slice(inicio, fin);
  }

  get preguntasPasoActual(): Pregunta[] {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntasHogar.slice(inicio, fin);
    }



    // ✅ SOLUCIÓN: Agrega el método 'atras()'
  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }


  // ✅ SOLUCIÓN: Agrega el método 'siguiente()'
  siguiente(): void {
    if (this.pasoActual < this.totalPasos) {
      this.pasoActual++;
    }
  }

  guardarDiagnostico(): void {
    if (this.monitoreoDiagnosticoForm.valid) {
      console.log('Formulario válido. Respuestas:');
      console.log(this.monitoreoDiagnosticoForm.value);
      // Aquí iría la lógica para enviar los datos a tu backend
      alert('Diagnóstico guardado con éxito. Revisa la consola para ver los datos.');
    } else {
      console.error('El formulario no es válido. Faltan respuestas.');
      // Opcional: Marcar todos los campos como "tocados" para mostrar errores
      this.monitoreoDiagnosticoForm.markAllAsTouched();
      alert('Por favor, responde todas las preguntas antes de guardar.');
    }
  }
}
