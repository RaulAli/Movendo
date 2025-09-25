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
      map(res => {
        const data = res.data ?? res;
        return data.map((item: any) => ({
          _id: item._id,
          nombre: item.nombre,
          fecha: item.fecha,
          ciudad: item.ciudad,
          genero: item.genero,
          slug: item.slug,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
      })
    );
  }

  get(slug: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseUrl}/${slug}`);
  }

  create(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.baseUrl, evento);
  }

  update(slug: string, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.baseUrl}/${slug}`, evento);
  }

  delete(slug: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${slug}`);
  }
}
