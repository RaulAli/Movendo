import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Evento } from '../models/evento.model';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

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

    getUniqueCities(): Observable<string[]> {
        return this.apiService.get(`/cities`).pipe(
            map(res => res.data ?? [])
        );
    }

    // Categories
    update_cat(slug: string, category: Partial<Category>): Observable<Category> {
        return this.apiService.put(`/categories/${slug}`, category, 3002).pipe(
            map((res: any) => res?.data ?? res)
        );
    }


    delete_cat(slug: string): Observable<any> {
        return this.apiService.delete(`/category/${slug}`);
    }

    list_cat(): Observable<Category[]> {
        return this.apiService.get(`/categories`, new HttpParams(), 3002).pipe(
            map(res => res.data ?? res)
        );
        return this.apiService.get_admin('/categories').pipe(
            map((res: any) => {
                if (Array.isArray(res)) return res as Category[];
                return (res?.items ?? res?.category ?? res?.data ?? []) as Category[];
            })
        );
    }
}
