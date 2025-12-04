import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CarritoService } from '../../core/services/carrito.service';
import { Carrito, CartItem } from '../../core/models/carrito.model';
import { RouterLink } from '@angular/router';
import { MerchantsService } from '../../core/services/merchant_products.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss']
})
export class CarritoPage implements OnInit {
  cart$: Observable<Carrito | null>;

  constructor(
    private carritoService: CarritoService,
    private merchantsService: MerchantsService
  ) {
    this.cart$ = this.carritoService.cart$;
  }

  ngOnInit(): void {
    // Cart is loaded from service constructor
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (!item.id_evento._id) return;
    if (newQuantity < 1) {
      // If quantity is 0, remove the item
      this.removeFromCart(item.id_evento._id);
      return;
    }
    this.carritoService.updateCartItem(item.id_evento._id, newQuantity).subscribe();
  }

  removeFromCart(eventoId: string) {
    this.carritoService.removeItemFromCart(eventoId).subscribe();
  }

  getTotalPrice(cart: Carrito | null): number {
    if (!cart) {
      return 0;
    }
    return cart.items.reduce((acc, item) => {
      const eventPrice = (item.id_evento.price || 0) * item.cantidad;
      const productsPrice = item.products?.reduce((productAcc, product) => productAcc + product.price, 0) || 0;
      return acc + eventPrice + productsPrice;
    }, 0);
  }
}
