// src/app/app.routes.ts
import { Routes } from '@angular/router';



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    { path: 'home', loadComponent: () => import('./pages/home/home.page').then(c => c.HomePage) },

    { path: 'shop', loadChildren: () => import('./pages/shop/shop.routes') },

    { path: 'details', loadChildren: () => import('./pages/details/details-routing').then(m => m.DETAILS_ROUTES) },

    { path: '**', redirectTo: '' },
];