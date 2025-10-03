import { Route } from "@angular/router";
import { ShopPage } from "./shop.page";

export default [
    {
        path: '',
        loadComponent: () => import('./shop.page').then(c => c.ShopPage)
    },
    {
        path: 'category/:slug',
        loadComponent: () => import('./shop.page').then(c => c.ShopPage)
    }
] as Route[]