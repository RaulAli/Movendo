import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AuthGuard } from '../../core/guards';
import { SettingsComponent } from './settings.component';

export default [
  {
    path: '',
    loadComponent: () => import('./settings.component').then(c => c.SettingsComponent),
    canActivate: [AuthGuard]
  }
] as Route[]