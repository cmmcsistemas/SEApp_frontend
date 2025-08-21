import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unidad-de-negocio',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './unidad-de-negocio.component.html',
  styleUrl: './unidad-de-negocio.component.css'
})
export class UnidadDeNegocioComponent {
  unidadDeNegocioForm: FormGroup;
  pasoActual = 1;

  constructor(private fb: FormBuilder) {
    this.unidadDeNegocioForm = this.fb.group({
      nombreUnidad: ['', Validators.required],
      dptoUbicacion: ['', Validators.required],
      ciudadUbicacion: ['', Validators.required],
      localidadUbicacion: ['', Validators.required],
      rotulo: ['', Validators.required],
      direccion: ['', Validators.required],
      indicativo: ['', Validators.required],
      telefonoFijo: ['', Validators.required],
      celular1: ['', Validators.required],
      celular2: [''],
      email: ['', [Validators.required, Validators.email]],
      paginaWeb: ['']
    });
  }

  ngOnInit(): void {
  }

  siguiente(): void {
    if (this.pasoActual < 2) { // Asume 2 pasos
      this.pasoActual++;
    }
  }

  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  guardarProgreso(): void {
    if (this.unidadDeNegocioForm.valid) {
      console.log('Progreso guardado:', this.unidadDeNegocioForm.value);
      // Aquí se implementaría la lógica para guardar en un servicio
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
    }
  }
}
