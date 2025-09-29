import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CarouselHome } from '../models/carousel.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})

export class CarouselService {

  constructor(private apiService: ApiService) { }

  getCarouselHome(): Observable<CarouselHome[]> {
    return this.apiService.get(`/carousel/category`, undefined, 3000).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getCarouselEvento(slug: string): Observable<CarouselHome[]> {
    return this.apiService.get(`/carousel/evento/${slug}/`, undefined, 3000).pipe(
      map((res) => {
        return res;
      })
    );
  }

  getCarouselEvento(slug: string): Observable<CarouselHome[]> {
    console.log('[Service] Fetching carousel data from:', `${URL}/evento/${slug}/`);
    return this.http.get<CarouselHome[]>(`${URL}/evento/${slug}/`).pipe(
      map((res) => {
        console.log('[Service] Response:', res);
        return res;
      })
    );
  }
}
