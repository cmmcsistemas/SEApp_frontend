import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


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

  private formSubscription: Subscription = new Subscription();
  private preguntas: any[] = [];


constructor(private fb: FormBuilder, private http: HttpClient) {}

ngOnInit(): void {
    this.ideaDeNegocioForm = this.fb.group({
      nombreEmprendimiento: ['', Validators.required],
      dptoUbicacion: ['', Validators.required],
      ciudadUbicacion: ['', [Validators.required, Validators.email]],
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
      siOtros: [''],
      // ✅ Segundo bloque de preguntas (Paso 3)
      listadoProductos: [''],
      dineroInversion: [''],
      listadoProducto: [''],
      cuantoNecesitaInversion: [''],
      cuantoNecesitaCapital: [''],
      totalInversion: [''],
      porcentajeInversionActual: [''],
      ventasPrimerMes: [''],
      ventasPrimerAno: [''],
      perteneceA: [''],
      perteneceACual: ['']
    });

    this.preguntas = Object.keys(this.ideaDeNegocioForm.controls);
    this.paginas = Math.ceil(this.preguntas.length / this.preguntasPorPaso); ;
    this.totalPasos = this.preguntas.length ;


    // ✅ Nueva suscripción al valor del formulario completo
    this.formSubscription.add(this.ideaDeNegocioForm.valueChanges.subscribe(value => {
      this.actualizarContador();
      console.log('Cambios en el formulario detectados:', value);
    }));

    this.actualizarContador();

    this.obtenerDepartamentos();
    this.obtenerMunicipios();

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
          const listadoDepartamentos = data.map(departamento => departamento.nombre_departamento);
          this.departamentos = listadoDepartamentos.sort((a,b) => a.localeCompare(b));

          console.log('Municipios obtenidos de la API:', this.departamentos);
        },
        error: (error) => {
          console.error('Error al obtener los proyectos:', error);
        }
      });
  };

    obtenerMunicipios(): void {
    // Realiza la petición GET a la API y almacena la respuesta en la variable 'municipios'
    this.http.get<any[]>('http://20.81.172.55:3900/api/basica/municipios')
      .subscribe({
        next: (data) => {
          const listadoMunicipios = data.map(municipio => municipio.nombre_municipio);
          this.ciudades = listadoMunicipios.sort((a,b) => a.localeCompare(b));

          console.log('Municipios obtenidos de la API:', this.ciudades);
        },
        error: (error) => {
          console.error('Error al obtener los proyectos:', error);
        }
      });
  };

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
