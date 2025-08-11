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

export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)},
  {path: 'modulos', loadComponent: () => import('./pages/modulos/modulos.component').then(m => m.ModulosComponent),
    children: [
        { path: 'caracterizacion', loadComponent: () => import('./pages/modulos/caracterizacion/caracterizacion.component').then(m => m.CaracterizacionComponent) },
        { path: 'monitoreos', loadComponent: () => import('./pages/modulos/monitoreos/monitoreos.component').then(m => m.MonitoreosComponent) },
        { path: 'plan-formacion', loadComponent: () => import('./pages/modulos/plan-formacion/plan-formacion.component').then(m => m.PlanFormacionComponent) },
        { path: 'visitas-implementacion', loadComponent: () => import('./pages/modulos/visitas-implementacion/visitas-implementacion.component').then(m => m.VisitasImplementacionComponent) },
        { path: 'visitas-seguimiento', loadComponent: () => import('./pages/modulos/visitas-seguimiento/visitas-seguimiento.component').then(m => m.VisitasSeguimientoComponent) },
        { path: 'misiones', loadComponent: () => import('./pages/modulos/misiones/misiones.component').then(m => m.MisionesComponent) },

    ]
  },
  {path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)},
  {path: 'account', loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent)},

];
