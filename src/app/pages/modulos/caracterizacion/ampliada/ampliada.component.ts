import { Component, OnDestroy, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { DataSharingService } from '../../../../services/data-sharing.service';
import { HttpClient,HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-ampliada',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ampliada.component.html',
  styleUrl: './ampliada.component.css',
  providers: [CurrencyPipe]
})
export class AmpliadaComponent implements OnInit, OnDestroy {
  caracterizacionAmpliadaForm!: FormGroup;
  pasoActual: number = 1;
  preguntasPorPaso = 9;
  totalPasos = 0;
  contador = 0;
  paginas = 2;

    // 🟢 Variables para mostrar en la UI
  idParticipanteActual: any = null;
  nombreParticipanteActual: string | null = null;
  idRespuestaActual: any = null;
  documentoParticipanteActual: string | number | null = null;

  opciones: string[] = ['Sí', 'No'];

  nivelesEscolaridad = [
    'ANALFABETA',
    'ESPECIALIZACIADO O MAESTRIA',
    'NO DICE',
    'NINGUNA',
    'POSTGRADO',
    'PREESCOLAR',
    'PRIMARIA',
    'PRIMARIA INCOMPLETA',
    'SECUNDARIA',
    'SECUNDARIA INCOMPLETA',
    'SIN ESCOLARIDAD, PERO SABE LEER Y ESCRIBIR',
    'TECNICO',
    'TECNOLOGO',
    'TECNOLOGO INCOMPLETO',
    'UNIVERSIDAD INCOMPLETO',
    'UNIVERSIDAD PROFESIONAL'
  ];

    tiposContrato = [
    'TERMINO FIJO',
    'TEMPORAL',
    'INDEFINIDO',
    'OBRA O LABOR',
    'APRENDIZAJE',
    'PRESTACIóN DE SERVICIOS',
    'NO APLICA',
    'NO DICE'
  ];

    // 🟢 MAPEO DE IDs DE CAMPO PARA CARACTERIZACIÓN AMPLIADA
  // Estos IDs deben coincidir con los registros en tu tabla 'campo_formulario'
  private readonly campoIdMapping: { [key: string]: number } = {
    formacion: 1185,
    nivelEscolaridad: 1186,
    vinculoLaboral: 1188,
    antiguedad: 1189,
    tipoContrato: 1190,
    promedioIngresos: 1191,
    independiente: 1192,
    tieneRut: 1193,
    promedioIngresosActividad: 1194,
    cabezaFamilia: 1195,
    hijos: 1196,
    integratesHogar: 1197,
    personasAcargo: 1198,
    sistemaSalud: 1199,
    sistemaSaludCubre: 1200,
    cotizaPension: 1201,
    ARL: 1202,
    factoresProyecto: 1203,
    observaciones: 1204
  };

  promedioIngresosActividad: number =0;

  constructor(private fb: FormBuilder, private dataSharingService: DataSharingService, private http: HttpClient) {};

  private formSubscription: Subscription = new Subscription();
  private idSubscription: Subscription = new Subscription();
  private preguntas: any[] = [];
  private apiUrlAddData = 'http://20.81.172.55:3900/api/participantes/add-data/';

  ngOnInit(): void {
        this.caracterizacionAmpliadaForm = this.fb.group({
      formacion: ['', Validators.required],
      nivelEscolaridad: ['', Validators.required],
      vinculoLaboral: [''],
      antiguedad: ['', Validators.required],
      tipoContrato: [''],
      promedioIngresos: [''],
      independiente: [''],
      tieneRut: [''],
      promedioIngresosActividad: [''],
            // ✅ Segundo bloque de preguntas (Paso 2)
      cabezaFamilia: [''],
      hijos: ['', Validators.required],
      integratesHogar: [''],
      personasAcargo: [''],
      sistemaSalud: [''],
      sistemaSaludCubre: [''],
      cotizaPension: [''],
      ARL: [''],
      factoresProyecto: [''],
      observaciones: ['']
  });
    this.preguntas = Object.keys(this.caracterizacionAmpliadaForm.controls);
    this.totalPasos = this.preguntas.length ;

    // ✅ Nueva suscripción al valor del formulario completo
    this.formSubscription.add(this.caracterizacionAmpliadaForm.valueChanges.subscribe(value => {
      // Envía el valor del grupo de participante al servicio compartido
      this.dataSharingService.updateGrupoParticipante(value.grupoParticipante);
      // Aquí puedes realizar otras acciones basadas en los cambios de otros campos si es necesario.
      this.actualizarContador();
      console.log('Cambios en el formulario detectados:', value);
    }));

    this.actualizarContador();

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
      this.caracterizacionAmpliadaForm.valueChanges.subscribe(() => this.actualizarContador())
    );

    const currentId = this.dataSharingService.getIdRespuesta();
    if (currentId) {
      console.log('🏠 ID detectado al iniciar el componente:', currentId);
      this.cargarDatosSeccion(currentId);
    }

};

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria
    this.formSubscription.unsubscribe();
  };

  actualizarContador(): void {
    let count = 0;
    // Recorre todos los controles del formulario
    for (const controlName in this.caracterizacionAmpliadaForm.controls) {
      if (this.caracterizacionAmpliadaForm.controls.hasOwnProperty(controlName)) {
        const control = this.caracterizacionAmpliadaForm.controls[controlName];
        // Comprueba si el control tiene un valor que no sea nulo o un string vacío
        if (control.value !== null && control.value !== '' && (typeof control.value !== 'string' || control.value.trim() !== '')) {
          count++;
        }
      }
    }
    this.contador = count;
    console.log(`Preguntas completadas: ${this.contador} de ${this.preguntas.length}`);
  }

  atras(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      console.log('Volviendo al paso:', this.pasoActual);
    }
  };

  siguiente(): void {
   if (this.pasoActual === this.paginas) {
      this.guardarProgreso();
    } else {
      this.pasoActual++;
      console.log('Avanzando al paso:', this.pasoActual);
    }
  }

  cargarDatosSeccion(id: number | string) {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  const url = `http://20.81.172.55:3900/api/participantes/formulario-completo?id_respuesta=${id}`;

   console.log('🚀 Iniciando consulta a:', url);

      this.http.get<any>(url, { headers }).subscribe({
      next: (res) => {
        // Accedemos a la estructura correcta observada en tus logs
        const datosBD = res?.data?.detalles || res?.formulario_data || [];

        console.log('✅ Detalles recibidos:', datosBD.length, 'campos encontrados.');

        if (datosBD.length === 0) return;

        const payloadParaFormulario: any = {};

        // Mapeamos los IDs de la base de datos a los controles del formulario
        Object.keys(this.campoIdMapping).forEach(nombreControl => {
          const idBuscado = this.campoIdMapping[nombreControl];
          const coincidencia = datosBD.find((item: any) => item.id_campo === idBuscado);
          if (coincidencia) {
            payloadParaFormulario[nombreControl] = coincidencia.valor;
          }
        });

        // Actualizamos el formulario de forma silenciosa
        this.caracterizacionAmpliadaForm.patchValue(payloadParaFormulario, { emitEvent: false });
        this.actualizarContador();
        console.log('✨ Formulario Ampliada autocompletado.');
      },
      error: (err) => console.error('❌ Error al cargar datos de sección:', err)
    });
}

  guardarProgreso() {
    if (this.caracterizacionAmpliadaForm.valid) {
      const idRespuesta = this.dataSharingService.getIdRespuesta();

      if (!idRespuesta) {
        alert('Error: No se encontró el ID de respuesta. Por favor, complete primero los datos básicos.');
        return;
      }

      const rawValues = this.caracterizacionAmpliadaForm.getRawValue();

      // Mapeamos los campos del formulario al array formulario_data
      const formulario_data = Object.keys(rawValues).map(key => {
        const valorOriginal = rawValues[key];

        return {
          id_campo: this.campoIdMapping[key],
          valor: (valorOriginal === null || valorOriginal === undefined) ? '' : valorOriginal.toString()
        };
      }).filter(item => item.id_campo !== undefined);

      const payload = {
        id_respuesta: idRespuesta,
        formulario_data: formulario_data
      };

      console.log('Enviando Caracterización Ampliada:', payload);

      this.http.post(this.apiUrlAddData, payload).subscribe({
        next: (response) => {
          console.log('Inserción exitosa:', response);
          alert('Caracterización Ampliada guardada correctamente.');
        },
        error: (error) => {
          console.error('Error al insertar datos:', error);
          alert('Hubo un error al guardar la información.');
        }
      });

    } else {
      this.caracterizacionAmpliadaForm.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  get preguntasPasoActual() {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntas.slice(inicio, fin);
  }

}
