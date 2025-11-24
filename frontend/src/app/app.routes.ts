// src/app/app.routes.ts - CORREGIDO
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./pages/home/home.page').then(c => c.HomePage) },
    { path: 'shop', loadChildren: () => import('./pages/shop/shop.routes') },
    { path: 'details', loadChildren: () => import('./pages/details/details-routing').then(m => m.DETAILS_ROUTES) },
    { path: 'auth', loadChildren: () => import('./pages/auth/auth-routing').then(m => m.AUTH_ROUTES) },
    { path: 'admin', loadChildren: () => import('./pages/admin_auth/admin_auth.routing').then(m => m.AdminAuthRoutes) },
    { path: 'merchant', loadChildren: () => import('./pages/merchant_auth/merchant_auth.routing').then(m => m.AuthMerchantRoutes) }, // New merchant routes
    { path: 'profile', loadChildren: () => import('./pages/profile/profile-routing').then(m => m.PROFILE_ROUTES) },
    { path: '**', redirectTo: 'home' }
];