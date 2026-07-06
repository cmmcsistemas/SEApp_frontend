import { Component, OnInit, ElementRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MonitoreoService } from '../../../services/monitoreo.service';
import { MonitoreoDiagnosticoService } from '../../../services/monitoreo-diagnostico.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HandMetal } from 'lucide-angular';
import { DataSharingService } from '../../../services/data-sharing.service';


interface Pregunta {
  id_campo: number;
  nombre_campo: string;
  opciones: string[];
}

// Interfaz para preguntas estáticas (para Pasos 2 y 3)
interface PreguntaEstatica {
  controlName: string;
  label: string;
  opciones: string[]; // Opciones predefinidas
  type?: 'number' | 'text' | 'select';
}

@Component({
  selector: 'app-monitoreos',
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, RouterLink, RouterLinkActive, CommonModule, HttpClientModule],
  templateUrl: './monitoreos.component.html',
  styleUrl: './monitoreos.component.css'
})
export class MonitoreosComponent implements OnInit {
  monitoreoGeneralForm!: FormGroup; // Paso 1 (Parte A)
  monitoreoDiagnosticoForm!: FormGroup; // Paso 1 (Parte B)
  monitoreoAccesoFinancieroForm!: FormGroup; // Formulario para la sección estática "Acceso Financiero" (Paso 2 y 3)
  monitoreoDiagnosticoEmpresarialForm!: FormGroup; // Formulario para la sección dinámica "Diagnóstico Empresarial" (Paso 4)

  // --- Almacenes de Preguntas ---
  preguntasHogar: Pregunta[] = []; // 13 dinámicas (Paso 1B)
  preguntasDiagnosticoEmpresarial: Pregunta[] = []; // Dinámicas (Paso 4)

  preguntasAccesoFinanciero: Pregunta[] = [];

    private readonly staticCampoIdMapping: { [key: string]: number } = {
    // Paso 1A: General
     estadoParticipante: 93, perteneceAsociacion: 161, nombreAsociacion: 66,
    asociacionMujeres: 164, codigoCiiu: 133, sectorEmpresarial: 132, arriendoServicios: 165,
    educacion: 166, obligaciones: 167, gastosOcacionales: 169, gastosCorrientes: 168,
    gastosTotales: 170, trabajosIndependientes: 95, emprendimientos: 96, otrosFamiliares: 97,
    pension: 98, empleados: 94, otrosIngresos: 99, otrosExplique: 100,
    totalIngresos: 101, totalIngresosDependiente: 102, distribucionIngresos: 163,
    // Paso 1B: Hogar (Fijos)
    tipoVivienda: 103, materialVivienda: 106, numeroDormitorios: 107, combustibleCocina: 108,
    estrato: 105, tiempoVivienda: 104,
    // Pasos 2 y 3: Acceso Financiero
    tieneCuentaAhorros: 136, tieneCuentaCorriente: 137, tieneCDT: 138, montoCredito: 139,
    numeroCuotas: 140, tieneSeguros: 141, tieneOtros: 142, dependeEconomicamente: 124,
    deQuienDepende: 125, horasCuidado: 126, horasRecreacion: 127, negocioTieneRUT: 131,
    registradoCC: 128, negocioNit: 129, numeroNit: 130, dondeOpera: 135,
    ingresosNegocio: 149, costosDirectos: 150, costosIndirectos: 151, gastosTotalesMensuales: 152,
    excedentesNegocio: 153, activoFijo: 154, activoNoFijo: 155, totalActivos: 156,
    pasivoCorto: 157, pasivoLargo: 158, totalPasivos: 159, patrimonio: 160,
    trabajadoresContrato: 145, trabajadoresSinContrato: 146, totalTrabajadores: 147,
    numeroSocios: 148, tipoLocal: 79
  };

  // Preguntas ESTÁTICAS para Acceso Financiero (Pasos 2 y 3)

  preguntasAF_Paso2: PreguntaEstatica[] = [
    { controlName: 'tieneCuentaAhorros', label: '¿Tiene cuenta de ahorros?', opciones: ['Si', 'No'], type: 'select' },
    { controlName: 'tieneCuentaCorriente', label: '¿Tiene cuenta corriente?', opciones: ['Si', 'No'], type: 'select' },
    { controlName: 'tieneCDT', label: '¿Tiene créditos?', opciones: ['Si', 'No'], type: 'select' },
    { controlName: 'montoCredito', label: 'Monto del crédito', opciones: [], type: 'number' }, // Tipo texto
    { controlName: 'numeroCuotas', label: 'Número de cuotas', opciones: [], type: 'number' },
    { controlName: 'tieneSeguros', label: '¿Tiene seguros?', opciones: ['Si', 'No'], type: 'select'  },
    { controlName: 'tieneOtros', label: 'Otro', opciones: ['Si', 'No'], type: 'select'  },
    { controlName: 'dependeEconomicamente', label: '¿Depende económicamente de alguien?', opciones: ['Si', 'No'], type: 'select'  },
    { controlName: 'deQuienDepende', label: '¿De quién depende?', opciones: ['Padres','Cónyuge','Hijos','Otro familiar', 'Otro no familiar','No aplica'], type: 'text'  }, // Tipo texto
    { controlName: 'horasCuidado', label: '¿Cuántas horas a la semana dedica al cuidado de personas a cargo?', opciones: [], type: 'number'  }, // Tipo texto
    { controlName: 'horasRecreacion', label: '¿Cuántas horas a la semana dedica a la recreación?', opciones: [] }, // Tipo texto
    { controlName: 'negocioTieneRUT', label: '¿El negocio tiene RUT?', opciones: ['Si', 'No'], type: 'select'  },
    { controlName: 'registradoCC', label: '¿El negocio está registrado en la Cámara de Comercio?', opciones: ['Si', 'No'], type: 'select'  }, // Tipo texto
    { controlName: 'negocioNit', label: '¿El negocio tiene NIT?', opciones: ['Si', 'No'], type: 'select'  }, // Tipo texto
    { controlName: 'numeroNit', label: 'Número NIT', opciones: [], type: 'number'  },
    { controlName: 'dondeOpera', label: '¿Dónde opera su unidad productiva?', opciones: ['Desde la vivienda', 'Local independiente a la vivienda con menos de 1 año de operación', 'Local independiente a la vivienda con 1-3 años de operación', 'Local independiente a la vivienda con más de 3 años de operación', 'No aplica'], type: 'select'  }
  ];

  preguntasAF_Paso3: PreguntaEstatica[] = [
    { controlName: 'ingresosNegocio', label: 'Ingresos del negocio (Mensuales)', opciones: [], type: 'number' },
    { controlName: 'costosDirectos', label: 'Costos directos (Mensuales)', opciones: [], type: 'number' },
    { controlName: 'costosIndirectos', label: 'Costos indirectos (Mensuales)', opciones: [], type: 'number' },
    { controlName: 'gastosTotalesMensuales', label: 'Gastos totales (Mensuales)', opciones: [], type: 'number' },
    { controlName: 'excedentesNegocio', label: 'Excedentes del negocio', opciones: [], type: 'number' },
    { controlName: 'activoFijo', label: 'Activo fijo', opciones: [], type: 'number' },
    { controlName: 'activoNoFijo', label: 'Activo no fijo', opciones: [], type: 'number' },
    { controlName: 'totalActivos', label: 'Total activos', opciones: [], type: 'number' },
    { controlName: 'pasivoCorto', label: 'Pasivo corto', opciones: [], type: 'number' },
    { controlName: 'pasivoLargo', label: 'Pasivo largo', opciones: [], type: 'number' },
    { controlName: 'totalPasivos', label: 'Total pasivos (Deudas del negocio)', opciones: [], type: 'number' },
    { controlName: 'patrimonio', label: 'Patrimonio del negocio', opciones: [], type: 'number' },
    { controlName: 'trabajadoresContrato', label: 'Total de trabajadores con contrato', opciones: [], type: 'number' },
    { controlName: 'trabajadoresSinContrato', label: 'Total de trabajadores sin contrato', opciones: [], type: 'number' },
    { controlName: 'totalTrabajadores', label: 'Total de trabajadores', opciones: [], type: 'number' },
    { controlName: 'numeroSocios', label: 'Cantidad de socios', opciones: [], type: 'number' },
    { controlName: 'tipoLocal', label: 'Tipo de local', opciones: ['Propio','Arriendo','Familiar','Hogar','Otro'], type: 'select' }
  ];

  opciones: string[] = [];
  opcionesSiNo: string[] = ['Sí', 'No'];
  opcionesGrupoParticipante: string[] = ['MICROEMPRESARIO', 'EMPRENDEDOR'];
  opcionesEstadoParticipante: string[] =['ACTIVO', 'INACTIVO'];
  opcionesSectorEmpresarial: string[] = ['Sector Industrial', 'Sector de Servicios', 'Sector de Comercio', 'Sector Agropecuario', 'Sector de Transporte', 'Sector Financiero','Sector de la Construcción', 'Sector Minero y Energético', 'Sector Solidario', 'Sector de Comunicaciones'];
  opcionesCombustibleCocina: string[] = ['Gas natural','Pipeta de gas','Gasolina','ACPM','Leña','Carbón','Energía eléctrica'];
  opcionesTiempoVivienda: string[] = ['0 a 6 meses','6 a 12 meses', '13 a 24 meses', '25 a 36 meses', '37 a 48 meses', 'Más de 4 años'];
  opcionesDistribucionIngresos: string[] = ['Él o ella misma', 'Esposo (a) o compañero (a)', 'Todos los que aportan al ingreso familiar', 'Todos los integrantes del hogar']
  codigoCiiu: any[] = [];

  private preguntas: any[] = [];
  pasoActual: number = 1;
  preguntasPorPaso = 22;
  totalPasos = 4;
  paginas = 0;
  contador = 0;
  totalPreguntasCalculado: number = 0;
  pasoActualDiagnostico: number = 1;

  idParticipanteActual: any = null;
  nombreParticipanteActual: string | null = null;
  idRespuestaActual: any = null;
  documentoParticipanteActual: string | number | null = null;

  tiposVivienda = [
    'ARRIENDO',
    'PROPIA',
    'FAMILIAR',
    'OTRA'
  ];
  materialesVivienda = [
    'CARTON',
    'OBRA GRIS',
    'OBRA DE ACABADOS',
    'LAMINA DE METAL',
    'MADERA',
    'PREFABRICADO',
    'LONA'
  ];
  combustiblesCocina = [
    'GAS NATURAL',
    'PIPETA DE GAS',
    'GASOLINA',
    'ACPM',
    'LEÑA',
    'CARBON',
    'ENERGIA ELECTRICA'
  ];
  tiemposVivienda = [
    '0 a 6 meses',
    '6 a 12 meses',
    '13 a 24 meses',
    '25 a 36 meses',
    '37 a 48 meses',
    'Más de 4 años'
  ];


  private formSubscription: Subscription = new Subscription();
  private calculationSubscription: Subscription = new Subscription();
  private apiUrlAddData = 'http://20.81.172.55:3900/api/participantes/add-data/';

  constructor(private fb: FormBuilder, private apiService: MonitoreoService, private apiDiagnosticoService: MonitoreoDiagnosticoService, private el: ElementRef, private http: HttpClient, private dataSharingService: DataSharingService
  ) {  }

  ngOnInit(): void {
    this.monitoreoGeneralForm = this.fb.group({
      estadoParticipante: ['', Validators.required],
      perteneceAsociacion: ['', [Validators.required]],
      nombreAsociacion: ['', [Validators.required]],
      asociacionMujeres: ['', Validators.required],
      codigoCiiu: ['', Validators.required],
      sectorEmpresarial: ['', [Validators.required]],
      arriendoServicios: ['', [Validators.required]],
      educacion: ['', [Validators.required]],
      obligaciones: ['', [Validators.required]],
      gastosOcacionales: ['', [Validators.required]],
      gastosCorrientes: ['', [Validators.required]],
      gastosTotales: [{ value: 0, disabled: true }, [Validators.required]],
      trabajosIndependientes: ['', [Validators.required]],
      emprendimientos: ['', [Validators.required]],
      otrosFamiliares: ['', [Validators.required]],
      pension: ['', [Validators.required]],
      empleados: ['', [Validators.required]],
      otrosIngresos: ['', [Validators.required]],
      otrosExplique: [''],
      totalIngresos: [{ value: 0, disabled: true }, [Validators.required]],
      totalIngresosDependiente: ['', [Validators.required]],
      distribucionIngresos:['', [Validators.required]]
    });
    // ✅ Segundo bloque de preguntas (Paso 2)
    this.monitoreoDiagnosticoForm = this.fb.group({
      // Las 6 preguntas estáticas de "Hogar"
      tipoVivienda: ['', Validators.required],
      materialVivienda: ['', Validators.required],
      numeroDormitorios: ['', Validators.required], // Asumo este controlName
      combustibleCocina: ['', Validators.required], // Asumo este controlName
      estrato: ['', Validators.required, Validators.min(0), Validators.max(6), Validators.pattern('^[0-6]$')], // Asumo este controlName
      tiempoVivienda: ['', Validators.required] // Asumo este controlName
    });

    this.loadPreguntasHogar();

    this.monitoreoAccesoFinancieroForm = this.fb.group({});

    this.preguntasAF_Paso2.forEach(pregunta => {
      this.monitoreoAccesoFinancieroForm.addControl(pregunta.controlName, new FormControl('', Validators.required));
    });

    this.preguntasAF_Paso3.forEach(pregunta => {
      this.monitoreoAccesoFinancieroForm.addControl(pregunta.controlName, new FormControl('', Validators.required));
    });

    const todasPreguntasAF = [...this.preguntasAF_Paso2, ...this.preguntasAF_Paso3];

    todasPreguntasAF.forEach(pregunta => {

      const camposCalculados = ['gastosTotalesMensuales', 'excedentesNegocio','totalActivos','totalPasivos','patrimonio','totalTrabajadores'];
      const isCalculated = camposCalculados.includes(pregunta.controlName);
      let validators = isCalculated ? [] : [Validators.required];
      if (pregunta.type === 'number') {
        // 🟢 Regex que permite solo dígitos (números enteros positivos)
        validators.push(Validators.pattern('^[0-9]+$'));
      }

      this.monitoreoAccesoFinancieroForm.addControl(pregunta.controlName, new FormControl({ value: 0, disabled: isCalculated }, validators));
    });

    this.monitoreoDiagnosticoEmpresarialForm = this.fb.group({});
    this.loadPreguntasDiagnosticoEmpresarial();
    this.codigosCiiu();
    // Calculamos el número total de pasos basado en el total de preguntas
    //this.totalPasos = Math.ceil(this.preguntas.length / this.preguntasPorPaso);
    this.paginas = Math.ceil(this.preguntas.length / this.preguntasPorPaso);

    // Creamos un FormControl por cada pregunta dinámicamente
    //this.preguntas.forEach(pregunta => {
     // const controlName = `pregunta_${pregunta.id}`;
      // Añadimos un control al formGroup con un valor inicial nulo y lo marcamos como requerido
     // this.monitoreoDiagnosticoForm.addControl(
     //   controlName,
      //  this.fb.control(null, Validators.required)
    //  );
   // });
   this.monitoreoGeneralForm.valueChanges.subscribe(() => this.actualizarContador());
    this.monitoreoDiagnosticoForm.valueChanges.subscribe(() => this.actualizarContador());
    this.monitoreoAccesoFinancieroForm.valueChanges.subscribe(() => this.actualizarContador());
    this.monitoreoDiagnosticoEmpresarialForm.valueChanges.subscribe(() => this.actualizarContador());

    // Llamada inicial para ver el estado al cargar (probablemente 0)
    // Nota: Es mejor llamar a esto TAMBIÉN después de cargar las preguntas dinámicas en tus 'subscribe'
    this.setupGastosTotalesCalculation();
    this.setupIngresosTotalesCalculation();
    this.setupCalculosNegocioPaso3();
    this.actualizarContador();
    this.setupControlCondicionalAsociacion();

  }

    setupCalculosNegocioPaso3(): void {
    const form = this.monitoreoAccesoFinancieroForm;
    const inputs = ['ingresosNegocio', 'costosDirectos', 'costosIndirectos', 'activoFijo', 'activoNoFijo', 'pasivoCorto', 'pasivoLargo', 'trabajadoresContrato', 'trabajadoresSinContrato'];

    const observables = inputs.map(name => form.get(name)!.valueChanges);

    this.calculationSubscription.add(
      merge(...observables).pipe(debounceTime(100)).subscribe(() => {
        const ingresos = Number(form.get('ingresosNegocio')?.value);
        const directos = Number(form.get('costosDirectos')?.value) ;
        const indirectos = Number(form.get('costosIndirectos')?.value);

        const activosFijo = Number(form.get('activoFijo')?.value) ;
        const activosNoFijo = Number(form.get('activoNoFijo')?.value) ;
        const pasivosCorto = Number(form.get('pasivoCorto')?.value) ;
        const pasivosLargo = Number(form.get('pasivoLargo')?.value) ;
        const trabajadoresContratos = Number(form.get('trabajadoresContrato')?.value) ;
        const trabajadoresSinContratos = Number(form.get('trabajadoresSinContrato')?.value) ;

        const totalGastos = directos + indirectos;
        const excedentes = ingresos - totalGastos;
        const totalesActivos = activosFijo + activosNoFijo;
        const totalesPasivos = pasivosCorto + pasivosLargo;
        const patrimonios = totalesActivos - totalesPasivos;
        const totalTrabajadores = trabajadoresContratos + trabajadoresSinContratos;

        // Actualizamos los campos deshabilitados
        form.get('gastosTotalesMensuales')?.setValue(totalGastos, { emitEvent: false });
        form.get('excedentesNegocio')?.setValue(excedentes, { emitEvent: false });
        form.get('totalActivos')?.setValue(totalesActivos, { emitEvent: false });
        form.get('totalPasivos')?.setValue(totalesPasivos, { emitEvent: false });
        form.get('patrimonio')?.setValue(patrimonios, { emitEvent: false });
        form.get('totalTrabajadores')?.setValue(totalTrabajadores, { emitEvent: false });
      })
    );
  }

  private setupControlCondicionalAsociacion(): void {
    this.formSubscription.add(
      this.monitoreoGeneralForm.get('perteneceAsociacion')?.valueChanges.subscribe(value => {
        const nombreCtrl = this.monitoreoGeneralForm.get('nombreAsociacion');
        const mujeresCtrl = this.monitoreoGeneralForm.get('asociacionMujeres');

        if (value === 'No') {
          nombreCtrl?.setValue(null);
          mujeresCtrl?.setValue(null);
          nombreCtrl?.disable();
          mujeresCtrl?.disable();
        } else {
          nombreCtrl?.enable();
          mujeresCtrl?.enable();
        }
      })
    );
  }

  soloNumeros(event: KeyboardEvent): void {
  const target = event.target as HTMLInputElement;
  const charCode = event.which ? event.which : event.keyCode;

  // Bloquear si no es número
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
    return;
  }

  // Si el campo es 'estrato', limitar a 1 solo dígito
  if (target.id === 'estrato' && target.value.length >= 1) {
    event.preventDefault();
  }
}


   setupGastosTotalesCalculation(): void {
    const camposAResumir = [
      'arriendoServicios',
      'educacion',
      'obligaciones',
      'gastosCorrientes',
      'gastosOcacionales'
    ];

    const observables = camposAResumir.map(name =>
      this.monitoreoGeneralForm.get(name)!.valueChanges
    );

    this.calculationSubscription = merge(...observables)
      .pipe(debounceTime(100))
      .subscribe(() => {
        const total = camposAResumir.reduce((acc, curr) => {
          const valor = this.monitoreoGeneralForm.get(curr)?.value;
          return acc + (Number(valor) || 0);
        }, 0);

        this.monitoreoGeneralForm.get('gastosTotales')?.setValue(total, { emitEvent: false });
      });
  }

  setupIngresosTotalesCalculation (): void {
       const camposAResumir = [
      'trabajosIndependientes',
      'emprendimientos',
      'otrosFamiliares',
      'pension',
      'empleados',
      'otrosIngresos'
    ];

    const observables = camposAResumir.map(name =>
      this.monitoreoGeneralForm.get(name)!.valueChanges
    );

    this.calculationSubscription = merge(...observables)
      .pipe(debounceTime(100))
      .subscribe(() => {
        const total = camposAResumir.reduce((acc, curr) => {
          const valor = this.monitoreoGeneralForm.get(curr)?.value;
          return acc + (Number(valor) || 0);
        }, 0);

        this.monitoreoGeneralForm.get('totalIngresos')?.setValue(total, { emitEvent: false });
      });
  }

  actualizarContador(): void {
    let respuestas = 0;
    let totalControles = 0;
    // Array con todos tus formularios activos
    const formularios = [
      this.monitoreoGeneralForm,
      this.monitoreoDiagnosticoForm,
      this.monitoreoAccesoFinancieroForm,
      this.monitoreoDiagnosticoEmpresarialForm
    ];

    formularios.forEach(form => {
      // Asegurarnos de que el formulario esté inicializado
      if (form && form.controls) {
        for (const controlName in form.controls) {
          if (form.controls.hasOwnProperty(controlName)) {
            totalControles++; // Cuenta este control como una "pregunta"

            const control = form.controls[controlName];
            const valor = control.value;

            // Tu lógica de validación para saber si está respondida
            if (valor !== null && valor !== undefined && valor !== '' && (typeof valor !== 'string' || valor.trim() !== '')) {
              respuestas++;
            }
          }
        }
      }
    });

    this.contador = respuestas;
    this.totalPreguntasCalculado = totalControles;

    // Mostrar en consola
    console.log(`📊 Progreso General: ${this.contador} de ${this.totalPreguntasCalculado} preguntas completadas.`);
  }

    codigosCiiu(): void{
      this.http.get<any[]>('http://20.81.172.55:3900/api/basica/ciiu')
      .subscribe({
        next: (data) => {
          this.codigoCiiu = data.map(ciiu => `${ciiu.id} ${ciiu.data}`);
          console.log('Codigos obtenidos de la API:', this.codigoCiiu);
        },
        error: (error) => {
          console.error('Error al obtener los codigos:', error);
        }
      });
    }

    loadPreguntasHogar(): void {
    // Llamada a la API para obtener las preguntas tipo M1 (109-121)
    this.apiService.getPreguntasMonitoreo().subscribe({
      next: (preguntas) => {
        this.preguntasHogar = preguntas;
        // Añadir dinámicamente los controles al formulario de diagnóstico
        preguntas.forEach(pregunta => {
          const controlName = `pregunta_${pregunta.id_campo}`;
          // Añadimos el control con el validador de requerido
          this.monitoreoDiagnosticoForm.addControl(controlName, new FormControl('', Validators.required));
        });
        console.log('Preguntas de hogar cargadas y formulario actualizado.');
      },
      error: (err) => {
        console.error('Error al cargar preguntas del hogar:', err);
        // Manejo de error: podrías mostrar un mensaje al usuario
      }
    });
  }

  loadPreguntasDiagnosticoEmpresarial(): void {
     this.apiDiagnosticoService.getPreguntasDiagnostico().subscribe({
      next: (preguntas) => {
        this.preguntasDiagnosticoEmpresarial = preguntas;
        preguntas.forEach(pregunta => {
          const controlName = `pregunta_${pregunta.id_campo}`;
           this.monitoreoDiagnosticoEmpresarialForm.addControl(controlName, new FormControl('', Validators.required));
        });
         console.log('Preguntas de Diagnóstico Empresarial cargadas.');
      },
      error: (err) => console.error('Error al cargar preguntas de Diagnóstico Empresarial:', err)
    });
  }

  get preguntasPasoActualHogar(): Pregunta[] {
    const inicio = (this.pasoActualDiagnostico - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntasHogar.slice(inicio, fin);
  }

  get preguntasPasoActual(): Pregunta[] {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntasHogar.slice(inicio, fin);
    }



    // ✅ SOLUCIÓN: Agrega el método 'atras()'
  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }


  // ✅ SOLUCIÓN: Agrega el método 'siguiente()'
  siguiente(): void {
// Valida el/los formularios del paso actual
    if (!this.validarPasoActual()) {
      //alert('Por favor, responde todas las preguntas obligatorias de esta sección.');
      this.scrollToFirstInvalidControl();
      return;
    }
    // Avanza si es válido
    if (this.pasoActual < this.totalPasos) {
      this.pasoActual++;
    }
  }

  validarPasoActual(): boolean {
    let esValido = true;
    if (this.pasoActual === 1) {
      // Validar AMBOS formularios del Paso 1
      if (this.monitoreoGeneralForm.invalid) {
        this.monitoreoGeneralForm.markAllAsTouched();
        esValido = false;
      }
      if (this.monitoreoDiagnosticoForm.invalid) {
        this.monitoreoDiagnosticoForm.markAllAsTouched();
        esValido = false;
      }
    } else if (this.pasoActual === 2) {
      // Validar solo los controles visibles del Paso 2
      esValido = this.validarControlesEstaticos(this.preguntasAF_Paso2, this.monitoreoAccesoFinancieroForm);
    } else if (this.pasoActual === 3) {
      // Validar solo los controles visibles del Paso 3
      esValido = this.validarControlesEstaticos(this.preguntasAF_Paso3, this.monitoreoAccesoFinancieroForm);
    } else if (this.pasoActual === 4) {
      if (this.monitoreoDiagnosticoEmpresarialForm.invalid) {
        this.monitoreoDiagnosticoEmpresarialForm.markAllAsTouched();
        esValido = false;
      }
    }
    return esValido;
  }

  scrollToFirstInvalidControl(): void {
    let formsToSearch: FormGroup[] = [];

    // 1. Identifica qué formularios revisar según el paso
    if (this.pasoActual === 1) {
      formsToSearch = [this.monitoreoGeneralForm, this.monitoreoDiagnosticoForm];
    } else if (this.pasoActual === 2 || this.pasoActual === 3) {
      formsToSearch = [this.monitoreoAccesoFinancieroForm];
    } else if (this.pasoActual === 4) {
      formsToSearch = [this.monitoreoDiagnosticoEmpresarialForm];
    }

    // 2. Itera sobre los formularios de este paso
    for (const form of formsToSearch) {
      for (const controlName in form.controls) {
        // 3. Encuentra el primer control que sea inválido
        if (form.controls[controlName].invalid) {

          console.error(`Error de validación: El campo "${controlName}" es inválido.`);

          // 4. Busca el elemento en el HTML usando su formControlName
          const invalidControl = this.el.nativeElement.querySelector(
            `[formControlName="${controlName}"]`
          );

          if (invalidControl) {
            // 5. Si lo encuentra, hace scroll y lo enfoca
            invalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            invalidControl.focus();
            invalidControl.style.outline = '1px solid #008f4c';
            invalidControl.style.boxShadow = '0 0 2px rgba(18, 161, 75, 0.5)';
            invalidControl.style.borderRadius = '0.375rem';

            // Muestra un mensaje más útil
            console.warn(`Se ha movido el foco al campo "${controlName}" que falta por completar.`);
            return; // Se detiene en el primer error que encuentra
          }
        }
      }
    }
  }

  /**
   * Helper para validar solo los controles estáticos visibles en Pasos 2 y 3
   */
  validarControlesEstaticos(preguntas: PreguntaEstatica[], form: FormGroup): boolean {
    let esValido = true;
    for (const pregunta of preguntas) {
      const control = form.get(pregunta.controlName);
      if (control?.invalid) {
        control.markAsTouched();
        esValido = false;
      }
    }
    return esValido;
  }

  guardarFormularioCompleto(): void {
    const idRespuesta = this.dataSharingService.getIdRespuesta();
    if (!idRespuesta) {
      alert('Error: No se encontró el ID de respuesta. Registre los datos básicos primero en el módulo de Caracterización');
      return;
    }

    if (this.monitoreoGeneralForm.valid && this.monitoreoDiagnosticoForm.valid &&
        this.monitoreoAccesoFinancieroForm.valid && this.monitoreoDiagnosticoEmpresarialForm.valid) {

      const formulario_data: { id_campo: number, valor: string }[] = [];

      // 1. Procesar formularios estáticos mediante el mapa
      const staticForms = [this.monitoreoGeneralForm, this.monitoreoDiagnosticoForm, this.monitoreoAccesoFinancieroForm];
      staticForms.forEach(form => {
        const values = form.getRawValue();
        Object.keys(values).forEach(key => {
          const id = this.staticCampoIdMapping[key];
          if (id) {
            formulario_data.push({ id_campo: id, valor: values[key]?.toString() || '' });
          }
        });
      });

      // 2. Procesar formularios dinámicos (Paso 1B y Paso 4) extrayendo el ID del nombre
      const dynamicForms = [this.monitoreoDiagnosticoForm, this.monitoreoDiagnosticoEmpresarialForm];
      dynamicForms.forEach(form => {
        const values = form.getRawValue();
        Object.keys(values).forEach(key => {
          if (key.startsWith('pregunta_')) {
            const id = Number(key.replace('pregunta_', ''));
            formulario_data.push({ id_campo: id, valor: values[key]?.toString() || '' });
          }
        });
      });

      const payload = {
        id_respuesta: idRespuesta,
        formulario_data: formulario_data
      };

      console.log('Enviando Monitoreo Completo:', payload);

      this.http.post(this.apiUrlAddData, payload).subscribe({
        next: (res) => {
          console.log('Monitoreo guardado exitosamente:', res);
          alert('Monitoreo guardado con éxito.');
        },
        error: (err) => {
          console.error('Error al guardar monitoreo:', err);
          alert('Hubo un error al guardar el monitoreo.');
        }
      });

    } else {
      alert('Error: El formulario contiene campos inválidos.');
    }
  }

  getControlEstatico(controlName: string): AbstractControl | null {
    return this.monitoreoAccesoFinancieroForm.get(controlName);
  }
}
