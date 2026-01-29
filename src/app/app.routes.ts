import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ModulosComponent } from './pages/modulos/modulos.component';
import { LoginComponent } from './pages/login/login.component';
import { CaracterizacionComponent } from './pages/modulos/caracterizacion/caracterizacion.component';
import { MisionesComponent } from './pages/modulos/misiones/misiones.component';
import { MonitoreosComponent } from './pages/modulos/monitoreos/monitoreos.component';
import { PlanFormacionComponent } from './pages/modulos/plan-formacion/plan-formacion.component';
import { VisitasImplementacionComponent } from './pages/modulos/visitas-implementacion/visitas-implementacion.component';
import { VisitasSeguimientoComponent } from './pages/modulos/visitas-seguimiento/visitas-seguimiento.component';
import { DashboardListadoParticipantesComponent } from './pages/dashboard/dashboard-listado-participantes/dashboard-listado-participantes.component';

export const routes: Routes = [
 {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)},
  {path: 'account', loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent)},



  {
      path: 'dashboard',
      component: DashboardComponent, // Contenedor padre
      children: [
        {path: '', redirectTo: 'odp', pathMatch: 'full'},
        {
          path: 'participante',
          loadComponent: () => import('./pages/dashboard/dashboard-participante/dashboard-participante.component')
            .then(m => m.DashboardParticipanteComponent)
        },
        {
          path: 'odp',
          loadComponent: () => import('./pages/dashboard/dashboard-odp/dashboard-odp.component')
            .then(m => m.DashboardOdpComponent)
        },
        {path: 'participantes', loadComponent: () => import('./pages/dashboard/dashboard-listado-participantes/dashboard-listado-participantes.component').then(m => m.DashboardListadoParticipantesComponent)},
      ]
    },
  {path: 'modulos', loadComponent: () => import('./pages/modulos/modulos.component').then(m => m.ModulosComponent),
    children: [

        { path: 'monitoreos', loadComponent: () => import('./pages/modulos/monitoreos/monitoreos.component').then(m => m.MonitoreosComponent) },
        { path: 'plan-formacion', loadComponent: () => import('./pages/modulos/plan-formacion/plan-formacion.component').then(m => m.PlanFormacionComponent) },
        { path: 'visitas-implementacion', loadComponent: () => import('./pages/modulos/visitas-implementacion/visitas-implementacion.component').then(m => m.VisitasImplementacionComponent) },
        { path: 'visitas-seguimiento', loadComponent: () => import('./pages/modulos/visitas-seguimiento/visitas-seguimiento.component').then(m => m.VisitasSeguimientoComponent) },
        { path: 'misiones', loadComponent: () => import('./pages/modulos/misiones/misiones.component').then(m => m.MisionesComponent) },

        { path: 'caracterizacion',
          component: CaracterizacionComponent,
          children: [
        {path: '', redirectTo: 'caracterizacion-basica', pathMatch: 'full'},
        { path: 'diagnostico',
              loadComponent: () => import('./pages/modulos/caracterizacion/diagnostico/diagnostico.component').then(m => m.DiagnosticoComponent) },
        { path: 'unidad-de-negocio',
              loadComponent: () => import('./pages/modulos/caracterizacion/unidad-de-negocio/unidad-de-negocio.component').then(m => m.UnidadDeNegocioComponent)
        },
        { path: 'idea-de-negocio',
              loadComponent: () => import('./pages/modulos/caracterizacion/idea-de-negocio/idea-de-negocio.component').then(m => m.IdeaDeNegocioComponent)
        },
        { path: 'caracterizacion-ampliada',
              loadComponent: () => import('./pages/modulos/caracterizacion/ampliada/ampliada.component').then(m => m.AmpliadaComponent)
        },
        { path: 'caracterizacion-basica',
              loadComponent: () => import('./pages/modulos/caracterizacion/basica/basica.component').then(m => m.BasicaComponent)
        }
        ]
        },
    ]
  },


];
