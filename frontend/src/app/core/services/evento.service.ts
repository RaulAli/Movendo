import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Evento } from '../models/evento.model';
import { ApiService } from './api.service';

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
