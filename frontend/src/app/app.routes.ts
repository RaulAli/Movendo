// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';

export const routes: Routes = [
    // { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomePage },
    { path: '**', redirectTo: '' },
];
