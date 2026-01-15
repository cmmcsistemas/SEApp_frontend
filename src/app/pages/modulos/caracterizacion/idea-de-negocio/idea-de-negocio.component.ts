import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, Observable, merge } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { debounceTime, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-idea-de-negocio',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './idea-de-negocio.component.html',
  styleUrl: './idea-de-negocio.component.css'
})
export class IdeaDeNegocioComponent implements OnInit, OnDestroy {
  ideaDeNegocioForm! : FormGroup;
  pasoActual: number =  1;
  totalPasos: number =  0;
  preguntasPorPaso = 11;
  paginas = 0;
  contador = 0;

  opciones: string[] = ['Sí', 'No'];

  departamentos: any[] = [];
  ciudades: any[] = [];
  localidades: any[] = [];
  sectorEmpresarial = [
    'Sector Industrial',
    'Sector de Servicios',
    'Sector de Comercio',
    'Sector Agropecuario',
    'Sector de Transporte',
    'Sector Financiero',
    'Sector de la Construcción',
    'Sector Minero y Energético',
    'Sector Solidario',
    'Sector de Comunicaciones'
  ];

  tiempoDedicaEmprendimiento = [
    'Tiempo completo',
    'Medio tiempo',
    'Tiempo libre'
  ];

  tiempoFormacionEmprendimiento = [
    'De 1 a 4 Horas',
    'De 5 a 8 Horas',
    'Más de 8 horas'
  ]

  private formSubscription: Subscription = new Subscription();
  private preguntas: any[] = [];
  private totalInversionSubscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private http: HttpClient) {}

ngOnInit(): void {
    this.ideaDeNegocioForm = this.fb.group({
      nombreEmprendimiento: ['', Validators.required],
      dptoUbicacion: ['', Validators.required],
      ciudadUbicacion: ['', [Validators.required]],
      localidadUbicacion: [''],
      ubicacionNegocio: ['', Validators.required],
      sectorEmpresarial: [''],
      infoEmprendimiento: [''],
      ideaNegocio: [''],
      cualesClientes: [''],
      necesidad: [''],
            // ✅ Segundo bloque de preguntas (Paso 2)
      listadoProductoServicio: ['', Validators.required],
      productoAgropecuario: [''],
      colaboradores: [''],
      quienes: ['', Validators.required],
      tiempoMarchaEmprendimiento: [''],
      tiempoDedicaEmprendimiento: [''],
      tiempoFormacionEmprendimiento: [''],
      conocimientoEmprendimiento: [''],
      experienciaEmprendimiento: [''],
      razonEmprendimiento: [''],
      // ✅ Segundo bloque de preguntas (Paso 3)
      listadoProductos: [''],
      cuantoNecesitaInversion: [0, Validators.required],
      cuantoNecesitaCapital: [0, Validators.required],
      totalInversion: [{ value: 0, disabled: true }],
      porcentajeInversionActual: [''],
      ventasPrimerMes: [''],
      ventasPrimerAno: [''],
      perteneceA: [''],
      perteneceACual: ['']
    });

    this.preguntas = Object.keys(this.ideaDeNegocioForm.controls);
    this.paginas = Math.ceil(this.preguntas.length / this.preguntasPorPaso); ;
    this.totalPasos = this.preguntas.length ;

    this.ideaDeNegocioForm.get('ciudadUbicacion')?.valueChanges.subscribe(municipio => {
      const esBogota = municipio && municipio.nombre_municipio === 'BOGOTA';
      if (esBogota) {
        this.ideaDeNegocioForm.get('localidadUbicacion')?.setValidators(Validators.required);
        this.ideaDeNegocioForm.get('localidadUbicacion')?.reset();
        this.obtenerLocalidades();
      } else {
        this.ideaDeNegocioForm.get('localidadUbicacion')?.clearValidators();
        this.ideaDeNegocioForm.get('localidadUbicacion')?.reset();
        this.ideaDeNegocioForm.get('localidadUbicacion')?.setValue('N/A', {emitEvent: false});
      }
      this.ideaDeNegocioForm.get('localidadUbicacion')?.updateValueAndValidity();
    });

    // ✅ Nueva suscripción al valor del formulario completo
    this.formSubscription.add(this.ideaDeNegocioForm.valueChanges.subscribe(value => {
      this.actualizarContador();
      console.log('Cambios en el formulario detectados:', value);
    }));

    this.ideaDeNegocioForm.get('dptoUbicacion')?.valueChanges.subscribe(departamentoSeleccionado => {
    if (departamentoSeleccionado){
      this.obtenerMunicipios(departamentoSeleccionado.id_departamento);
      this.ideaDeNegocioForm.get('ciudadUbicacion')?.enable();
    }
    else {
        this.ideaDeNegocioForm.get('ciudadUbicacion')?.reset('');
        this.ciudades = [];
    }

    });

    this.actualizarContador();
    this.obtenerDepartamentos();
    this.setupTotalInversionCalculation();
  }

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria
    this.formSubscription.unsubscribe();
  }


  actualizarContador(): void {
    let count = 0;
    // Recorre todos los controles del formulario
    for (const controlName in this.ideaDeNegocioForm.controls) {
      if (this.ideaDeNegocioForm.controls.hasOwnProperty(controlName)) {
        const control = this.ideaDeNegocioForm.controls[controlName];
        // Comprueba si el control tiene un valor que no sea nulo o un string vacío
        if (control.value !== null && control.value !== '' && (typeof control.value !== 'string' || control.value.trim() !== '')) {
          count++;
        }
      }
    }
    this.contador = count;
    console.log(`Preguntas completadas: ${this.contador} de ${this.preguntas.length}`);
  }

  obtenerDepartamentos(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'municipios'
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/departamentos')
      .subscribe({
        next: (data) => {
          this.departamentos = data.sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento));
          console.log('Departamentos obtenidos de la API:', this.departamentos);
        },
        error: (error) => {
          console.error('Error al obtener los proyectos:', error);
        }
      });
  };

  obtenerMunicipios(idDepartamento: number): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'municipios'
    this.http.get<any[]>(`http://20.81.172.55:3900/api/basica/municipios/${idDepartamento}`)
      .subscribe({
        next: (data) => {
          this.ciudades = data.sort((a, b) => a.nombre_municipio.localeCompare(b.nombre_municipio));
          console.log(`Municipios para el departamento con ID ${idDepartamento} obtenidos:`, this.ciudades);
        },
        error: (error) => {
          console.error(`Error al obtener los municipios para el ID ${idDepartamento}:`, error);
          this.ciudades = [];
        }
      });
  };

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

  setupTotalInversionCalculation(): void {
    const inversionControl = this.ideaDeNegocioForm.get('cuantoNecesitaInversion');
    const capitalControl = this.ideaDeNegocioForm.get('cuantoNecesitaCapital');
    const totalControl = this.ideaDeNegocioForm.get('totalInversion');

    if (!inversionControl || !capitalControl || !totalControl) {
      console.error('Error: No se pudieron encontrar los controles del formulario para calcular la inversión total.');
      return
  }

    const inversion$ = inversionControl.valueChanges.pipe(
      startWith(inversionControl.value), // Emite el valor inicial
      debounceTime(100),
      map(value => Number(value) || 0) // Mapea el valor a número, usando 0 si es null/''/NaN
    );

    const capital$ = capitalControl.valueChanges.pipe(
      startWith(capitalControl.value), // Emite el valor inicial
      debounceTime(100),
      map(value => Number(value) || 0) // Mapea el valor a número, usando 0 si es null/''/NaN
    );

    this.totalInversionSubscription = merge(inversion$, capital$).pipe(
        debounceTime(100)
      ).subscribe(() => {
        // Obtener valores (usar getRawValue() si el control estuviera deshabilitado)
        const inversion = Number(inversionControl.value) || 0;
        const capital = Number(capitalControl.value) || 0;
        const total = inversion + capital;
        // Actualizar el control totalInversion
        // Usamos setValue en el control deshabilitado; es seguro y muestra el valor
        totalControl.setValue(total, { emitEvent: false });
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
   if (this.pasoActual === this.paginas) {
      this.guardarProgreso();
    } else {
      this.pasoActual++;
      console.log('Avanzando al paso:', this.pasoActual);
    }
  }

  guardarProgreso(): void{
    if (this.ideaDeNegocioForm.valid) {
      const data = this.ideaDeNegocioForm.value;
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Datos del formulario:', jsonString);
      alert('Progreso guardado correctamente.');
    } else {
      // ✅ Líneas añadidas para depuración
      this.ideaDeNegocioForm.markAllAsTouched();
      console.error('El formulario no es válido. Los siguientes campos tienen errores:');
      Object.keys(this.ideaDeNegocioForm.controls).forEach(controlName => {
        const control = this.ideaDeNegocioForm.get(controlName);
        if (control?.invalid) {
          console.error(`Campo: ${controlName}, Errores: `, control.errors);
        }
      });
      alert('Por favor, complete todos los campos requeridos.');
    }

  }
}
