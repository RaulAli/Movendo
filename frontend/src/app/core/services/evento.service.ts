import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Evento, EventosResponse } from '../models/evento.model';
import { ApiService } from './api.service';
import { Filters } from '../models/filters.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  constructor(private apiService: ApiService) { }

  list(): Observable<Evento[]> {
    return this.apiService.get(`/evento`).pipe(
      map(res => res.data ?? res)
    );
  }

  list_filters(filters: Filters): Observable<EventosResponse> {
    const params = new URLSearchParams();

    if (filters.nombre) params.append('nombre', filters.nombre);
    if (filters.category) params.append('category', filters.category);
    if (filters.price_min) params.append('price_min', String(filters.price_min));
    if (filters.price_max) params.append('price_max', String(filters.price_max));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

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
    return this.apiService.post(`/evento`, evento).pipe(
      map(res => res.data ?? res)
    );
  }

  update(slug: string, evento: Evento): Observable<Evento> {
    return this.apiService.put(`/evento/${slug}`, evento).pipe(
      map(res => res.data ?? res)
    );
  }

  delete(slug: string): Observable<any> {
    return this.apiService.delete(`/evento/${slug}`).pipe(
      map(res => res.data ?? res)
    );
  }
}
