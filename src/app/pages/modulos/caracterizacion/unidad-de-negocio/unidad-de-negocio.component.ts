import { Component,OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataSharingService } from '../../../../services/data-sharing.service';

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

  idParticipanteActual: any = null;
  nombreParticipanteActual: string | null = null;
  idRespuestaActual: any = null;
  documentoParticipanteActual: string | number | null = null;

  private formSubscription: Subscription = new Subscription();
  private preguntas: any[] = [];
  departamentos: any[] = [];
  municipios: any[] = [];
  localidades: any[] = [];

    // 🟢 MAPEO DE IDs DE CAMPO PARA UNIDAD DE NEGOCIO
  // Estos IDs deben coincidir con los registros en tu tabla 'campo_formulario'
  private readonly campoIdMapping: { [key: string]: number } = {
    nombreUnidad: 44,
    dptoUbicacion: 52,
    ciudadUbicacion: 54,
    localidadUbicacion: 55,
    direccion: 45,
    telefonoFijo: 57,
    celular: 58,
    email: 59,
    paginaWeb: 60,
    descripcionUnidad: 61,
    listadoProducto: 62,
    fechaCreacion: 63
  };

   private apiUrlAddData = 'http://20.81.172.55:3900/api/participantes/add-data/';

  constructor(private fb: FormBuilder, private http: HttpClient, private dataSharingService: DataSharingService) {}

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
      const idRespuesta = this.dataSharingService.getIdRespuesta();

      if (!idRespuesta) {
        alert('Error: No se encontró el ID de respuesta. Por favor, complete primero los datos básicos.');
        return;
      }

      const rawValues = this.unidadDeNegocioForm.getRawValue();

      // Mapeamos los campos del formulario al array formulario_data
      const formulario_data = Object.keys(rawValues).map(key => {
        const valorOriginal = rawValues[key];
        let valorFinal = valorOriginal;

        // Tratamiento para objetos (Deptos, Municipios, Localidades)
        if (valorOriginal && typeof valorOriginal === 'object') {
          valorFinal = valorOriginal.nombre_municipio ||
                       valorOriginal.nombre_departamento ||
                       valorOriginal.nombre_localidad ||
                       JSON.stringify(valorOriginal);
        }

        return {
          id_campo: this.campoIdMapping[key],
          valor: (valorFinal === null || valorFinal === undefined) ? '' : valorFinal.toString()
        };
      }).filter(item => item.id_campo !== undefined);

      const payload = {
        id_respuesta: idRespuesta,
        formulario_data: formulario_data
      };

      console.log('Enviando Unidad de Negocio:', payload);

      this.http.post(this.apiUrlAddData, payload).subscribe({
        next: (response) => {
          console.log('Inserción exitosa:', response);
          alert('Información de la Unidad de Negocio guardada correctamente.');
        },
        error: (error) => {
          console.error('Error al insertar datos:', error);
          alert('Hubo un error al guardar la información en la base de datos.');
        }
      });

    } else {
      this.unidadDeNegocioForm.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos.');
    }
  }
}
