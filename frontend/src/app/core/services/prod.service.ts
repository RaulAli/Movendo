import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Prod } from '../../models/prod.model';

@Injectable({
  providedIn: 'root'
})
export class ProdService {
  private baseUrl = 'http://localhost:3000/api/movendo/prods';

  constructor(private http: HttpClient) {}

  list(): Observable<Prod[]> {
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

  get(slug: string): Observable<Prod> {
    return this.http.get<Prod>(`${this.baseUrl}/${slug}`);
  }

  create(prod: Prod): Observable<Prod> {
    return this.http.post<Prod>(this.baseUrl, prod);
  }

  update(slug: string, prod: Prod): Observable<Prod> {
    return this.http.put<Prod>(`${this.baseUrl}/${slug}`, prod);
  }

  delete(slug: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${slug}`);
  }
}
