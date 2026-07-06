import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { DiagnosticoService, DiagnosticoPregunta } from '../../../../services/diagnostico.service';
import { Subscription } from 'rxjs';
import { DataSharingService } from '../../../../services/data-sharing.service';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-diagnostico',
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './diagnostico.component.html',
  styleUrl: './diagnostico.component.css'
})

export class DiagnosticoComponent implements OnInit, OnDestroy {
  diagnosticoForm!: FormGroup;
  preguntas: DiagnosticoPregunta[] = [];

  pasoActual: number = 1;
  preguntasPorPaso = 10;
  totalPasos = 0;
  totalPreguntas = 0;
  contador = 0;


  idParticipanteActual: any = null;
  nombreParticipanteActual: string | null = null;
  idRespuestaActual: any = null;
  documentoParticipanteActual: string | number | null = null;

  private formValueChangesSubscription: Subscription = new Subscription();
  private apiUrlAddData = 'http://20.81.172.55:3900/api/participantes/add-data/';
  private idSubscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private diagnosticoService: DiagnosticoService,
    private dataSharingService: DataSharingService,
    private http: HttpClient
  ) {
    // Inicializamos el formulario vacío
    this.diagnosticoForm = this.fb.group({});
 }

  ngOnInit(): void {
    this.diagnosticoService.getPreguntasDiagnostico().subscribe(
      (data) => {
        this.preguntas = data;
        this.totalPasos = Math.ceil(this.preguntas.length / this.preguntasPorPaso);
        this.totalPreguntas = this.preguntas.length;
        this.inicializarFormulario();
        this.formValueChangesSubscription.add(
            this.diagnosticoForm.valueChanges.subscribe(() => {
                this.actualizarContador(); // 👈 Llama al contador con cada cambio
            })
        );
      },
      (error) => {
        console.error('Error al obtener las preguntas del diagnóstico:', error);
        // Manejo de errores: por ejemplo, mostrar un mensaje al usuario
        alert('Hubo un error al cargar las preguntas. Por favor, inténtelo de nuevo más tarde.');
      }
    );

    this.idSubscription.add(
      this.dataSharingService.idRespuesta$.subscribe(id => {
        this.idRespuestaActual = id;
        if (id && this.preguntas.length > 0) {
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
      this.diagnosticoForm.valueChanges.subscribe(() => this.actualizarContador())
    );

  }

  ngOnDestroy(): void {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }

  private inicializarFormulario(): void {
    this.preguntas.forEach(pregunta => {
      const controlName = `pregunta_${pregunta.id_campo}`;
      this.diagnosticoForm.addControl(
        controlName,
        this.fb.control(null, Validators.required)
      );
    });
  }

  get preguntasPasoActual(): DiagnosticoPregunta[] {
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    return this.preguntas.slice(inicio, fin);
  }

  actualizarContador(): void {
    let count = 0;
    // Recorre todos los controles del formulario
    for (const controlName in this.diagnosticoForm.controls) {
      if (this.diagnosticoForm.controls.hasOwnProperty(controlName)) {
        const control = this.diagnosticoForm.controls[controlName];
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
    }
  }

  siguiente(): void {
    // Validar las preguntas del paso actual antes de avanzar
    const inicio = (this.pasoActual - 1) * this.preguntasPorPaso;
    const fin = inicio + this.preguntasPorPaso;
    const preguntasPaso = this.preguntas.slice(inicio, fin);

    let pasoValido = true;
    preguntasPaso.forEach(pregunta => {
        const control = this.diagnosticoForm.get(`pregunta_${pregunta.id_campo}`);
        if (control && control.invalid) {
            control.markAsTouched(); // Para que se muestren los errores
            pasoValido = false;
        }
    });

    if (pasoValido && this.pasoActual < this.totalPasos) {
      this.pasoActual++;
    } else if (pasoValido && this.pasoActual === this.totalPasos) {
      this.guardarDiagnostico();
    } else {
        alert('Por favor, responde todas las preguntas antes de avanzar.');
    }
  }

  cargarDatosSeccion(id: number | string): void {
     const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const timestamp = new Date().getTime();
    const url = `http://20.81.172.55:3900/api/participantes/formulario-completo?id_respuesta=${id}&_t=${timestamp}`;

    this.http.get<any>(url, { headers }).subscribe({
      next: (res) => {
        const datosBD = res?.data?.detalles || [];
        const payloadParaFormulario: any = {};

        if (datosBD.length === 0) return;

        // 🟢 LÓGICA DE MAPEO:
        // Como los controles se llaman 'pregunta_ID', buscamos directamente por ID
        datosBD.forEach((item: any) => {
          const controlName = `pregunta_${item.id_campo}`;
          // Solo si el control existe en este formulario de diagnóstico
          if (this.diagnosticoForm.contains(controlName)) {
            payloadParaFormulario[controlName] = item.valor;
          }
        });

        this.diagnosticoForm.patchValue(payloadParaFormulario, { emitEvent: false });
        this.actualizarContador();
        console.log('✨ Diagnóstico autocompletado con éxito.');
      },
      error: (err) => console.error('❌ Error al cargar datos de diagnóstico:', err)
    });
  }

 guardarDiagnostico(): void {
    if (this.diagnosticoForm.valid) {
      // Obtenemos el ID guardado previamente en BasicaComponent
      const idRespuesta = this.dataSharingService.getIdRespuesta();

      if (!idRespuesta) {
        alert('Error: No se ha encontrado el ID de respuesta. Registre los datos básicos primero.');
        return;
      }

      // Mapeamos los valores del formulario al formato id_campo / valor
      const formulario_data = Object.keys(this.diagnosticoForm.value).map(key => {
        return {
          id_campo: Number(key.replace('pregunta_', '')),
          valor: this.diagnosticoForm.value[key]
        };
      });

      const payload = {
        id_respuesta: idRespuesta,
        formulario_data: formulario_data
      };

      console.log('Enviando diagnóstico:', payload);

      this.http.post(this.apiUrlAddData, payload).subscribe({
        next: (response) => {
          console.log('Datos adicionales guardados:', response);
          alert('Diagnóstico guardado con éxito en el servidor.');
        },
        error: (error) => {
          console.error('Error al guardar datos adicionales:', error);
          alert('Hubo un error al guardar el diagnóstico en el servidor.');
        }
      });
    } else {
      this.diagnosticoForm.markAllAsTouched();
      alert('Completa todas las preguntas.');
    }
  }
}
