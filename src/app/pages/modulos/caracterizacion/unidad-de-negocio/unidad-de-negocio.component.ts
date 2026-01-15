import { Component,OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-unidad-de-negocio',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './unidad-de-negocio.component.html',
  styleUrl: './unidad-de-negocio.component.css'
})
export class UnidadDeNegocioComponent implements OnInit, OnDestroy {
  unidadDeNegocioForm!: FormGroup;
  pasoActual: number =  1;
  totalPasos: number =  0;
  preguntasPorPaso = 6;
  paginas = 0;
  contador = 0;

  private formSubscription: Subscription = new Subscription();
  private preguntas: any[] = [];
  departamentos: any[] = [];
  municipios: any[] = [];
  localidades: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

ngOnInit(): void {
    this.unidadDeNegocioForm = this.fb.group({
      nombreUnidad: ['', Validators.required],
      dptoUbicacion: ['', Validators.required],
      ciudadUbicacion: ['', [Validators.required]],
      localidadUbicacion: [''],
      direccion: ['', Validators.required],
      telefonoFijo: [''],
            // ✅ Segundo bloque de preguntas (Paso 2)
      celular: ['', Validators.required],
      email: [''],
      paginaWeb: [''],
      descripcionUnidad: ['', Validators.required],
      listadoProducto: [''],
      fechaCreacion: ['']
    });

    this.preguntas = Object.keys(this.unidadDeNegocioForm.controls);
    this.paginas = Math.ceil(this.preguntas.length / this.preguntasPorPaso); ;
    this.totalPasos = this.preguntas.length ;


    this.unidadDeNegocioForm.get('dptoUbicacion')?.valueChanges.subscribe(departamentoSeleccionado => {
      if (departamentoSeleccionado) {
        this.obtenerMunicipiosPorDepartamento(departamentoSeleccionado.id_departamento);
        this.unidadDeNegocioForm.get('ciudadUbicacion')?.enable();
      } else {
        this.unidadDeNegocioForm.get('ciudadUbicacion')?.disable();
        this.unidadDeNegocioForm.get('ciudadUbicacion')?.reset('');
        this.municipios = [];
      }
    });

        this.unidadDeNegocioForm.get('ciudadUbicacion')?.valueChanges.subscribe(municipio => {
      const esBogota = municipio && municipio.nombre_municipio === 'BOGOTA';
      if (esBogota) {
        this.unidadDeNegocioForm.get('localidadUbicacion')?.setValidators(Validators.required);
        this.unidadDeNegocioForm.get('localidadUbicacion')?.reset();
        this.obtenerLocalidades();
      } else {
        this.unidadDeNegocioForm.get('localidadUbicacion')?.clearValidators();
        this.unidadDeNegocioForm.get('localidadUbicacion')?.reset();
        this.unidadDeNegocioForm.get('localidadUbicacion')?.setValue('N/A', {emitEvent: false});
      }
      this.unidadDeNegocioForm.get('localidadUbicacion')?.updateValueAndValidity();
    });


    // ✅ Nueva suscripción al valor del formulario completo
    this.formSubscription.add(this.unidadDeNegocioForm.valueChanges.subscribe(value => {
      this.actualizarContador();
      console.log('Cambios en el formulario detectados:', value);
    }));

    this.actualizarContador();
    this.obtenerDptoUbicacion();

  }

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria
    this.formSubscription.unsubscribe();
  }

  actualizarContador(): void {
    let count = 0;
    // Recorre todos los controles del formulario
    for (const controlName in this.unidadDeNegocioForm.controls) {
      if (this.unidadDeNegocioForm.controls.hasOwnProperty(controlName)) {
        const control = this.unidadDeNegocioForm.controls[controlName];
        // Comprueba si el control tiene un valor que no sea nulo o un string vacío
        if (control.value !== null && control.value !== '' && (typeof control.value !== 'string' || control.value.trim() !== '')) {
          count++;
        }
      }
    }
    this.contador = count;
    console.log(`Preguntas completadas: ${this.contador} de ${this.preguntas.length}`);
  }

  obtenerDptoUbicacion(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'paises'
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/departamentos')
      .subscribe({
        next: (data) => {
          this.departamentos = data.sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento));
          console.log('Departamentos obtenidos de la API:', this.departamentos);
        },
        error: (error) => {
          console.error('Error al obtener los departamentos:', error);
        }
      });
  };

    // ✅ Nueva función para obtener municipios filtrados por el ID del departamento
  obtenerMunicipiosPorDepartamento(idDepartamento: number): void {
    this.http.get<any[]>(`http://20.81.172.55:3900/api/basica/municipios/${idDepartamento}`)
      .subscribe({
        next: (data) => {
          this.municipios = data.sort((a, b) => a.nombre_municipio.localeCompare(b.nombre_municipio));
          console.log(`Municipios para el departamento con ID ${idDepartamento} obtenidos:`, this.municipios);
        },
        error: (error) => {
          console.error(`Error al obtener los municipios para el ID ${idDepartamento}:`, error);
          this.municipios = []; // Limpiar la lista en caso de error
        }
      });
  }

    obtenerLocalidades(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/localidades')
    .subscribe({
      next: (data) => {
        const listadoLocalidades = data.map(localidad => localidad.nombre_localidad);
        this.localidades = listadoLocalidades.sort((a,b) => a.localeCompare(b));
        console.log('Localidades obtenidos de la API:', this.localidades);
      },
      error: (error) => {
        console.error('Error al obtener las localidades:', error);
      }
    });
  }

  siguiente(): void {
    if (this.pasoActual < this.totalPasos) { // Asume 2 pasos
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
      const data = this.unidadDeNegocioForm.value;

      const sanitizedData = {
        ...data,
        dptoUbicacion: data.dptoUbicacion?.nombre_departamento || null,
        ciudadUbicacion: data.ciudadUbicacion?.nombre_municipio || null,
      };
      const jsonString = JSON.stringify(sanitizedData, null, 2);
      console.log('Datos del formulario:', jsonString);
      alert('Progreso guardado correctamente.');
    } else {
      // ✅ Líneas añadidas para depuración
      this.unidadDeNegocioForm.markAllAsTouched();
      console.error('El formulario no es válido. Los siguientes campos tienen errores:');
      Object.keys(this.unidadDeNegocioForm.controls).forEach(controlName => {
        const control = this.unidadDeNegocioForm.get(controlName);
        if (control?.invalid) {
          console.error(`Campo: ${controlName}, Errores: `, control.errors);
        }
      });
      alert('Por favor, complete todos los campos requeridos.');
    }

  }
}
