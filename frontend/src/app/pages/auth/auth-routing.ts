// src/app/pages/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { AuthPage } from './auth.page';
import { NoAuthGuard } from '../../core/guards';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: AuthPage,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'register',
    component: AuthPage,
    canActivate: [NoAuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];