import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Carrito, CartProduct } from '../models/carrito.model';
import { UserService } from './auth.service';
import { MerchantsService } from './merchant_products.service';


// Tipos (fuera de la clase)
interface SagaMerchant {
  id_merchant: string;
  cantidad?: number;
}

interface SagaItem {
  id_evento: string;
  cantidad: number;
  merchant?: SagaMerchant | SagaMerchant[]; // puede venir como objeto o array en el request inicial
}

interface SagaRequest {
  orderId?: number;
  items: SagaItem[];
  amount: number | string;
  currency?: string;
  description?: string;
  userId?: string;
  // opcional: token si quieres pasarlo en el body como fallback
  token?: string;
}


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
            allMerchantProducts: this.merchantsService.getProductsByIds(
              cart.items
                .flatMap(item => item.merchants || []) // Ensure merchants is an array and handle null/undefined
                .filter(merchant => merchant && merchant.id_product) // Filter out null/undefined merchants or those without id_product
                .map(merchant => merchant.id_product) // Extract id_product
                .filter((value, index, self) => self.indexOf(value) === index) // Get unique product IDs
            )
          }).pipe(
            map(({ cart, allMerchantProducts }) => {
              cart.items.forEach(item => {
                item.products = []; // Initialize products array for each item
                (item.merchants || []).forEach(merchantInCart => {
                  const matchedProduct = allMerchantProducts.find(
                    p => p.id === merchantInCart.id_product // Compare with p.id
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

  addItemToCart(item: { id_evento: string, cantidad: number, merchants: { id_product: string, cantidad: number }[] }): Observable<Carrito> {
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

  updateCartMerchantItem(eventoId: string, productId: string, cantidad: number): Observable<Carrito> {
    return this.apiService.put(`/carrito/${eventoId}/product/${productId}`, { cantidad }, 3000).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeMerchantProductFromCart(eventoId: string, productId: string): Observable<Carrito> {
    return this.apiService.delete(`/carrito/${eventoId}/product/${productId}`, 3000).pipe(
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

  createSaga(body: SagaRequest, token?: string): Observable<any> {
    const normalizedItems = (body.items || []).map(item => {
      let merchant: any = item.merchant;

      // Si viene como array (tu caso), usamos el primer merchant
      if (Array.isArray(merchant)) {
        merchant = merchant.length > 0 ? merchant[0] : undefined;
      }

      return {
        id_evento: item.id_evento,
        cantidad: item.cantidad,
        merchant
      };
    });

    const payload: SagaRequest = {
      ...body,
      items: normalizedItems,
      token: token || undefined // lo enviamos DENTRO del body porque no podemos poner headers
    };

    // Llamada válida: apiService.post(url, body, timeout)
    return this.apiService.post(`/saga/`, payload, 3000).pipe(
      tap(response => {
        console.log("Saga response:", response);
      })
    );
  }

}
