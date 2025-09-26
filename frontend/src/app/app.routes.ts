// src/app/app.routes.ts
import { Routes } from '@angular/router';



export const routes: Routes = [
    // { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./pages/home/home.page').then(c => c.HomePage) },
    { path: 'shop', loadComponent: () => import('./pages/shop/shop.page').then(c => c.ShopPage) },
    // { path: 'shop', component: ShopPage },
    { path: '**', redirectTo: '' },
];
