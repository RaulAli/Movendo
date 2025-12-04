import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { Product } from '../models/merch-prods.model';

import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MerchantsService {

    constructor(private apiService: ApiService) { }

    getAllByEventSlug(slug: string): Observable<Product[]> {
        const params = new HttpParams().set('eventSlug', slug);
        return this.apiService.get('/products', params, 3003).pipe(
            map(res => res.data ?? res)
        );
    }

    getProductsByIds(productIds: string[]): Observable<Product[]> {
        if (!productIds || productIds.length === 0) {
            return of([]);
        }
        const params = new HttpParams().set('productIds', productIds.join(','));
        return this.apiService.get('/products', params, 3003).pipe(
            map(res => res.data ?? res)
        );
    }
}