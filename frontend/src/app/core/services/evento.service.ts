// core/services/evento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Evento } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private baseUrl = 'http://localhost:3000/api/movendo/evento';

  constructor(private http: HttpClient) { }

  list(): Observable<Evento[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => res.data ?? res)
    );
  }

  get(slug: string): Observable<Evento> {
    return this.http.get<any>(`${this.baseUrl}/${slug}`).pipe(
      map(res => res.data ?? res)
    );
  }

  create(evento: Evento): Observable<Evento> {
    return this.http.post<any>(this.baseUrl, evento).pipe(
      map(res => res.data ?? res)
    );
  }

  update(slug: string, evento: Evento): Observable<Evento> {
    return this.http.put<any>(`${this.baseUrl}/${slug}`, evento).pipe(
      map(res => res.data ?? res)
    );
  }

  delete(slug: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${slug}`).pipe(
      map(res => res.data ?? res)
    );
  }
}
