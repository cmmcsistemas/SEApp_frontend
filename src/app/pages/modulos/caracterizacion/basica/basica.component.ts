import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// Si tu componente es standalone (como se ve en la imagen)
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { DataSharingService } from '../../../../services/data-sharing.service';


@Component({
  selector: 'app-basica',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './basica.component.html',
  styleUrl: './basica.component.css'
})
export class BasicaComponent implements OnInit {
caracterizacionForm!: FormGroup;
    // ✅ Variable para el paso actual del formulario
  pasoActual: number = 1;
    // ✅ Lista de tipos de documento
  tiposDocumento = [
    'CEDULA DE CIUDADANIA',
    'CEDULA DE EXTRANJERIA',
    'OTRO',
    'PASAPORTE',
    'PEPPERMISO DE PROTECCION TEMPORAL',
    'TARJETA DE IDENTIDAD'
  ];

  grupoParticipante = [
    'EMPRENDEDOR',
    'MICROEMPRESARIO'
  ];

  constructor(private fb: FormBuilder, private dataSharingService: DataSharingService) {
    this.caracterizacionForm = this.fb.group({
      //... otros campos
      grupoParticipante: ['', Validators.required],
      //...
    });
  }


  ngOnInit(): void {
    this.caracterizacionForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      proyecto: [''],
      tipoDocumento: ['', Validators.required],
      noDocumento: [''],
      nacionalidad: [''],
      expedidaEn: [''],
      fechaExpedicion: [''],
      fechaNacimiento: [''],
            // ✅ Segundo bloque de preguntas (Paso 2)
      edad: [''],
      grupoParticipante: ['', Validators.required],
      paisResidencia: [''],
      departamentoResidencia: [''],
      municipioResidencia: [''],
      localidad: [''],
      entornoResidencia: [''],
      direccion: [''],
      indicativo: [''],
      numeroCelular: [''],
    });
    this.caracterizacionForm.get('grupoParticipante')?.valueChanges.subscribe(value => {
      // Cuando el valor cambia, lo envía al servicio compartido
      this.dataSharingService.updateGrupoParticipante(value);
    });
  }


    // ✅  navegar entre pasos
  navegarAPaso(paso: number): void {
    // Aquí puedes agregar lógica de validación
    // antes de cambiar de paso si lo necesitas.
    this.pasoActual = paso;
  }

    // ✅ SOLUCIÓN: Agrega el método 'atras()'
  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      console.log('Volviendo al paso:', this.pasoActual);
    }
  }

  // ✅ SOLUCIÓN: Agrega el método 'siguiente()'
  siguiente(): void {
        if (this.pasoActual < 3) { // Asume 3 bloques de 10 preguntas cada uno
      this.pasoActual++;
      console.log('Pasando al paso:', this.pasoActual);
    } else {
      // Lógica para el último paso (por ejemplo, enviar el formulario completo)
      console.log('Formulario completado. Enviando...');
    }
  }

  guardarProgreso() {
    if (this.caracterizacionForm.valid) {
      const data = this.caracterizacionForm.value;
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
  // ... (métodos para manejar el formulario)
}
