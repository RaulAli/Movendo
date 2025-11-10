import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Evento, EventosResponse } from '../models/evento.model';
import { ApiService } from './api.service';
import { Filters } from '../models/filters.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  constructor(private apiService: ApiService) { }

  list(): Observable<Evento[]> {
    return this.apiService.get(`/eventos`, new HttpParams(), 3002).pipe(
      map(res => res.data ?? res)
    );
  }

  list_filters(filters: Filters): Observable<EventosResponse> {
    const params = new URLSearchParams();

    if (filters.nombre) params.append('nombre', filters.nombre);

    if (filters.category && filters.category.length > 0) {
      filters.category.forEach(cat => params.append('category', cat));
    }

    if (filters.price_min) params.append('price_min', String(filters.price_min));
    if (filters.price_max) params.append('price_max', String(filters.price_max));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.showFavorites) params.append('showFavorites', filters.showFavorites ? 'true' : 'false');
    if (filters.username) params.append('username', String(filters.username));

    // Handle ciudad as string[]
    if (filters.ciudad && filters.ciudad.length > 0) {
      filters.ciudad.forEach(ciu => params.append('ciudad', ciu));
    }

    return this.apiService.get(`/evento?${params.toString()}`).pipe(
      map(res => ({
        data: res.data,
        total: res.meta.total
      }))
    );
  }

  get(slug: string): Observable<Evento> {
    return this.apiService.get(`/evento/${slug}`).pipe(
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

  getMinMaxPrices(category?: string): Observable<{ minPrice: number, maxPrice: number }> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    return this.apiService.get(`/prices/minmax?${params.toString()}`).pipe(
      map(res => res.data ?? { minPrice: 0, maxPrice: 0 })
    );
  }

  favorite(slug: string): Observable<Evento> {
    return this.apiService.post(`/evento/${slug}/favorite`, {}).pipe(
      map(res => res.data)
    );
  }

  unfavorite(slug: string): Observable<Evento> {
    return this.apiService.delete(`/evento/${slug}/favorite`).pipe(
      map(res => res.data)
    );
  }
}
