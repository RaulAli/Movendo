import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:3000/api/movendo/category';

  constructor(private http: HttpClient) { }

  list(): Observable<Category[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => res.data ?? res)
    );
  }

  get(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${slug}`);
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  update(slug: string, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${slug}`, category);
  }

  delete(slug: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${slug}`);
  }
}
