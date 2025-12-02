import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

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
}
