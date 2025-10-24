import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { DiagnosticoService, DiagnosticoPregunta } from '../../../../services/diagnostico.service';
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-diagnostico',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './diagnostico.component.html',
  styleUrl: './diagnostico.component.css'
})

export class DiagnosticoComponent implements OnInit, OnDestroy {
  diagnosticoForm!: FormGroup;
  preguntas: DiagnosticoPregunta[] = [];


  pasoActual: number = 1;
  preguntasPorPaso = 10;
  totalPasos = 0;
  totalPreguntas = 0;
  contador = 0;

  private formValueChangesSubscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private diagnosticoService: DiagnosticoService) {
    // Inicializamos el formulario vacío
    this.diagnosticoForm = this.fb.group({});
 }

  ngOnInit(): void {
    this.diagnosticoService.getPreguntasDiagnostico().subscribe(
      (data) => {
        this.preguntas = data;
        this.totalPasos = Math.ceil(this.preguntas.length / this.preguntasPorPaso);
        this.totalPreguntas = this.preguntas.length;
        this.inicializarFormulario();
        this.formValueChangesSubscription.add(
            this.diagnosticoForm.valueChanges.subscribe(() => {
                this.actualizarContador(); // 👈 Llama al contador con cada cambio
            })
        );
      },
      (error) => {
        console.error('Error al obtener las preguntas del diagnóstico:', error);
        // Manejo de errores: por ejemplo, mostrar un mensaje al usuario
        alert('Hubo un error al cargar las preguntas. Por favor, inténtelo de nuevo más tarde.');
      }
    );


  }

  ngOnDestroy(): void {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }

  private inicializarFormulario(): void {
    this.preguntas.forEach(pregunta => {
      const controlName = `pregunta_${pregunta.id_campo}`;
      this.diagnosticoForm.addControl(
        controlName,
        this.fb.control(null, Validators.required)
      );
    });
  }

  get preguntasPasoActual(): DiagnosticoPregunta[] {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntas.slice(inicio, fin);
  }

  actualizarContador(): void {
    let count = 0;
    // Recorre todos los controles del formulario
    for (const controlName in this.diagnosticoForm.controls) {
      if (this.diagnosticoForm.controls.hasOwnProperty(controlName)) {
        const control = this.diagnosticoForm.controls[controlName];
        // Comprueba si el control tiene un valor que no sea nulo o un string vacío
        if (control.value !== null && control.value !== '' && (typeof control.value !== 'string' || control.value.trim() !== '')) {
          count++;
        }
      }
    }
    this.contador = count;
    console.log(`Preguntas completadas: ${this.contador} de ${this.preguntas.length}`);
  }

  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  siguiente(): void {
    // Validar las preguntas del paso actual antes de avanzar
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    const preguntasPaso = this.preguntas.slice(inicio, fin);

    let pasoValido = true;
    preguntasPaso.forEach(pregunta => {
        const control = this.diagnosticoForm.get(`pregunta_${pregunta.id_campo}`);
        if (control && control.invalid) {
            control.markAsTouched(); // Para que se muestren los errores
            pasoValido = false;
        }
    });

    if (pasoValido && this.pasoActual < this.totalPasos) {
      this.pasoActual++;
    } else if (pasoValido && this.pasoActual === this.totalPasos) {
      this.guardarDiagnostico();
    } else {
        alert('Por favor, responde todas las preguntas antes de avanzar.');
    }
  }

  guardarDiagnostico(): void {
    if (this.diagnosticoForm.valid) {
      console.log('Formulario válido. Respuestas:');
      console.log(this.diagnosticoForm.value);
      alert('Diagnóstico guardado con éxito. Revisa la consola para ver los datos.');
    } else {
      console.error('El formulario no es válido. Faltan respuestas.');
      this.diagnosticoForm.markAllAsTouched();
      alert('Por favor, responde todas las preguntas antes de guardar.');
    }
  }
}
