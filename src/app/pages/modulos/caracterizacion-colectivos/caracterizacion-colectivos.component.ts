import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DataSharingService } from '../../../services/data-sharing.service';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-caracterizacion-colectivos',
  imports: [RouterLink, RouterOutlet, CommonModule, RouterLinkActive, FormsModule, MatIconModule],
  templateUrl: './caracterizacion-colectivos.component.html',
  styleUrl: './caracterizacion-colectivos.component.css'
})
export class CaracterizacionColectivosComponent implements OnInit {

  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private dataSharingService = inject(DataSharingService);

  // CONFIGURACIÓN
  private readonly URL_FORM_BASICA = "https://ee.kobotoolbox.org/single/::BLJDDSxJ";
  private readonly URL_FORM_AMPLIADA = "https://ee.kobotoolbox.org/single/::b18d2il0";
  private readonly searchUrl = "http://20.81.172.55:3900/api/colectivo/searchColectivo";

  // 🟢 Secuencia de formularios para colectivos (solo BASICA y AMPLIADA)
  private readonly FORMULARIOS_SECUENCIA = [
    { identificador: 'BASICA', dbPattern: 'BASICA', url: this.URL_FORM_BASICA },
    { identificador: 'AMPLIADA', dbPattern: 'AMPLIADA', url: this.URL_FORM_AMPLIADA },
  ];

  // ESTADO REACTIVO
  searchQuery: string = "";
  isSearching = signal<boolean>(false);
  mostrarFormulario = signal<boolean>(false);
  colectivoSeleccionado = signal<any | null>(null);
  koboSafeUrl = signal<SafeResourceUrl | null>(null);
  errorBusqueda: string | null = null;

  listaColectivos = signal<any[]>([]);

  // 🟢 Lista de módulos encontrados del colectivo seleccionado
  formulariosEncontrados = signal<string[]>([]);

  // 🟢 DATOS DEL TÉCNICO (LOGIN)
  idTecnico = signal<string | number>('');
  nombreTecnico = signal<string>('Invitado');

  // 🟢 Computed: siguiente formulario a diligenciar
  siguienteFormulario = computed(() => {
    const encontrados = this.formulariosEncontrados().map(f => f.toUpperCase());

    const proximo = this.FORMULARIOS_SECUENCIA.find(form =>
      !encontrados.some(f => f.includes(form.dbPattern))
    );

    return proximo ? proximo.identificador : 'AMPLIADA';
  });

  // 🟢 Texto dinámico del botón
  textoBotonAccion = computed(() => {
    const proximo = this.siguienteFormulario();
    if (proximo === 'BASICA') return 'Iniciar Caracterización Básica';
    return 'Continuar Caracterización Ampliada';
  });

  ngOnInit(): void {
    this.cargarDatosUsuarioLogueado();
  }

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

  consultarColectivo(): void {
    const query = this.searchQuery.trim();
    if (!query) return;

    this.isSearching.set(true);
    this.errorBusqueda = null;
    this.listaColectivos.set([]);
    this.colectivoSeleccionado.set(null);
    this.formulariosEncontrados.set([]);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`${this.searchUrl}?query=${query}`, { headers }).subscribe({
      next: (res) => {
        this.isSearching.set(false);
        const respuesta = res.colectivos || [];
        if (respuesta.length > 0) {
          this.listaColectivos.set(respuesta);
          console.log('✅ Colectivos encontrados:', respuesta.length);
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
   * 🟢 Al seleccionar un colectivo, cargamos sus módulos completados
   */
  seleccionarColectivo(colectivo: any): void {
    this.colectivoSeleccionado.set(colectivo);
    // Cargamos los módulos del colectivo seleccionado
    const modulos = colectivo.modulos || [];
    this.formulariosEncontrados.set(modulos);
    console.log('✅ Módulos detectados para el colectivo:', modulos);
  }

  /**
   * 🟢 Verifica si un módulo específico está diligenciado
   */
  estaCompletado(termino: string): boolean {
    return this.formulariosEncontrados().some(f => f.toUpperCase().includes(termino.toUpperCase()));
  }

  /**
   * 🟢 Inyecta id_usuario (técnico) y datos del colectivo en la URL Kobo
   */
  abrirFormularioKobo(tipo?: 'BASICA' | 'AMPLIADA' | 'NUEVO'): void {

    // Si es NUEVO lo tratamos como BASICA (registro inicial)
    const formularioSeleccionado = (tipo === 'NUEVO') ? 'BASICA' : (tipo || this.siguienteFormulario());

    let rawUrl = "";
    const c = this.colectivoSeleccionado();
    const idLogueado = this.idTecnico();
    const nombreODP = this.nombreTecnico();

    if (formularioSeleccionado === 'BASICA') {
      // Form 1: Registro nuevo. Solo inyectamos el técnico
      rawUrl = `${this.URL_FORM_BASICA}?d[nombre_usuario]=${nombreODP}&d[Id_usuario]=${idLogueado}`;
    } else {
      // Form 2 (AMPLIADA): Inyectamos los datos del colectivo seleccionado
      if (!c) {
        console.error('❌ No hay colectivo seleccionado para AMPLIADA');
        return;
      }
      const nombreCol = encodeURIComponent(c.nombre_colectivo || c.colectivo || '');
      const nitCol = c.nit || '';

      rawUrl = `${this.URL_FORM_AMPLIADA}?d[Id_usuario]=${idLogueado}&d[nombre_usuario]=${nombreODP}&d[nit_colectivo]=${nitCol}&d[group_nb18u42/_Nombre_del_colectivo]=${nombreCol}`;
    }

    console.log('🚀 Abriendo Kobo con parámetros:', rawUrl);
    this.koboSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
    this.mostrarFormulario.set(true);
  }

  resetear(): void {
    this.mostrarFormulario.set(false);
    this.colectivoSeleccionado.set(null);
    this.listaColectivos.set([]);
    this.formulariosEncontrados.set([]);
    this.searchQuery = "";
    this.koboSafeUrl.set(null);
    this.errorBusqueda = null;
  }
}
