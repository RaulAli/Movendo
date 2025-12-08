import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { CarritoService } from '../../core/services/carrito.service';
import { Carrito, CartItem } from '../../core/models/carrito.model';
import { RouterLink } from '@angular/router';
import { MerchantsService } from '../../core/services/merchant_products.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../core/services/auth.service';
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss']
})
export class CarritoPage implements OnInit, OnDestroy {
  cart$: Observable<Carrito | null>;
  pago: 'carrito' | 'pago' = 'carrito';

  @ViewChild('cardElement', { static: false }) cardElementRef!: ElementRef;
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;

  paymentForm: FormGroup;
  isProcessing = false;
  paymentError: string | null = null;
  paymentSuccess: string | null = null;

  // Tu clave pública (la proporcionada)
  private readonly STRIPE_PUBLIC_KEY = 'pk_test_51SZw1ZAdUt058QrcivFOOeMxSeODEdSdo8JMumfR3KEF7RKYsmMbIb0FomJ1QkGN71TL5X6SqygV935W83opbhI000jPcvGG0j';

  private subs: Subscription[] = [];

  constructor(
    private carritoService: CarritoService,
    private merchantsService: MerchantsService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.cart$ = this.carritoService.cart$;
    this.paymentForm = this.fb.group({
      cardholderName: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    const user = this.userService.getCurrentUser();
    console.log(user);
    this.stripe = await loadStripe(this.STRIPE_PUBLIC_KEY);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.card) {
      try { this.card.unmount(); } catch { }
    }
  }

  goToPago(): void {
    this.pago = 'pago';
    setTimeout(() => this.setupCardElement(), 0);
  }

  volverAlCarrito(): void {
    this.pago = 'carrito';
    this.paymentError = null;
    this.paymentSuccess = null;
  }

  private async setupCardElement() {
    if (!this.stripe) {
      this.paymentError = 'Stripe no inicializado.';
      return;
    }
    if (this.elements) return; // ya está inicializado

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', { hidePostalCode: true });
    if (this.cardElementRef && this.cardElementRef.nativeElement) {
      this.card.mount(this.cardElementRef.nativeElement);
    }
    this.card.on('change', (ev: any) => {
      this.paymentError = ev.error ? ev.error.message : null;
    });
  }

  processPayment(): void {
    // delegamos a la función async que maneja Stripe
    this.pay();
  }

  private async pay(): Promise<void> {
    this.paymentError = null;
    this.paymentSuccess = null;
    this.isProcessing = true;

    // coger carrito una vez
    const cartSnapshot = await firstValueFrom(this.cart$);

    if (!cartSnapshot || !cartSnapshot.items || cartSnapshot.items.length === 0) {
      this.paymentError = 'Carrito vacío.';
      this.isProcessing = false;
      return;
    }

    // Mapear items y asegurar que id_evento es string
    const itemsPayload = cartSnapshot.items.map(it => {
      // it.id_evento puede ser string o un objeto Evento
      let idEventoStr: string;
      if (typeof it.id_evento === 'string') {
        idEventoStr = it.id_evento;
      } else if ((it.id_evento as any)?._id) {
        idEventoStr = (it.id_evento as any)._id;
      } else if ((it.id_evento as any)?.id) {
        idEventoStr = (it.id_evento as any).id;
      } else {
        // fallback: stringify (evita undefined)
        idEventoStr = String((it.id_evento as any));
      }

      return {
        id_evento: idEventoStr,            // ahora siempre string
        cantidad: it.cantidad,
        merchant: Array.isArray((it as any).merchants) && (it as any).merchants.length > 0
          ? (it as any).merchants[0]
          : undefined
      };
    });

    const amount = cartSnapshot.items.reduce((acc, item) => {
      const eventPrice = ((item.id_evento as any)?.price || 0) * (item.cantidad || 0);
      const productsPrice = (item.products || []).reduce((pAcc: number, p: any) => {
        return pAcc + ((p.price || 0) * (p.quantity || 0));
      }, 0);
      return acc + eventPrice + productsPrice;
    }, 0);

    const payload = {
      items: itemsPayload,
      amount,
      currency: 'EUR',
      description: 'Compra desde cliente'
    };

    try {
      // Llamada al saga -> casteamos payload a any para evitar choque estricto de tipos
      const response: any = await firstValueFrom(this.carritoService.createSaga(payload as any));

      // Si tu backend devuelve clientSecret (flow Stripe client-side)
      const clientSecret = response?.clientSecret || response?.paymentIntentClientSecret || response?.paymentIntent?.client_secret;
      // const orderId = response?.order?._id || response?.orderId || response?.id;

      if (clientSecret && this.stripe && this.card) {
        // Confirmamos el pago en el cliente con Stripe Elements
        const result = await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.card,
            billing_details: {
              name: this.paymentForm.get('cardholderName')?.value
            }
          }
        });

        if (result.error) {
          this.paymentError = result.error.message || 'Error al procesar el pago.';
          this.isProcessing = false;
          // NO llamamos finalizeSaga (tu petición)
          return;
        }

        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          this.paymentSuccess = 'Pago realizado con éxito. ¡Gracias!';
          this.isProcessing = false;
          this.carritoService.clearCart();
          return;
        }

        this.paymentError = 'Resultado de pago inesperado.';
        this.isProcessing = false;
        return;
      }

      // Si no hay clientSecret -> el backend ya procesó la orden (server-side)
      if (!clientSecret) {
        if (response && (response.order || response.success || response.message)) {
          this.paymentSuccess = 'Orden procesada por el servidor.';
          this.isProcessing = false;
          this.carritoService.clearCart();
          return;
        } else {
          this.paymentError = 'No se devolvió clientSecret ni confirmación del servidor.';
          this.isProcessing = false;
          return;
        }
      }

    } catch (err: any) {
      console.error('Error creando saga:', err);
      this.paymentError = err?.message || 'Error al iniciar la orden.';
      this.isProcessing = false;
    }
  }

  // -----------------------------
  // Métodos que el template usa
  // -----------------------------
  // Normaliza el id del product (puede venir _id o id)
  getProductId(product: any): string {
    return product?._id || product?.id || String(product);
  }

  // Llamado desde template para cambiar cantidad de un merchant product
  updateMerchantProductQuantity(item: CartItem, productId: string, newQuantity: number) {
    if (!item || !item.id_evento) return;

    // Si productId viene vacío intenta normalizar
    const pid = productId || '';

    // Aseguramos límites
    if (newQuantity < 0) newQuantity = 0;
    if (newQuantity > item.cantidad) newQuantity = item.cantidad;

    if (newQuantity === 0) {
      // eliminar merchant product
      this.carritoService.removeMerchantProductFromCart((item.id_evento as any)?._id || (item.id_evento as any).id || String(item.id_evento), pid)
        .subscribe(() => { }, err => console.error(err));
    } else {
      this.carritoService.updateCartMerchantItem((item.id_evento as any)?._id || (item.id_evento as any).id || String(item.id_evento), pid, newQuantity)
        .subscribe(() => { }, err => console.error(err));
    }
  }

  // Actualiza cantidad del evento principal
  updateQuantity(item: CartItem, newQuantity: number) {
    if (!item || !(item.id_evento as any)) return;
    const eventoId = (item.id_evento as any)?._id || (item.id_evento as any).id || String(item.id_evento);

    if (newQuantity < 1) {
      this.removeFromCart(eventoId);
      return;
    }
    this.carritoService.updateCartItem(eventoId, newQuantity).subscribe(() => { }, err => console.error(err));
  }

  removeFromCart(eventoIdOrObject: string | any) {
    const eventoId = typeof eventoIdOrObject === 'string'
      ? eventoIdOrObject
      : (eventoIdOrObject?._id || eventoIdOrObject?.id || String(eventoIdOrObject));

    if (!eventoId) return;
    this.carritoService.removeItemFromCart(eventoId).subscribe(() => { }, err => console.error(err));
  }

  // Calcula total de un item (evento + productos)
  getItemTotal(item: any): number {
    if (!item) return 0;
    const eventPrice = ((item.id_evento as any)?.price || 0) * (item.cantidad || 0);
    const productsPrice = (item.products || []).reduce((acc: number, p: any) => {
      const price = p?.price || 0;
      const qty = p?.quantity || p?.cantidad || 0;
      return acc + (price * qty);
    }, 0);
    return eventPrice + productsPrice;
  }

  // Calcula total del carrito (usado por template)
  getTotalPrice(cart: Carrito | null): number {
    if (!cart) return 0;
    return cart.items.reduce((acc: number, item: any) => {
      return acc + this.getItemTotal(item);
    }, 0);
  }
}
