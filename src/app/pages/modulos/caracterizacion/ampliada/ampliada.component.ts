import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-ampliada',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ampliada.component.html',
  styleUrl: './ampliada.component.css',
  providers: [CurrencyPipe]
})
export class AmpliadaComponent {
  caracterizacionAmpliadaForm!: FormGroup;
  pasoActual: number = 1;

  opciones: string[] = ['Sí', 'No'];

  nivelesEscolaridad = [
    'ANALFABETA',
    'ESPECIALIZACIADO O MAESTRIA',
    'ND',
    'NINGUNA',
    'POSTGRADO',
    'PREESCOLAR',
    'PRIMARIA',
    'PRIMARIA INCOMPLETA',
    'SECUNDARIA',
    'SECUNDARIA INCOMPLETA',
    'SIN ESCOLARIDAD, PERO SABE LEER Y ESCRIBIR',
    'TECNICO',
    'TECNOLOGO',
    'TECNOLOGO INCOMPLETO',
    'UNIVERSIDAD INCOMPLETO',
    'UNIVERSIDAD PROFESIONAL'
  ];

  estadosCivil = [
    'SOLTERO(A)',
    'CASADO(A)',
    'UNION LIBRE',
    'DIVORCIADO(A)',
    'VIUDO(A)'
  ];

    tiposContrato = [
    'TERMINO FIJO',
    'TEMPORAL',
    'INDEFINIDO',
    'NO APLICA',
    'ND'
  ];

  promedioIngresosActividad: number =0;



  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
        this.caracterizacionAmpliadaForm = this.fb.group({
      formacion: ['', Validators.required],
      nivelEscolaridad: ['', Validators.required],
      estadoCivil: ['', [Validators.required, Validators.email]],
      vinculoLaboral: [''],
      antiguedad: ['', Validators.required],
      tipoContrato: [''],
      promedioIngresos: [''],
      independiente: [''],
      tieneRut: [''],
      promedioIngresosActividad: [''],
            // ✅ Segundo bloque de preguntas (Paso 2)
      cabezaFamilia: [''],
      hijos: ['', Validators.required],
      integratesHogar: [''],
      personasAcargo: [''],
      sistemaSalud: [''],
      sistemaSaludCubre: [''],
      cotizaPension: [''],
      ARL: [''],
      factoresProyecto: [''],
      observaciones: ['']

  }) }

    // ✅ SOLUCIÓN: Agrega el método 'atras()'
  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      console.log('Volviendo al paso:', this.pasoActual);
    }
  }

  // ✅ SOLUCIÓN: Agrega el método 'siguiente()'
  siguiente(): void {
        if (this.pasoActual < 2) { // Asume 3 bloques de 10 preguntas cada uno
      this.pasoActual++;
      console.log('Preguntas de:', this.pasoActual);
    } else {
      // Lógica para el último paso (por ejemplo, enviar el formulario completo)
      console.log('Formulario completado. Enviando...');
    }
  }

  guardarProgreso() {
    if (this.caracterizacionAmpliadaForm.valid) {
      const data = this.caracterizacionAmpliadaForm.value;
      const jsonString = JSON.stringify(data, null, 2);

      // Aquí puedes implementar la lógica para guardar el JSON
      console.log('Datos del formulario:', jsonString);
      // Ejemplo: Enviar a un servicio o guardar en localStorage
      // localStorage.setItem('caracterizacionForm', jsonString);
      alert('Progreso guardado correctamente.');
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

}
