import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Evento } from '../models/evento.model';
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
}
