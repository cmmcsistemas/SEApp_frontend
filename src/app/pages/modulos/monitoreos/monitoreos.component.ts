import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';


interface Pregunta {
  id: number;
  texto: string;
}

@Component({
  selector: 'app-monitoreos',
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink, RouterLinkActive],
  templateUrl: './monitoreos.component.html',
  styleUrl: './monitoreos.component.css'
})
export class MonitoreosComponent implements OnInit {
  monitoreoGeneralForm!: FormGroup;
  monitoreoDiagnosticoForm!: FormGroup;

  preguntas: Pregunta[] = [];
  opciones: string[] = [];
  codigoCiiu = [
    'EMPRENDEDOR',
    'MICROEMPRESARIO'
  ];

  pasoActual: number = 1;
  preguntasPorPaso = 10;
  totalPasos = 0;

  constructor(private fb: FormBuilder) {
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
      nacionalidad: [''],
      expedidaEn: [''],
      fechaExpedicion: [''],
      fechaNacimiento: [''],
            // ✅ Segundo bloque de preguntas (Paso 2)
      edad: [''],
      paisResidencia: [''],
      departamentoResidencia: [''],
      municipioResidencia: [''],
      localidad: [''],
      entornoResidencia: [''],
      direccion: [''],
      indicativo: [''],
      numeroCelular: [''],
    });
    // Llenamos el array con las 70 preguntas
    this.inicializarPreguntas();


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

    get preguntasPasoActual(): Pregunta[] {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntas.slice(inicio, fin);
    }

    // Método para generar las 70 preguntas
  inicializarPreguntas(): void {
    for (let i = 1; i <= 45; i++) {
      this.preguntas.push({
        id: i,
        // Texto de ejemplo. Puedes cargar esto desde un servicio o un archivo JSON.
        texto: `Pregunta número ${i}: ¿Descripción de la pregunta va aquí?`
      });
    }
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
