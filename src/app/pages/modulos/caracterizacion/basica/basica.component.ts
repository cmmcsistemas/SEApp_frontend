import { Component, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// Si tu componente es standalone (como se ve en la imagen)
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { DataSharingService } from '../../../../services/data-sharing.service';
import { Subscription, Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface RegisterResponse {
  status: string;
  message: string;
  formulario: {
    id_respuesta: number;
    id_participante: number;
    id_formulario: number;
    fecha_respuesta: string;
  };
  participante: {
    id_participante: number;
    nombre: string;
    [key: string]: any;
  };
}
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
  totalPasos = 3;
  paginas = 0;
  contador = 0;

  private readonly controlesPorPaso: { [key: number]: string[] } = {
    1: ['nombre', 'apellido', 'fechaNacimiento', 'proyecto', 'tipoDocumento', 'noDocumento', 'nacionalidad', 'estadoCivil', 'dptoExpedicion', 'ciudadExpedicion','grupoParticipante'],
    2: ['email', 'edad', 'paisResidencia', 'departamentoResidencia', 'municipioResidencia', 'localidad', 'entornoResidencia', 'direccion', 'numeroCelular'],
    3: ['sexo', 'genero', 'etnia', 'discapacidad', 'grupoVulnerable']
  };


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

  idParticipanteActual: any = null;
  nombreParticipanteActual: string | null = null;
  idRespuestaActual: any = null;
  documentoParticipanteActual: string | number | null = null;

private formSubscription: Subscription = new Subscription();
private preguntas: any[] = [];
private apiUrlRegister = 'http://20.81.172.55:3900/api/participantes/register/';
private idSubscription: Subscription = new Subscription();

constructor(private fb: FormBuilder, private dataSharingService: DataSharingService, private http: HttpClient, private el: ElementRef,) {}


  ngOnInit(): void {
    this.caracterizacionForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      proyecto: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      noDocumento: ['', [Validators.required, Validators.minLength(5)]],
      nacionalidad: ['', Validators.required],
      estadoCivil: ['', Validators.required],
      dptoExpedicion: ['', Validators.required],
      ciudadExpedicion: [''],
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


    this.caracterizacionForm.get('paisResidencia')?.valueChanges.subscribe(pais => {
      const esColombia = pais === '1';
      if (esColombia) {
          this.caracterizacionForm.get('municipioResidencia')?.enable();
          this.caracterizacionForm.get('departamentoResidencia')?.valueChanges.subscribe(departamentoSeleccionado => {
          if (departamentoSeleccionado) {
            this.obtenerMunicipios(departamentoSeleccionado);
            this.caracterizacionForm.get('municipioResidencia')?.enable();
          }
    });
      } else {
        this.caracterizacionForm.get('municipioResidencia')?.disable();
        this.caracterizacionForm.get('localidad')?.setValue('');
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

    this.caracterizacionForm.get('dptoExpedicion')?.valueChanges.subscribe(deptoExpedicionSeleccionado => {
          if (deptoExpedicionSeleccionado) {
            this.obtenerMunicipios(deptoExpedicionSeleccionado);
            this.caracterizacionForm.get('ciudadExpedicion')?.enable();
          }
    })

    this.idSubscription.add(
      this.dataSharingService.idRespuesta$.subscribe(id => {
        this.idRespuestaActual = id;
        if (id) {
          console.log('📢 Ampliada detectó una señal de búsqueda. ID:', id);
          this.cargarDatosSeccion(id);
        }
      })
    );

    this.idSubscription.add(
      this.dataSharingService.idParticipante$.subscribe(id => this.idParticipanteActual = id)
    );

    this.idSubscription.add(
      this.dataSharingService.nombreParticipante$.subscribe(n => this.nombreParticipanteActual = n)
    );

    this.idSubscription.add(
      this.dataSharingService.documentoParticipante$.subscribe(doc => this.documentoParticipanteActual = doc)
    );
    this.idSubscription.add(
      this.caracterizacionForm.valueChanges.subscribe(() => this.actualizarContador())
    );

    this.idSubscription.add(
      this.dataSharingService.participanteCompleto$.subscribe(p => {
        if (p) {
          this.patchFormWithParticipante(p);
        }
      })
    );

    this.obtenerGeneros();
    this.obtenerEtnias(),
    this.obtenerDiscapacidades();
    this.obtenerGruposVulnerables();
    this.obtenerGrupoPerteneciente();
    this.obtenerEntornoResidencia();

    this.caracterizacionForm.get('tipoDocumento')?.valueChanges.subscribe(tipo => {
    this.actualizarValidadoresDocumento(tipo);
  });

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

  actualizarValidadoresDocumento(tipo: string): void {
  const controlDoc = this.caracterizacionForm.get('noDocumento');
  if (!controlDoc) return;

  // Limpiamos validadores anteriores pero mantenemos el Required
  controlDoc.clearValidators();
  controlDoc.setValidators([Validators.required]);

  // Definimos los tipos que son SOLO NUMÉRICOS
  const soloNumeros = [
    'CEDULA DE CIUDADANIA',
    'PERMISO DE PROTECCION TEMPORAL',
    'TARJETA DE IDENTIDAD'
  ];

  if (soloNumeros.includes(tipo)) {
    // Regex: Solo dígitos del 0 al 9
    controlDoc.setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
  } else {
    // Regex: Letras y números (Alfanumérico), sin caracteres especiales
    controlDoc.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]);
  }

  // Importante: Recalcular el estado del campo
  controlDoc.updateValueAndValidity();
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
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/generos').subscribe(data =>
      {this.generos = this.ordenarPrioritariosPrimero(data, 'tipo_genero')});
  };

    obtenerDiscapacidades(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/discapacidades').subscribe(data =>
      {this.discapacidades = this.ordenarPrioritariosPrimero(data, 'tipo_discapacidad')});
  };

    obtenerEtnias(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/etnias').subscribe(data =>
     { this.etnias = this.ordenarPrioritariosPrimero(data, 'tipo_etnia')});
  };

    obtenerGruposVulnerables(): void {
   this.http.get<any[]>('http://20.81.172.55:3900/api/basica/vulnerable').subscribe(data => {
      // Solo pasas el arreglo y el nombre del campo que quieres evaluar
      this.gruposVulnerables = this.ordenarPrioritariosPrimero(data, 'tipo_grupo');
    });
  };

  obtenerGrupoPerteneciente(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/grupoPerteneciente').subscribe(data => {
      this.gruposPertenecientes = this.ordenarPrioritariosPrimero(data, 'nombre_grupo');});
  };

  obtenerEntornoResidencia(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/entornos').subscribe(data =>
      {this.entornosResidencias =  this.ordenarPrioritariosPrimero(data, 'tipo_entorno');});
  };


    private patchFormWithParticipante(p: any): void {
    console.log('Pintando datos del participante en Básica:', p);

    this.caracterizacionForm.patchValue({
      nombre: p.nombre,
      apellido: p.apellido,
      email: p.email,
      noDocumento: p.documento,
      numeroCelular: p.telefono,
      fechaNacimiento: p.fecha_nacimiento ? p.fecha_nacimiento.split('T')[0] : '',
      proyecto: p.nombre_subproyecto ,
      genero: p.tipo_genero || null,
      etnia: p.tipo_etnia || null,
      discapacidad: p.tipo_discapacidad || null,
      entornoResidencia: p.tipo_entorno || null,
      grupoVulnerable: p.tipo_grupo || null,
      direccion: p.id_direccion_info?.complemento || '',
      paisResidencia: p.nombre_pais || null,
      departamentoResidencia: p.nombre_departamento || null,
      municipioResidencia: p.nombre_municipio || null,
      localidad: p.nombre_localidad || null
    }, { emitEvent: true });

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
    // 1. Validamos solo las preguntas que el usuario está viendo actualmente
    if (!this.validarPasoActual()) {
      this.scrollToFirstInvalidControl();
      return;
    }

    // 2. Si es válido y no es la última página, avanzamos
    if (this.pasoActual < this.totalPasos) {
      this.pasoActual++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si es el último paso, guardamos el formulario completo
      this.guardarProgreso();
    }
  }

  validarPasoActual(): boolean {
   const controlesVisibles = this.controlesPorPaso[this.pasoActual] || []; // Obtenemos las llaves del slice actual
    let esValido = true;

    controlesVisibles.forEach(controlName => {
      const control = this.caracterizacionForm.get(controlName);
        if (control?.invalid) {
          control.markAsTouched();
          esValido = false;
        }

    });

    return esValido;
  }

  scrollToFirstInvalidControl(): void {
    const controlesVisibles = this.controlesPorPaso[this.pasoActual] || [];

    // 2. Itera sobre los formularios de este paso
    for (const controlName of controlesVisibles) {
      const control = this.caracterizacionForm.get(controlName);
        // 3. Encuentra el primer control que sea inválido
        if (control?.invalid) {
            console.log(`Campo "${controlName}" con error.`);
          // 4. Busca el elemento en el HTML usando su formControlName
          const invalidControl = this.el.nativeElement.querySelector(`[formControlName="${controlName}"]`);

          if (invalidControl) {
            // 5. Si lo encuentra, hace scroll y lo enfoca
            invalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            invalidControl.focus();
            invalidControl.style.outline = '1px solid #008f4c';
            invalidControl.style.boxShadow = '0 0 2px rgba(18, 161, 75, 0.5)';
            invalidControl.style.borderRadius = '0.375rem';

            // Muestra un mensaje más útil
            alert(`Campo "${controlName}" falta por completar.`);
             break;
          }

      }
    }
  }


  cargarDatosSeccion(id: number | string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `http://20.81.172.55:3900/api/participantes/formulario-completo?id_respuesta=${id}`;

    this.http.get<any>(url, { headers }).subscribe(res => {
      const detalles = res?.data?.detalles || [];
      const mapping: any = {
        nacionalidad: 1049,
        edad: 1059,
        tipoDocumento: 1039,
        dptoExpedicion: 1056,
        ciudadExpedicion: 1065
      };

      const patch: any = {};
      Object.keys(mapping).forEach(key => {
        const item = detalles.find((d: any) => d.id_campo === mapping[key]);
        if (item) patch[key] = item.valor;
      });
      this.caracterizacionForm.patchValue(patch, { emitEvent: false });
    });
  };

  ordenarPrioritariosPrimero(data: any[], campo: string): any[] {
  const terminos = ['no aplica', 'n/a', 'ninguna', 'no informa'];

  return data.sort((a, b) => {
    // Acceso dinámico a la propiedad usando la llave 'campo'
    const valorA = (a[campo] || '').toString().toLowerCase();
    const valorB = (b[campo] || '').toString().toLowerCase();

    const esPrioritarioA = terminos.some(t => valorA.includes(t));
    const esPrioritarioB = terminos.some(t => valorB.includes(t));

    // Lógica de posición
    if (esPrioritarioA && !esPrioritarioB) return 1;
    if (!esPrioritarioA && esPrioritarioB) return -1;

    // Orden alfabético para el resto
    return valorA.localeCompare(valorB);
  });
};

soloNumeros(event: KeyboardEvent): void {
  const charCode = event.which ? event.which : event.keyCode;
  // Solo permite números del 0 al 9 (ASCII 48-57)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};
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
        id_subproyecto: rawValues.proyecto,
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
          id_municipio: rawValues.municipioResidencia || null,
          id_departamento: rawValues.departamentoResidencia || null,
          id_localidad: rawValues.localidad || null
        },
        formulario_data: [
          { "id_campo": 1049, "valor": rawValues.nacionalidad },
          { "id_campo": 1059, "valor": rawValues.edad },
          { "id_campo": 1039, "valor": rawValues.tipoDocumento },
          { "id_campo": 1056, "valor": rawValues.dptoExpedicion?.nombre_departamento || rawValues.dptoExpedicion },
          { "id_campo": 1065, "valor": rawValues.ciudadExpedicion?.nombre_municipio || rawValues.ciudadExpedicion }
        ]
      };

      console.log('Enviando datos al backend:', payload);

      this.http.post<RegisterResponse>(this.apiUrlRegister, payload).subscribe({
        next: (response) => {

          const idRespuesta = response.formulario?.id_respuesta;
          if (idRespuesta) {
            // Guardamos el ID correcto en el servicio
            this.dataSharingService.setIdRespuesta(idRespuesta);
            console.log('id_respuesta guardado:', idRespuesta);
            alert(`Participante registrado correctamente. ID de Formulario: ${idRespuesta}`);
          }
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
      return this.controlesPorPaso[this.pasoActual] || [];
  }
}
