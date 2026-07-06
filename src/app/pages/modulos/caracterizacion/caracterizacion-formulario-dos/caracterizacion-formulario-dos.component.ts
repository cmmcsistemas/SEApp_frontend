import { Component, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
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

interface PreguntaDinamica {
  id_campo: number;
  nombre_campo: string;
  opciones: string[];
}

@Component({
  selector: 'app-caracterizacion-formulario-dos',
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './caracterizacion-formulario-dos.component.html',
  styleUrl: './caracterizacion-formulario-dos.component.css'
})
export class CaracterizacionFormularioDosComponent implements OnInit, OnDestroy{
  caracterizacionForm!: FormGroup;
  pasoActual: number = 1;
  totalPasos: number = 2;
  contador = 0;
  totalPreguntasGlobal = 0;

    // ✅ Lista de tipos de documento
  tiposDocumento = [
    'Cédula de ciudadanía (CC)',
    'Cédula de extranjería (CE)',
    'Permiso especial de permanencia (PEP)',
    'Pasaporte (PA)',
    'Permiso por protección temporal (PPT)'
  ];

  estadosCivil = [
    'Soltero(a)',
    'Casado(a)',
    'Unión libre(a)',
    'Divorciado(a)',
    'Viudo(a)'
  ];

  estratos =[
    'Estrato 1',
    'Estrato 2',
    'Estrato 3',
    'Estrato 4',
    'Estrato 5',
    'Estrato 6'
  ];

  nivelesEscolaridad = [
    'Ninguna',
    'Analfabeta',
    'Sin escolaridad, pero lee y escribe',
    'Preescolar',
    'Primaria Incompleta',
    'Primaria',
    'Secundaria Incompleta',
    'Secundaria',
    'Tecnólogo Incompleto',
    'Técnico',
    'Tecnólogo',
    'Universidad Incompleta',
    'Universitario Profesional',
    'Postgrado',
    'Especializado o Maestría'
  ];


  proyectos: any[] = [];
  departamentos: any[] = [];
  municipios: any[] = [];
  localidades: any[] = [];
  paises: any[] = [];
  municipiosFiltrados: any[] = [];
  generos: any[] = [];
  entornosResidencias: any [] = [];
  preguntasBackend: PreguntaDinamica[] = [];


  idParticipanteActual: any = null;
  nombreParticipanteActual: string | null = null;
  idRespuestaActual: any = null;
  documentoParticipanteActual: string | number | null = null;

private formSubscription: Subscription = new Subscription();
private preguntas: any[] = [];
private apiUrlRegister = 'http://20.81.172.55:3900/api/participantes/register/';
private readonly apiUrlDinamica = 'http://20.81.172.55:3900/api/formularios/por-tipo/14';
private apiUrlAddData = 'http://20.81.172.55:3900/api/participantes/add-data/';
private idSubscription: Subscription = new Subscription();

  private readonly controlesPorPaso: { [key: number]: string[] } = {
    1: [
      'proyecto', 'nombre', 'apellido', 'tipoDocumento', 'noDocumento',
      'dptoExpedicion', 'ciudadExpedicion', 'fechaNacimiento', 'estadoCivil',
      'paisResidencia', 'departamentoResidencia', 'municipioResidencia',
      'localidad', 'entornoResidencia', 'direccion', 'estrato',
      'numeroCelular', 'email', 'nivelEscolaridad', 'genero'
    ],
    2: [] // Se llena dinámicamente al cargar las preguntas del backend
  };

constructor(private fb: FormBuilder, private dataSharingService: DataSharingService, private http: HttpClient, private el: ElementRef,) {}


  ngOnInit(): void {
    this.initForm();
    this.loadCatalogos();
    this.loadPreguntasDinamicas();
    this.setupSubscriptions();
  }


private initForm(): void {
    this.caracterizacionForm = this.fb.group({
      proyecto: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      noDocumento: ['', [Validators.required, Validators.minLength(5)]],
      dptoExpedicion: ['', Validators.required],
      ciudadExpedicion: [''],
      fechaNacimiento: ['', Validators.required],
      edad: [{value: '', disabled: true}],
      estadoCivil: ['', Validators.required],
      paisResidencia: ['', Validators.required],
      departamentoResidencia: [''],
      municipioResidencia: [''],
      localidad: [''],
      entornoResidencia: ['', Validators.required],
      direccion: ['', Validators.required],
      estrato:['', Validators.required],
      numeroCelular: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      nivelEscolaridad: ['', Validators.required],
      genero: ['', Validators.required]
    });
  }

  private loadPreguntasDinamicas(): void {
        this.http.get<PreguntaDinamica[]>(this.apiUrlDinamica).subscribe({
      next: (data) => {
        this.preguntasBackend = data;
        data.forEach(pregunta => {
          const controlName = `pregunta_${pregunta.id_campo}`;
          this.caracterizacionForm.addControl(controlName, new FormControl('', Validators.required));
          this.controlesPorPaso[2].push(controlName);
        });
        this.totalPreguntasGlobal = Object.keys(this.caracterizacionForm.controls).length;
        this.setupDependenciasLogicas();
        this.actualizarContador();
      },
      error: (err) => console.error('Error cargando preguntas dinámicas:', err)
    });
  }

//Triggers
    private setupDependenciasLogicas(): void {
    const dependencias = [
      { trigger: 'pregunta_1212', target: 'pregunta_1213', value: 'Sí' },
      { trigger: 'pregunta_1214', target: 'pregunta_1215', isNot: 'No' },
      { trigger: 'pregunta_1219', target: ['pregunta_1220', 'pregunta_1221'], value: 'Sí' },
      { trigger: 'pregunta_1222', target: ['pregunta_1223', 'pregunta_1224', 'pregunta_1225'], value: 'Sí' },
      { trigger: 'pregunta_1226', target: ['pregunta_1227', 'pregunta_1228'], value: 'Sí' }
    ];

    dependencias.forEach(dep => {
      this.formSubscription.add(
        this.caracterizacionForm.get(dep.trigger)?.valueChanges.subscribe(val => {
          const targets = Array.isArray(dep.target) ? dep.target : [dep.target];
          targets.forEach(t => {
            const ctrl = this.caracterizacionForm.get(t);
            // Si la condición de activación se cumple (Ej. val es 'Sí')
            const condition = dep.isNot ? (val && !val.includes(dep.isNot)) : (val === dep.value);

            if (condition) {
              ctrl?.enable();
              ctrl?.setValidators(Validators.required);
            } else {
              ctrl?.setValue('NULL');
              ctrl?.disable();
              ctrl?.clearValidators();
            }
            ctrl?.updateValueAndValidity({ emitEvent: false });
          });
        })
      );
    });
  }

  private setupSubscriptions(): void {
    this.formSubscription.add(this.dataSharingService.idRespuesta$.subscribe(id => {
      this.idRespuestaActual = id;
      if (id) this.cargarDatosSeccion(id);
    }));
    this.formSubscription.add(this.dataSharingService.nombreParticipante$.subscribe(n => this.nombreParticipanteActual = n));
    this.formSubscription.add(this.dataSharingService.idParticipante$.subscribe(id => this.idParticipanteActual = id));
    this.formSubscription.add(this.dataSharingService.documentoParticipante$.subscribe(doc => this.documentoParticipanteActual = doc));
    this.formSubscription.add(this.dataSharingService.participanteCompleto$.subscribe(p => p && this.patchEstaticos(p)));
    this.formSubscription.add(this.caracterizacionForm.valueChanges.subscribe(() => this.actualizarContador()));
  }

    private patchEstaticos(p: any): void {
    this.caracterizacionForm.patchValue({
      nombre: p.nombre,
      apellido: p.apellido,
      email: p.email,
      noDocumento: p.documento,
      numeroCelular: p.telefono,
      direccion: p.direccion || '',
      fechaNacimiento: p.fecha_nacimiento ? p.fecha_nacimiento.split('T')[0] : ''
    }, { emitEvent: true });
  }


  private loadCatalogos(): void {
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/subproyectos').subscribe(d => this.proyectos = d);
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/paises').subscribe(d => this.paises = d);
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/departamentos').subscribe(d => this.departamentos = d);
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/generos').subscribe(d => this.generos = d);
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/entornos').subscribe(d => this.entornosResidencias = d);

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
    'Cédula de ciudadanía (CC)',
    'Permiso por protección temporal (PPT)'
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
      entornoResidencia: p.tipo_entorno || null,
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
        id_entorno: rawValues.entornoResidencia,
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
