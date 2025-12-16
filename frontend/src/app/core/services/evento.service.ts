import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Evento, EventosResponse } from '../models/evento.model';
import { ApiService } from './api.service';
import { Filters } from '../models/filters.model';
import { HttpParams } from '@angular/common/http';
import { RAGSearchResponse, IntelligentAutocomplete } from '../models/rag-search.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  constructor(private apiService: ApiService) { }

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

  // --- Modificaciones: usar ApiService en vez de this.http / this.apiUrl ---
  intelligentSearch(query: string, limit: number = 10, filters?: any): Observable<RAGSearchResponse> {
    const body = {
      query,
      limit,
      ...(filters && { filters })
    };

    // Asumimos que ApiService.post devuelve un objeto con .data
    return this.apiService.post(`api/search/rag`, body).pipe(
      map(res => res.data ?? res as RAGSearchResponse)
    );
  }

  // Autocomplete inteligente usando ApiService
  intelligentAutocomplete(query: string, limit: number = 5): Observable<IntelligentAutocomplete> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', String(limit));

    return this.apiService.get(`api/search/autocomplete?${params.toString()}`).pipe(
      map(res => res.data ?? res as IntelligentAutocomplete)
    );
  }

  // Búsqueda tradicional -> construimos query string y usamos ApiService.get
  traditionalSearch(query: string, filters?: Partial<Filters>): Observable<{ data: Evento[]; total: number }> {
    const params = new URLSearchParams();
    params.append('query', query);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            (value as any[]).forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    return this.apiService.get(`/search?${params.toString()}`).pipe(
      map(res => ({
        data: res.data ?? [],
        total: res.meta?.total ?? res.total ?? 0
      }))
    );
  }

}
