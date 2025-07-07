import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Cliente } from './components/cliente/cliente';
import { Page404 } from './components/page404/page404';
import { Login } from './components/login/login';
import { authGuard } from './shared/helpers/guards/auth-guard';
import { Role } from './shared/models/role';
import { loginGuard } from './shared/helpers/guards/login-guard';
import { Tecnico } from './components/tecnico/tecnico';
import { Artefacto } from './components/artefacto/artefacto';
import { Administrador } from './components/administrador/administrador';
import { Oficinista } from './components/oficinista/oficinista';
import { Caso } from './components/caso/caso';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  {
    path: 'artefacto',
    component: Artefacto,
    canActivate: [authGuard],
    data: {
      roles: [Role.Admin, Role.Oficinista],
    },
  },
  {
    path: 'cliente',
    component: Cliente,
    canActivate: [authGuard],
    data: {
      roles: [Role.Admin, Role.Oficinista, Role.Cliente],
    },
  },
  {
    path: 'oficinista',
    component: Oficinista,
    canActivate: [authGuard],
    data: {
      roles: [Role.Admin, Role.Oficinista],
    },
  },
  {
    path: 'admin',
    component: Administrador,
    canActivate: [authGuard],
    data: {
      roles: [Role.Admin],
    },
  },
  {
    path: 'tecnico',
    component: Tecnico,
    canActivate: [authGuard],
    data: {
      roles: [Role.Admin, Role.Oficinista],
    },
  },

  {
    path: 'caso',
    loadComponent: () => import('./components/caso/caso').then((m) => m.Caso),
    canActivate: [authGuard],
    data: {
      roles: [Role.Admin, Role.Oficinista],
    },
  },
  { path: 'login', component: Login, canActivate: [loginGuard] },

  { path: 'casos', redirectTo: 'caso', pathMatch: 'full' },

  { path: '**', component: Page404 },
];
