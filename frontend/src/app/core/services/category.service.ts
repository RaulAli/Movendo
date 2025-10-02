import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) { }

  list(): Observable<Category[]> {
    return this.apiService.get('/category').pipe(
      map(res => res.data ?? res)
    );
  }

  get(slug: string): Observable<Category> {
    return this.apiService.get(`/category/${slug}`);
  }

  create(category: Category): Observable<Category> {
    return this.apiService.post(`/category/`, category);
  }

  update(slug: string, category: Category): Observable<Category> {
    return this.apiService.put(`/category/${slug}`, category);
  }

  delete(slug: string): Observable<any> {
    return this.apiService.delete(`/category/${slug}`);
  }
}
