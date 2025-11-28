import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Carrito } from '../models/carrito.model';
import { UserService } from './auth.service'; // Import UserService

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private cartSubject = new BehaviorSubject<Carrito | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private userService: UserService // Inject UserService
  ) {
    // React to authentication changes
    this.userService.isAuthenticated.pipe(
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.getCart(); // Fetch cart if authenticated
        } else {
          this.clearCart(); // Clear cart if not authenticated
          return of(null);
        }
      })
    ).subscribe();
  }

  getCart(): Observable<Carrito | null> {
    return this.apiService.get('/carrito', undefined, 3000).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addItemToCart(item: { id_evento: string, cantidad: number, merchants: {id_merchant: string, cantidad: number}[] }): Observable<Carrito> {
    return this.apiService.post('/carrito', item, 3000).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateCartItem(eventoId: string, cantidad: number): Observable<Carrito> {
    return this.apiService.put(`/carrito/${eventoId}`, { cantidad }, 3000).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItemFromCart(eventoId: string): Observable<Carrito> {
    return this.apiService.delete(`/carrito/${eventoId}`, 3000).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart() {
    this.cartSubject.next(null);
  }

  get cartItemCount$(): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        if (!cart) {
          return 0;
        }
        return cart.items.reduce((acc, item) => acc + item.cantidad, 0);
      })
    );
  }
}
