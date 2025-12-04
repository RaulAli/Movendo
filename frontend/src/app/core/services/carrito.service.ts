import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Carrito, CartProduct } from '../models/carrito.model';
import { UserService } from './auth.service';
import { MerchantsService } from './merchant_products.service';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private cartSubject = new BehaviorSubject<Carrito | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private merchantsService: MerchantsService
  ) {
    this.userService.isAuthenticated.pipe(
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.getCart();
        } else {
          this.clearCart();
          return of(null);
        }
      })
    ).subscribe();
  }

  getCart(): Observable<Carrito | null> {
    return this.apiService.get('/carrito', undefined, 3000).pipe(
      mergeMap((cart: Carrito) => {
        if (cart && cart.items && cart.items.length > 0) {
          return forkJoin({
            cart: of(cart),
            allMerchantProducts: this.merchantsService.getProductsByMerchantIds(
              cart.items
                .flatMap(item => item.merchants || []) // Ensure merchants is an array and handle null/undefined
                .filter(merchant => merchant && merchant.id_merchant && merchant.id_merchant.username) // Filter out null/undefined merchants or those without username
                .map(merchant => merchant.id_merchant.username!) // Extract username
                .filter((value, index, self) => self.indexOf(value) === index) // Get unique merchant IDs
            )
          }).pipe(
            map(({ cart, allMerchantProducts }) => {
              cart.items.forEach(item => {
                item.products = []; // Initialize products array for each item
                (item.merchants || []).forEach(merchantInCart => {
                  const matchedProduct = allMerchantProducts.find(
                    p => p.authorId === merchantInCart.id_merchant.username
                  );
                  if (matchedProduct) {
                    // Clone the product and add quantity
                    item.products?.push({ ...matchedProduct, quantity: merchantInCart.cantidad });
                  }
                });
              });
              this.cartSubject.next(cart);
              return cart;
            })
          );
        }
        this.cartSubject.next(cart);
        return of(cart);
      })
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
