import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PlanFormacionService, Programa } from '../../../services/plan-formacion.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faTrashAlt, faCheck } from '@fortawesome/free-solid-svg-icons'; // Iconos de FontAwesome


interface ProgramaConSeleccion { // Ya no extiende directamente, se compone
  id_detalle: number;
  nombre_programa: string;
  nombre_linea: string;
  nombre_nivel: string;
  nombre_titulo_programa: string;
  seleccionado: boolean; // Propiedad extra del componente
}

// Interfaz para los datos del formulario de fechas
interface CartillaConFechas {
  id_detalle: number;
  nombre_titulo_programa: string;
  fecha_propuesta: string;
  fecha_final: string;
}

@Component({
  selector: 'app-plan-formacion',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, FormsModule, DatePipe, FontAwesomeModule],
  templateUrl: './plan-formacion.component.html',
  styleUrl: './plan-formacion.component.css'
})
export class PlanFormacionComponent implements OnInit{
  // Variables de estado
  paso: number = 1; // 1: Selección de programas, 2: Asignación de fechas
  programasOriginales: ProgramaConSeleccion[] = [];
  programasFiltrados: ProgramaConSeleccion[] = [];
  cartillasSeleccionadas: CartillaConFechas[] = [];

  // Búsqueda
  busquedaControl = new FormControl('');

  // Formulario para asignar fechas
  fechasForm!: FormGroup;

  // Iconos
  faSearch = faSearch;
  faTrashAlt = faTrashAlt;
  faCheck = faCheck;

  constructor(
    private apiService: PlanFormacionService,
    private fb: FormBuilder
  ) {
    this.fechasForm = this.fb.group({
      cartillas: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarProgramas();
    this.setupBusquedaListener();
  }

  getCartillaFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  /**
   * Carga los programas de formación desde el backend
   */
cargarProgramas(): void {
    // La API devuelve Programa[], que es compatible con la estructura de ProgramaConSeleccion
    this.apiService.vistaProgramaParticipante().subscribe({
      next: (data: Programa[]) => {
        // 🟢 CORRECCIÓN: Tipado riguroso en el map para asegurar que 'p' es de tipo 'Programa'
        this.programasOriginales = data.map((p: Programa) => ({
          id_detalle: p.id_detalle, // 🟢 Propiedad tipada
          nombre_programa: p.nombre_programa, // 🟢 Propiedad tipada
          nombre_linea: p.nombre_linea, // 🟢 Propiedad tipada
          nombre_nivel: p.nombre_nivel, // 🟢 Propiedad tipada
          nombre_titulo_programa: p.nombre_titulo_programa, // 🟢 Propiedad tipada
          seleccionado: false
        } as ProgramaConSeleccion)); // Cast final para asegurar el tipo de la lista

        this.programasFiltrados = [...this.programasOriginales];
      },
      error: (err: any) => {
        console.error('Error al cargar programas de formación:', err);
      }
    });
  }

  /**
   * Configura el listener de búsqueda
   */
  setupBusquedaListener(): void {
    this.busquedaControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.aplicarFiltro(query || '');
      });
  }

  /**
   * Filtra los programas por el nombre del título (Cartilla)
   */
 aplicarFiltro(query: string): void {
    const lowerCaseQuery = query.toLowerCase();
    // 🟢 CORRECCIÓN: El compilador ya no debería fallar aquí porque ProgramaConSeleccion tiene todas las propiedades
    this.programasFiltrados = this.programasOriginales.filter((p: ProgramaConSeleccion) =>
      p.nombre_titulo_programa.toLowerCase().includes(lowerCaseQuery)
    );
  }

  /**
   * Alterna el estado de selección de un programa
   */
  toggleSeleccion(programa: ProgramaConSeleccion): void {
    programa.seleccionado = !programa.seleccionado;
  }

  /**
   * Transiciona al Paso 2 (Asignar Fechas)
   */
  asignarFechas(): void {
    const seleccionados = this.programasOriginales.filter(p => p.seleccionado);

    if (seleccionados.length === 0) {
      alert('Por favor, selecciona al menos una cartilla para asignar fechas.');
      return;
    }

    // Mapear la selección a la estructura de fechas (sin fechas iniciales)
    this.cartillasSeleccionadas = seleccionados.map((p: ProgramaConSeleccion) => ({ // 🟢 Tipado en map
      id_detalle: p.id_detalle, // 🟢 Propiedad tipada
      nombre_titulo_programa: p.nombre_titulo_programa, // 🟢 Propiedad tipada
      fecha_propuesta: '',
      fecha_final: '',
    }));

    // Reconstruir el FormArray para el Paso 2
    this.fechasForm.setControl('cartillas', this.fb.array(
      this.cartillasSeleccionadas.map(cartilla => this.crearGrupoFechas(cartilla))
    ));

    this.paso = 2;
  }

  /**
   * Crea un FormGroup para una cartilla con validadores de fecha
   */
  crearGrupoFechas(cartilla: CartillaConFechas): FormGroup {
    return this.fb.group({
      id_detalle: [cartilla.id_detalle],
      nombre_titulo_programa: [cartilla.nombre_titulo_programa],
      fecha_propuesta: [cartilla.fecha_propuesta, Validators.required],
      fecha_final: [cartilla.fecha_final, Validators.required]
      // Nota: Aquí se pueden añadir validadores de fecha (ej: fecha_final > fecha_propuesta)
    });
  }

  /**
   * Elimina una cartilla del formulario de asignación de fechas
   */
eliminarCartilla(index: number): void {
    const cartillaEliminada = this.cartillasArray.at(index).value as CartillaConFechas;

    // 1. Eliminar del FormArray
    this.cartillasArray.removeAt(index);

    // 2. Desmarcar en la lista original para la vista del Paso 1
    // 🟢 CORRECCIÓN: Aseguramos que 'p' es de tipo ProgramaConSeleccion
    const programaOriginal = this.programasOriginales.find((p: ProgramaConSeleccion) => p.id_detalle === cartillaEliminada.id_detalle);
    if (programaOriginal) {
      programaOriginal.seleccionado = false;
    }
  }

  /**
   * Vuelve al Paso 1 (Limpia las selecciones)
   */
  atras(): void {
    // 1. Resetear el estado de selección
    this.programasOriginales.forEach(p => p.seleccionado = false);
    // 2. Volver a filtrar por si había una búsqueda activa
    this.aplicarFiltro(this.busquedaControl.value || '');
    // 3. Volver al Paso 1
    this.paso = 1;
  }

  /**
   * Envía las fechas confirmadas
   */
  confirmarFechas(): void {
    if (this.fechasForm.valid) {
      const datosAEnviar = this.fechasForm.value.cartillas;
      console.log('Fechas Confirmadas para el Plan de Formación:', datosAEnviar);
      alert('Fechas confirmadas y enviadas con éxito. Revisa la consola.');
      // 💡 Aquí iría la llamada final a tu API para guardar
      // this.apiService.guardarFechas(datosAEnviar).subscribe(...)

      // Opcional: Volver al paso 1 después de guardar
      this.atras();
    } else {
      // Marcar todos los controles como tocados para mostrar errores
      this.fechasForm.markAllAsTouched();
      alert('Por favor, completa todas las fechas propuestas y finales.');
    }
  }

  get cartillasArray(): FormArray {
    return this.fechasForm.get('cartillas') as FormArray;
  }
}
