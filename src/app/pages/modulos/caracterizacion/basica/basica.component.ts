import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// Si tu componente es standalone (como se ve en la imagen)
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { DataSharingService } from '../../../../services/data-sharing.service';
import { Subscription, Observable } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface RegisterResponse {
  status?: string;
  message?: string;
  id_participante?: number | string;
  participante?: {
  id_participante: number | string;
  [key: string]: any;
  };
};
@Component({
  selector: 'app-basica',
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './basica.component.html',
  styleUrl: './basica.component.css'
})
export class BasicaComponent implements OnInit, OnDestroy {
caracterizacionForm!: FormGroup;
    // ✅ Variable para el paso actual del formulario
  pasoActual: number = 1;
  preguntasPorPaso = 10;
  totalPasos = 0;
  paginas = 0;
  contador = 0;
    // ✅ Lista de tipos de documento
  tiposDocumento = [
    'CEDULA DE CIUDADANIA',
    'CEDULA DE EXTRANJERIA',
    'OTRO',
    'PASAPORTE',
    'PERMISO DE PROTECCION TEMPORAL',
    'TARJETA DE IDENTIDAD'
  ];

  sexos = [
    'HOMBRE',
    'MUJER',
    'INTERSEXUAL'
  ];

  estadosCivil = [
    'SOLTERO(A)',
    'CASADO(A)',
    'UNION LIBRE',
    'DIVORCIADO(A)',
    'VIUDO(A)'
  ];


  proyectos: any[] = [];
  departamentos: any[] = [];
  municipios: any[] = [];
  localidades: any[] = [];
  paises: any[] = [];
  municipiosFiltrados: any[] = [];
  generos: any[] = [];
  etnias: any[] = [];
  discapacidades: any[] = [];
  gruposVulnerables: any[] = [];
  gruposPertenecientes: any [] =  [];
  entornosResidencias: any [] = [];

private formSubscription: Subscription = new Subscription();
private preguntas: any[] = [];
private apiUrlRegister = 'http://20.81.172.55:3900/api/participantes/register/';

constructor(private fb: FormBuilder, private dataSharingService: DataSharingService, private http: HttpClient) {}


  ngOnInit(): void {
    this.caracterizacionForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      proyecto: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      noDocumento: ['', [Validators.required, Validators.minLength(5)]],
      nacionalidad: ['', Validators.required],
      estadoCivil: ['', Validators.required],
      dptoExpedicion: ['', Validators.required],
      ciudadExpedicion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
            // ✅ Segundo bloque de preguntas (Paso 2)
      edad: [{value: '', disabled: true}],
      grupoParticipante: ['', Validators.required],
      paisResidencia: ['', Validators.required],
      departamentoResidencia: [''],
      municipioResidencia: [''],
      localidad: [''],
      entornoResidencia: ['', Validators.required],
      direccion: ['', Validators.required],
      numeroCelular: ['', Validators.required],
      sexo: ['', Validators.required],
      // ✅ Tercer bloque de preguntas (Paso 3)
      genero: ['', Validators.required],
      etnia: ['', Validators.required],
      discapacidad: ['', Validators.required],
      grupoVulnerable: ['', Validators.required],
    });

    this.preguntas = Object.keys(this.caracterizacionForm.controls);
    this.paginas = Math.ceil(this.preguntas.length / this.preguntasPorPaso);
    this.totalPasos = this.preguntas.length ;

    this.caracterizacionForm.get('paisResidencia')?.valueChanges.subscribe(pais => {
      const esColombia = pais === '1';
      if (esColombia) {
          this.caracterizacionForm.get('municipioResidencia')?.enable();
          this.caracterizacionForm.get('departamentoResidencia')?.valueChanges.subscribe(departamentoSeleccionado => {
          if (departamentoSeleccionado) {
            this.obtenerMunicipios(departamentoSeleccionado);
            this.caracterizacionForm.get('municipioResidencia')?.enable();
          } else {
            this.caracterizacionForm.get('municipioResidencia')?.disable();
            this.caracterizacionForm.get('municipioResidencia')?.reset('');
            this.municipios = [];
          }
    });
      } else {
        this.caracterizacionForm.get('municipioResidencia')?.disable();
        this.caracterizacionForm.get('municipioResidencia')?.reset('');
        this.caracterizacionForm.get('localidad')?.setValue('');
        this.municipiosFiltrados = [];
      }
    });

    this.caracterizacionForm.get('municipioResidencia')?.valueChanges.subscribe(municipio => {
     const esBogota = municipio === 149;
    console.log('Seleccionado:', esBogota);
      if (esBogota) {
        this.caracterizacionForm.get('localidad')?.setValidators(Validators.required);
        this.caracterizacionForm.get('localidad')?.reset();
        this.obtenerLocalidades();
      } else {
        this.caracterizacionForm.get('localidad')?.clearValidators();
        this.caracterizacionForm.get('localidad')?.setValue(null, {emitEvent: false});
      }
      this.caracterizacionForm.get('localidad')?.updateValueAndValidity();
    });

        // Suscripción para calcular la edad automáticamente cuando cambie la fecha de nacimiento
    this.caracterizacionForm.get('fechaNacimiento')?.valueChanges.subscribe(fechaNacimiento => {
      if (fechaNacimiento) {
        const edad = this.calcularEdad(fechaNacimiento);
        this.caracterizacionForm.get('edad')?.setValue(edad);
      } else {
        this.caracterizacionForm.get('edad')?.reset('');
      }
    });

    // ✅ Nueva suscripción al valor del formulario completo
    this.formSubscription.add(this.caracterizacionForm.valueChanges.subscribe(value => {
      // Envía el valor del grupo de participante al servicio compartido
      this.dataSharingService.updateGrupoParticipante(value.grupoParticipante);
      // Aquí puedes realizar otras acciones basadas en los cambios de otros campos si es necesario.
      this.actualizarContador();
      console.log('Cambios en el formulario detectados:', value);
    }));

    this.actualizarContador();
    this.obtenerProyectos();
    this.obtenerPaises();
    this.obtenerDepartamentos();
    this.obtenerGeneros();
    this.obtenerEtnias(),
    this.obtenerDiscapacidades();
    this.obtenerGruposVulnerables();
    this.obtenerGrupoPerteneciente();
    this.obtenerEntornoResidencia();

  }

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria
    this.formSubscription.unsubscribe();
  }

    // Nuevo método para calcular la edad
  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }

    obtenerProyectos(): void {
   this.http.get<any[]>('http://20.81.172.55:3900/api/basica/subproyectos').subscribe(data => this.proyectos = data);
  }

  obtenerDepartamentos(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/departamentos').subscribe(data => {
      this.departamentos = data.sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento));
    });
  };

    obtenerMunicipios(idDepartamento: number): void {
    this.http.get<any[]>(`http://20.81.172.55:3900/api/basica/municipios/${idDepartamento}`).subscribe(data => {
      this.municipios = data.sort((a, b) => a.nombre_municipio.localeCompare(b.nombre_municipio));
    });
  };

  obtenerLocalidades(): void {
   this.http.get<any[]>('http://20.81.172.55:3900/api/basica/localidades').subscribe(data => this.localidades = data);
  };

    obtenerPaises(): void {
   this.http.get<any[]>('http://20.81.172.55:3900/api/basica/paises').subscribe(data => this.paises = data);
  };

    obtenerGeneros(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/generos').subscribe(data => this.generos = data);
  };

    obtenerDiscapacidades(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/discapacidades').subscribe(data => this.discapacidades = data);
  };

    obtenerEtnias(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/etnias').subscribe(data => this.etnias = data);
  };

    obtenerGruposVulnerables(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/vulnerable').subscribe(data => this.gruposVulnerables = data);
  };

  obtenerGrupoPerteneciente(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/grupoPerteneciente').subscribe(data => this.gruposPertenecientes = data);
  };

  obtenerEntornoResidencia(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/entornos').subscribe(data => this.entornosResidencias = data);
  };

    // Método para filtrar la lista de proyectos basado en la entrada del usuario
  onInputChange(event: Event): void {
    const terminoBusqueda = (event.target as HTMLInputElement).value.toLowerCase();
    this.municipiosFiltrados = this.municipios.filter(municipio =>
      municipio.toLowerCase().includes(terminoBusqueda)
    );
  }

  onMunicipioInputChange(event: Event): void {
    const terminoBusqueda = (event.target as HTMLInputElement).value.toLowerCase();
    this.municipiosFiltrados = this.municipios.filter(municipio =>
      municipio.toLowerCase().includes(terminoBusqueda)
    );
  }

    // ✅  navegar entre pasos
  navegarAPaso(paso: number): void {
    this.pasoActual = paso;
  }

  actualizarContador(): void {
    let count = 0;
    // Recorre todos los controles del formulario
    for (const controlName in this.caracterizacionForm.controls) {
      if (this.caracterizacionForm.controls.hasOwnProperty(controlName)) {
        const control = this.caracterizacionForm.controls[controlName];
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
  }

  // ✅ SOLUCIÓN: Agrega el método 'siguiente()'
  siguiente(): void {
   if (this.pasoActual === this.paginas) {
      this.guardarProgreso();
    } else {
      this.pasoActual++;
      console.log('Avanzando al paso:', this.pasoActual);
    }
  }

  guardarProgreso() : void {
    if (this.caracterizacionForm.valid) {
      const rawValues = this.caracterizacionForm.getRawValue();

      // Mapeo de IDs (Buscamos el ID basado en el objeto seleccionado en el formulario)
      // Nota: Si tus [ngValue] en el HTML ya pasan el objeto completo, esto es directo.
      const payload = {
        nombre: rawValues.nombre,
        apellido: rawValues.apellido,
        documento: Number(rawValues.noDocumento),
        email: rawValues.email,
        telefono: Number(rawValues.numeroCelular),
        fecha_nacimiento: rawValues.fechaNacimiento,
        id_genero: rawValues.genero,
        id_etnia: rawValues.etnia,
        id_discapacidad: rawValues.discapacidad,
        id_entorno: rawValues.entornoResidencia,
        id_grupo: rawValues.grupoParticipante,
        id_grupo_vulnerable: rawValues.grupoVulnerable,
        id_direccion_info: {
          tipo_via: "", // Valores temporales ya que el form actual tiene un solo string 'direccion'
          numero_principal: 0,
          prefijo: "",
          numero_via: 0,
          prefijo_dos: "",
          complemento: rawValues.direccion
        },
        ubicacion_info: {
          id_pais: rawValues.paisResidencia,
          id_municipio: rawValues.municipioResidencia,
          id_departamento: rawValues.departamentoResidencia,
          id_localidad: rawValues.localidad || null
        }
      };

      console.log('Enviando datos al backend:', payload);

      this.http.post<RegisterResponse>(this.apiUrlRegister, payload).subscribe({
        next: (response) => {
          // Buscamos el ID en la raíz o dentro del objeto participante
          const idGenerado = response.id_participante || response.participante?.id_participante || 'generado';
          alert(`Participante ${idGenerado} registrado correctamente.`);
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          alert('Hubo un error al registrar al participante.');
        }
      });
    } else {
      this.caracterizacionForm.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos.');
    }
  }
  // ... (métodos para manejar el formulario)
    get preguntasPasoActual() {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntas.slice(inicio, fin);
  }
}
