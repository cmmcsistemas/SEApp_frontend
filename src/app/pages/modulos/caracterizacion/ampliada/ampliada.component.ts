import { Component, OnDestroy, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { DataSharingService } from '../../../../services/data-sharing.service';


@Component({
  selector: 'app-ampliada',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ampliada.component.html',
  styleUrl: './ampliada.component.css',
  providers: [CurrencyPipe]
})
export class AmpliadaComponent implements OnInit, OnDestroy {
  caracterizacionAmpliadaForm!: FormGroup;
  pasoActual: number = 1;
  preguntasPorPaso = 9;
  totalPasos = 0;
  contador = 0;
  paginas = 2;

  opciones: string[] = ['Sí', 'No'];

  nivelesEscolaridad = [
    'ANALFABETA',
    'ESPECIALIZACIADO O MAESTRIA',
    'NO DICE',
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

    tiposContrato = [
    'TERMINO FIJO',
    'TEMPORAL',
    'INDEFINIDO',
    'NO APLICA',
    'NO DICE'
  ];

  promedioIngresosActividad: number =0;

  constructor(private fb: FormBuilder, private dataSharingService: DataSharingService) {};

  private formSubscription: Subscription = new Subscription();
  private preguntas: any[] = [];

  ngOnInit(): void {
        this.caracterizacionAmpliadaForm = this.fb.group({
      formacion: ['', Validators.required],
      nivelEscolaridad: ['', Validators.required],
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
  });
    this.preguntas = Object.keys(this.caracterizacionAmpliadaForm.controls);
    this.totalPasos = this.preguntas.length ;

    // ✅ Nueva suscripción al valor del formulario completo
    this.formSubscription.add(this.caracterizacionAmpliadaForm.valueChanges.subscribe(value => {
      // Envía el valor del grupo de participante al servicio compartido
      this.dataSharingService.updateGrupoParticipante(value.grupoParticipante);
      // Aquí puedes realizar otras acciones basadas en los cambios de otros campos si es necesario.
      this.actualizarContador();
      console.log('Cambios en el formulario detectados:', value);
    }));



    this.actualizarContador();
};

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria
    this.formSubscription.unsubscribe();
  };

  actualizarContador(): void {
    let count = 0;
    // Recorre todos los controles del formulario
    for (const controlName in this.caracterizacionAmpliadaForm.controls) {
      if (this.caracterizacionAmpliadaForm.controls.hasOwnProperty(controlName)) {
        const control = this.caracterizacionAmpliadaForm.controls[controlName];
        // Comprueba si el control tiene un valor que no sea nulo o un string vacío
        if (control.value !== null && control.value !== '' && (typeof control.value !== 'string' || control.value.trim() !== '')) {
          count++;
        }
      }
    }
    this.contador = count;
    console.log(`Preguntas completadas: ${this.contador} de ${this.preguntas.length}`);
  }

    // ✅ SOLUCIÓN: Agrega el método 'atras()'
  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      console.log('Volviendo al paso:', this.pasoActual);
    }
  };

  // ✅ SOLUCIÓN: Agrega el método 'siguiente()'
  siguiente(): void {
   if (this.pasoActual === this.paginas) {
      this.guardarProgreso();
    } else {
      this.pasoActual++;
      console.log('Avanzando al paso:', this.pasoActual);
    }
  }

  guardarProgreso() {
    if (this.caracterizacionAmpliadaForm.valid) {
      const data = this.caracterizacionAmpliadaForm.value;
      const jsonString = JSON.stringify(data, null, 2);
      // Aquí puedes implementar la lógica para guardar el JSON
      console.log('Datos del formulario:', jsonString);
      alert('Progreso guardado correctamente.');
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  get preguntasPasoActual() {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntas.slice(inicio, fin);
  }

}
