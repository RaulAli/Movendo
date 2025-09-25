import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Categories } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseUrl = 'http://localhost:3000/api/movendo/categories';

  constructor(private http: HttpClient) { }

  list(): Observable<Categories[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => {
        const data = res.data ?? res;
        return data.map((item: any) => ({
          _id: item._id,
          nombre: item.nombre,
          descripcion: item.descripcion,
          slug: item.slug,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
      })
    );
  }

  get(slug: string): Observable<Categories> {
    return this.http.get<Categories>(`${this.baseUrl}/${slug}`);
  }

  create(categories: Categories): Observable<Categories> {
    return this.http.post<Categories>(this.baseUrl, categories);
  }

  update(slug: string, categories: Categories): Observable<Categories> {
    return this.http.put<Categories>(`${this.baseUrl}/${slug}`, categories);
  }

  delete(slug: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${slug}`);
  }
}
