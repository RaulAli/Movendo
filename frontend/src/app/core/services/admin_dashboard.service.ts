import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Evento } from '../models/evento.model';
import { Category } from '../models/category.model';
import { User } from '../models/auth.model';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { MerchantUser } from '../models/merchant-user.model';
import { Product } from '../models/merch-prods.model';
import { merch_Category } from '../models/merch-categories.model';

@Injectable({
    providedIn: 'root'
})
export class AdminDashboardService {

    constructor(private apiService: ApiService) { }

    list(): Observable<Evento[]> {
        return this.apiService.get(`/eventos`, new HttpParams(), 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    create(evento: Evento): Observable<Evento> {
        return this.apiService.post(`/eventos`, evento, 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    update(slug: string, evento: Partial<Evento>): Observable<Evento> {
        return this.apiService.put(`/eventos/${slug}`, evento, 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    delete(slug: string): Observable<any> {
        return this.apiService.delete(`/eventos/${slug}`, 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    getAllCiudades(): Observable<any[]> {
        return this.apiService.get(`/eventos/ciudad`, new HttpParams(), 3002).pipe(
            map(res => res ?? [])
        );
    }

    // Categories
    create_cat(category: Category): Observable<Category> {
        return this.apiService.post(`/category`, category, 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    update_cat(slug: string, category: Partial<Category>): Observable<Category> {
        return this.apiService.put(`/category/${slug}`, category, 3002).pipe(
            map((res: any) => res?.data ?? res)
        );
    }


    delete_cat(slug: string): Observable<any> {
        return this.apiService.delete(`/category/${slug}`);
    }

    list_cat(): Observable<Category[]> {
        return this.apiService.get(`/category`, new HttpParams(), 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    //Usuarios
    list_usr(): Observable<User[]> {
        return this.apiService.get_admin('/users').pipe(
            map((res: any) => {
                if (Array.isArray(res)) return res as User[];
                return (res?.items ?? res?.user ?? res?.data ?? []) as User[];
            })
        );
    }

    delete_usr(username: string): Observable<void> {
        return this.apiService.delete(`/users/${username}`, 3002);
    }


    update_usr(id: string, userPartial: Partial<User>): Observable<User> {
        return this.apiService.put_admin(`/users/${id}`, userPartial).pipe(
            map((res: any) => {
                if (res?.user) return res.user as User;
                if (res?.data) return res.data as User;
                return res as User;
            })
        );
    }

    // Merchant Users
    list_merch_users(): Observable<MerchantUser[]> {
        return this.apiService.get(`/merchant_users`, new HttpParams(), 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    // Merchant Products
    list_merch_products(): Observable<Product[]> {
        return this.apiService.get(`/merch_products`, new HttpParams(), 3002).pipe(
            map(res => res.data ?? res)
        );
    }

    // Merchant Categories
    list_merch_categories(): Observable<merch_Category[]> {
        return this.apiService.get(`/merch_categories`, new HttpParams(), 3002).pipe(
            map(res => res.data ?? res)
        );
    }
}