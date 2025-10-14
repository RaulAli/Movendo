// src/app/app.routes.ts - CORREGIDO
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./pages/home/home.page').then(c => c.HomePage) },
    { path: 'shop', loadChildren: () => import('./pages/shop/shop.routes') },
    { path: 'details', loadChildren: () => import('./pages/details/details-routing').then(m => m.DETAILS_ROUTES) },
    { path: 'auth', loadChildren: () => import('./pages/auth/auth-routing').then(m => m.AUTH_ROUTES) },
    { path: 'profile', loadChildren: () => import('./pages/profile/profile-routing').then(m => m.PROFILE_ROUTES) },
    { path: 'settings', loadChildren: () => import('./shared/settings/settings.routing') },
    { path: '**', redirectTo: 'home' }
];