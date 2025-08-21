import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-idea-de-negocio',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './idea-de-negocio.component.html',
  styleUrl: './idea-de-negocio.component.css'
})
export class IdeaDeNegocioComponent {
  ideaDeNegocioForm! : FormGroup;
  pasoActual: number =  1;
  totalPasos: number =  1;

constructor(private fb: FormBuilder) {}

ngOnInit(): void {
    this.ideaDeNegocioForm = this.fb.group({
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
      grupoParticipante: [''],
      paisResidencia: [''],
      departamentoResidencia: [''],
      municipioResidencia: [''],
      localidad: [''],
      entornoResidencia: [''],
      direccion: [''],
      indicativo: [''],
      numeroCelular: ['']
    });
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

  guardarProgreso(): void{}
}
