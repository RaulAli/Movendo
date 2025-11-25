import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Product } from '../models/merch-prods.model';

import { merch_Category } from '../models/merch-categories.model';

import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MerchDashboardService {

    constructor(private apiService: ApiService) { }

    list(user: string): Observable<Product[]> {
        return this.apiService.get(`/products/user/${user}`, new HttpParams(), 3003).pipe(
            map(res => res.data ?? res)
        );
    }

    create(evento: Product): Observable<Product> {
        return this.apiService.post(`/products/`, evento, 3003).pipe(
            map(res => res.data ?? res)
        );
    }

    update(slug: string, evento: Partial<Product>): Observable<Product> {
        return this.apiService.put(`/products/${slug}`, evento, 3003).pipe(
            map(res => res.data ?? res)
        );
    }

    delete(slug: string): Observable<any> {
        return this.apiService.delete(`/products/${slug}`, 3003).pipe(
            map(res => res.data ?? res)
        );
    }

    // Categories
    create_cat(category: merch_Category): Observable<merch_Category> {
        return this.apiService.post(`/categories`, category, 3003).pipe(
            map(res => res.data ?? res)
        );
    }

    update_cat(id: string, category: Partial<merch_Category>): Observable<merch_Category> {
        return this.apiService.put(`/categories/${id}`, category, 3003).pipe(
            map((res: any) => res?.data ?? res)
        );
    }


    delete_cat(id: string): Observable<any> {
        return this.apiService.delete(`/categories/${id}`, 3003);
    }

    list_cat(user: string): Observable<merch_Category[]> {
        return this.apiService.get(`/categories/user/${user}`, new HttpParams(), 3003).pipe(
            map(res => res.data ?? res)
        );
    }

}
