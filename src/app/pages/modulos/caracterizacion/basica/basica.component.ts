import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// Si tu componente es standalone (como se ve en la imagen)
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { DataSharingService } from '../../../../services/data-sharing.service';
import { Subscription, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-basica',
  imports: [ReactiveFormsModule, CommonModule],
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
    'PEPPERMISO DE PROTECCION TEMPORAL',
    'TARJETA DE IDENTIDAD'
  ];

  grupoParticipante = [
    'EMPRENDEDOR',
    'MICROEMPRESARIO'
  ];

  entornosResidencia = [
    'RURAL',
    'URBANO'
  ];

  sexos = [
    'HOMBRE',
    'MUJER',
    'INTERSEXUAL'
  ]


  proyectos: any[] = [];
  municipios: any[] = [];
  paises: any[] = [];
  municipiosFiltrados: any[] = [];
  generos: any[] = [];
  etnias: any[] = [];
  discapacidades: any[] = [];
  gruposVulnerables: any[] = [];

private formSubscription: Subscription = new Subscription();
private preguntas: any[] = [];

constructor(private fb: FormBuilder, private dataSharingService: DataSharingService, private http: HttpClient) {}


  ngOnInit(): void {
    this.caracterizacionForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      proyecto: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      noDocumento: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      expedidaEn: ['', Validators.required],
      fechaExpedicion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
            // ✅ Segundo bloque de preguntas (Paso 2)
      edad: [''],
      grupoParticipante: ['', Validators.required],
      paisResidencia: ['', Validators.required],
      departamentoResidencia: ['' ],
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
    this.paginas = Math.ceil(this.preguntas.length / this.preguntasPorPaso); ;
    this.totalPasos = this.preguntas.length ;

    this.caracterizacionForm.get('paisResidencia')?.valueChanges.subscribe(pais => {
      if (pais === 'COLOMBIA') {
        this.caracterizacionForm.get('municipioResidencia')?.enable();
        this.obtenerMunicipios();
      } else {
        this.caracterizacionForm.get('municipioResidencia')?.disable();
        this.caracterizacionForm.get('municipioResidencia')?.reset('');
        this.caracterizacionForm.get('localidad')?.reset('');
        this.municipiosFiltrados = [];
      }
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
    this.obtenerMunicipios();
    this.obtenerGeneros();
    this.obtenerEtnias(),
    this.obtenerDiscapacidades();
    this.obtenerGruposVulnerables();

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
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'proyectos'
    this.http.get<any[]>('http://192.168.0.16:3900/api/basica/subproyectos')
      .subscribe({
        next: (data) => {
          this.proyectos = data.map(proyecto => proyecto.nombre_subproyecto);
          console.log('Proyectos obtenidos de la API:', this.proyectos);
        },
        error: (error) => {
          console.error('Error al obtener los proyectos:', error);
        }
      });
  }

    obtenerMunicipios(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'municipios'
    this.http.get<any[]>('http://192.168.0.16:3900/api/basica/municipios')
      .subscribe({
        next: (data) => {
          const listadoMunicipios = data.map(municipio => municipio.nombre_municipio);
          this.municipios = listadoMunicipios.sort((a,b) => a.localeCompare(b));

          console.log('Municipios obtenidos de la API:', this.municipios);
        },
        error: (error) => {
          console.error('Error al obtener los proyectos:', error);
        }
      });
  };

    obtenerPaises(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'paises'
    this.http.get<any[]>('http://192.168.0.16:3900/api/basica/paises')
      .subscribe({
        next: (data) => {
          const listadoPaises = data.map(pais => pais.nombre_pais);
          this.paises = listadoPaises.sort((a,b) => a.localeCompare(b));

          console.log('Paises obtenidos de la API:', this.paises);
        },
        error: (error) => {
          console.error('Error al obtener los proyectos:', error);
        }
      });
  };

    obtenerGeneros(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'paises'
    this.http.get<any[]>('http://192.168.0.16:3900/api/basica/generos')
      .subscribe({
        next: (data) => {
          const listadoGeneros = data.map(genero => genero.tipo_genero);
          this.generos = listadoGeneros.sort((a,b) => a.localeCompare(b));

          console.log('Generos obtenidos de la API:', this.generos);
        },
        error: (error) => {
          console.error('Error al obtener los generos:', error);
        }
      });
  };

    obtenerDiscapacidades(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'paises'
    this.http.get<any[]>('http://192.168.0.16:3900/api/basica/discapacidades')
      .subscribe({
        next: (data) => {
          const listadoDiscapacidades = data.map(discapacidad => discapacidad.tipo_discapacidad);
          this.discapacidades = listadoDiscapacidades.sort((a,b) => a.localeCompare(b));

          console.log('Discapacidades obtenidos de la API:', this.discapacidades);
        },
        error: (error) => {
          console.error('Error al obtener las discapacidades:', error);
        }
      });
  };

    obtenerEtnias(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'paises'
    this.http.get<any[]>('http://192.168.0.16:3900/api/basica/etnias')
      .subscribe({
        next: (data) => {
          const listadoEtnias = data.map(etnia => etnia.tipo_etnia);
          this.etnias = listadoEtnias.sort((a,b) => a.localeCompare(b));

          console.log('Generos obtenidos de la API:', this.etnias);
        },
        error: (error) => {
          console.error('Error al obtener los generos:', error);
        }
      });
  };

    obtenerGruposVulnerables(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'paises'
    this.http.get<any[]>('http://192.168.0.16:3900/api/basica/vulnerable')
      .subscribe({
        next: (data) => {
          const listadoGruposVulneravilidades = data.map(grupo_vulnerable => grupo_vulnerable.tipo_grupo);
          this.gruposVulnerables = listadoGruposVulneravilidades.sort((a,b) => a.localeCompare(b));

          console.log('Grupos vulnerables obtenidos de la API:', this.gruposVulnerables);
        },
        error: (error) => {
          console.error('Error al obtener los grupos vulnerables:', error);
        }
      });
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

  guardarProgreso() {
    if (this.caracterizacionForm.valid) {
      const data = this.caracterizacionForm.value;
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Datos del formulario:', jsonString);
      alert('Progreso guardado correctamente.');
    } else {
      // ✅ Líneas añadidas para depuración
      this.caracterizacionForm.markAllAsTouched();
      console.error('El formulario no es válido. Los siguientes campos tienen errores:');
      Object.keys(this.caracterizacionForm.controls).forEach(controlName => {
        const control = this.caracterizacionForm.get(controlName);
        if (control?.invalid) {
          console.error(`Campo: ${controlName}, Errores: `, control.errors);
        }
      });
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
