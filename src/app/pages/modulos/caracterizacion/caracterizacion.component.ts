import { Component, OnInit,  inject, signal, OnDestroy, computed } from '@angular/core';
import { DataSharingService } from '../../../services/data-sharing.service'; // Asegúrate que la ruta sea correcta
import { Subscription } from 'rxjs';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';



@Component({
  selector: 'app-caracterizacion',
  imports: [RouterLink, RouterOutlet, CommonModule, RouterLinkActive, FormsModule, MatIconModule],
  templateUrl: './caracterizacion.component.html',
  styleUrls: ['./caracterizacion.component.css']
})
export class CaracterizacionComponent implements OnInit{
private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private dataSharingService = inject(DataSharingService);

  // CONFIGURACIÓN
  private readonly URL_FORM_BASICA = "https://ee.kobotoolbox.org/single/::U9Uu0dGw";
  private readonly URL_FORM_AMPLIADA = "https://ee.kobotoolbox.org/single/::NpfbIg4q";
  private readonly URL_FORM_DIAGNOSTICO = "https://ee.kobotoolbox.org/single/::hlzgkosF";
  private readonly URL_FORM_PLANFORMACION = "https://ee.kobotoolbox.org/single/::l7cBNGXB";
  // private readonly searchUrl = "http://20.81.172.55:3900/api/participantes/search";

  private readonly FORMULARIOS_SECUENCIA = [
    { identificador: 'BASICA', dbPattern: 'BASICA', url: this.URL_FORM_BASICA },
    { identificador: 'AMPLIADA', dbPattern: 'AMPLIADA', url: this.URL_FORM_AMPLIADA },
    { identificador: 'DIAGNOSTICO', dbPattern: 'DIAGNOSTICO', url: this.URL_FORM_DIAGNOSTICO },
    { identificador: 'FORMACION', dbPattern: 'FORMACION', url: this.URL_FORM_PLANFORMACION }
  ];

 //Endpoint para consultar el estado del participante
  private readonly searchUrl = "http://20.81.172.55:3900/api/formularios/obtener-participantes";

  // ESTADO REACTIVO
  searchQuery: string = "";
  isSearching = signal<boolean>(false);
  mostrarFormulario = signal<boolean>(false);
  participanteSeleccionado = signal<any | null>(null);
  koboSafeUrl = signal<SafeResourceUrl | null>(null);
  errorBusqueda: string | null = null;

  // Información del Participante procesada
  participanteData = signal<any | null>(null);

  // Lista de nombres de formularios encontrados en la BD
  formulariosEncontrados = signal<string[]>([]);

  // 🟢 DATOS DEL TÉCNICO (LOGIN)
  idTecnico = signal<string | number>('');
  nombreTecnico = signal<string>('Invitado');

  siguienteFormulario = computed(() => {
    const encontrados = this.formulariosEncontrados().map(f => f.toUpperCase());

    // Busca el primer formulario en la secuencia que NO haya sido completado en la BD
    const proximo = this.FORMULARIOS_SECUENCIA.find(form =>
      !encontrados.some(f => f.includes(form.dbPattern))
    );

    // Retorna el siguiente o el último por defecto si ya completó todos
    return proximo ? proximo.identificador : 'FORMACION';
  });

  // 🟢 Texto del botón de acción principal de forma dinámica
  textoBotonAccion = computed(() => {
    const proximo = this.siguienteFormulario();
    if (proximo === 'BASICA') return 'Iniciar Caracterización Ampliada';
    if (proximo === 'AMPLIADA') return 'Continuar con diagnostico';
    if (proximo === 'DIAGNOSTICO') return 'Continuar con plan de formación';
    return 'Iniciar plan de formación';
  });

  ngOnInit(): void {
    this.cargarDatosUsuarioLogueado();
  }

  /**
   * 🟢 Recupera el ID y Nombre del usuario que hizo login desde localStorage
   */
  cargarDatosUsuarioLogueado(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.idTecnico.set(user.id || '');
        this.nombreTecnico.set(user.nombre || 'Usuario SEApp');
      } catch (e) {
        console.error('Error al parsear datos de usuario:', e);
      }
    }
  }

  consultarParticipante(): void {
    const doc = this.searchQuery.trim();
    if (!doc) return;

    this.isSearching.set(true);
    this.errorBusqueda = null;
    this.participanteSeleccionado.set(null);
    this.formulariosEncontrados.set([]);


    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`${this.searchUrl}?documento=${doc}`, { headers }).subscribe({
      next: (res) => {
        this.isSearching.set(false);
          if (res.status === 'success' && res.data && res.data.length > 0) {

          // Tomamos los datos del primer objeto para la identidad
          const primerRegistro = res.data[0];

          // Extraemos todos los nombres de campos (formularios) únicos
          const nombresForms = res.data.map((item: any) => item.nombre_campo);
          const formsUnicos = [...new Set(nombresForms)] as string[];

          this.participanteSeleccionado.set({
            nombre: primerRegistro.nombre_participante,
            apellido: primerRegistro.apellido_participante,
            documento: primerRegistro.documento,
            email: primerRegistro.email,
            id_participante: primerRegistro.id_participante // Asumiendo que viene o se puede inferir
          });

          this.formulariosEncontrados.set(formsUnicos);
          console.log('✅ Formularios detectados:', formsUnicos);
        } else {
          this.errorBusqueda = "NOT_FOUND";
        }
      },
      error: (err) => {
        this.isSearching.set(false);
        this.errorBusqueda = err.status === 404 ? "NOT_FOUND" : "SERVER_ERROR";
      }
    });
  }

  /**
   * 🟢 Inyecta id_usuario (técnico) en ambos casos
   */
  abrirFormularioKobo(tipo?: 'BASICA' | 'AMPLIADA' | 'DIAGNOSTICO' | 'FORMACION') : void {

    const formularioSeleccionado = tipo || this.siguienteFormulario();

    let rawUrl = "";
    const p = this.participanteSeleccionado();
    const idLogueado = this.idTecnico();
    const nombreODP = this.nombreTecnico();

    const documento = p ? p.documento : this.searchQuery.trim();

    if (formularioSeleccionado === 'BASICA') {
      // Form 1: Inyectamos el documento buscado y el ID del técnico
      rawUrl = `${this.URL_FORM_BASICA}?d[nombre_usuario]=${nombreODP}&d[Id_usuario]=${idLogueado}`;
    } else if (formularioSeleccionado === 'AMPLIADA') {
      // Form 2: Inyectamos ID Participante, Nombre Participante e ID del técnico

      rawUrl = `${this.URL_FORM_AMPLIADA}?&d[nombre_usuario]=${nombreODP}&d[Id_usuario]=${idLogueado}&d[group_hu8kh88/N_mero_de_identificaci_n]=${documento}`;
    } else if (formularioSeleccionado === 'DIAGNOSTICO'){
      rawUrl = `${this.URL_FORM_DIAGNOSTICO}?&d[nombre_usuario]=${nombreODP}&d[Id_usuario]=${idLogueado}&d[N_mero_de_identificaci_n]=${documento}`;
    } else {
      rawUrl = `${this.URL_FORM_PLANFORMACION}?&d[nombre_usuario]=${nombreODP}&d[Id_usuario]=${idLogueado}&d[N_mero_de_identificaci_n]=${documento}`;
    }

    console.log('🚀 Abriendo Kobo con parámetros:', rawUrl);
    this.koboSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
    this.mostrarFormulario.set(true);
  }

    estaCompletado(termino: string): boolean {
    return this.formulariosEncontrados().some(f => f.toUpperCase().includes(termino.toUpperCase()));
  }

  resetear(): void {
    this.mostrarFormulario.set(false);
    this.participanteSeleccionado.set(null);
    this.searchQuery = "";
    this.koboSafeUrl.set(null);
    this.errorBusqueda = null;
  }
}
