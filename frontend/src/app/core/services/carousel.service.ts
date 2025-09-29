import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CarouselHome } from '../models/carousel.model';

const URL = 'http://localhost:3000/api/movendo/carousel';

@Injectable({
  providedIn: 'root'
})

export class CarouselService {

  constructor(private http: HttpClient) { }

  getCarouselHome(): Observable<CarouselHome[]> {
    console.log('[Service] Fetching carousel data from:', URL);
    return this.http.get<CarouselHome[]>(`${URL}/category`).pipe(
      map((res) => {
        console.log('[Service] Response:', res);
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
