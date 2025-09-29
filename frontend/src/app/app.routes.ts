// src/app/app.routes.ts
import { Routes } from '@angular/router';



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    { path: 'home', loadComponent: () => import('./pages/home/home.page').then(c => c.HomePage) },

    { path: 'shop', loadComponent: () => import('./pages/shop/shop.page').then(c => c.ShopPage) },

    { path: 'details/:slug', loadComponent: () => import('./pages/details/details.page').then(c => c.DetailsPage) },

    { path: '**', redirectTo: '' },
];