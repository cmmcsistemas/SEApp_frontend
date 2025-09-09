import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// Si tu componente es standalone (como se ve en la imagen)
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { DiagnosticoService, DiagnosticoPregunta } from '../../../../services/diagnostico.service';



@Component({
  selector: 'app-diagnostico',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './diagnostico.component.html',
  styleUrl: './diagnostico.component.css'
})

export class DiagnosticoComponent implements OnInit {
  diagnosticoForm!: FormGroup;
  preguntas: DiagnosticoPregunta[] = [];


  pasoActual: number = 1;
  preguntasPorPaso = 10;
  totalPasos = 0;

  constructor(private fb: FormBuilder, private diagnosticoService: DiagnosticoService) {
    // Inicializamos el formulario vacío
    this.diagnosticoForm = this.fb.group({});
 }

  ngOnInit(): void {
    this.diagnosticoService.getPreguntasDiagnostico().subscribe(
      (data) => {
        this.preguntas = data;
        this.totalPasos = Math.ceil(this.preguntas.length / this.preguntasPorPaso);
        this.inicializarFormulario();
      },
      (error) => {
        console.error('Error al obtener las preguntas del diagnóstico:', error);
        // Manejo de errores: por ejemplo, mostrar un mensaje al usuario
        alert('Hubo un error al cargar las preguntas. Por favor, inténtelo de nuevo más tarde.');
      }
    );
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
