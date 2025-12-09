import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
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
export class CarritoPage implements OnInit, AfterViewInit, OnDestroy {
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

  // clave pública stripe
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
    this.stripe = await loadStripe(this.STRIPE_PUBLIC_KEY);

  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.destroyCard();
  }

  goToPago(): void {
    this.pago = 'pago';
    setTimeout(() => this.setupCardElement(), 0);
  }

  volverAlCarrito(): void {
    this.pago = 'carrito';
    this.paymentError = null;
    this.paymentSuccess = null;
    this.destroyCard();
  }

  private async setupCardElement() {
    this.paymentError = null;

    if (!this.stripe) {
      this.stripe = await loadStripe(this.STRIPE_PUBLIC_KEY);
      if (!this.stripe) {
        this.paymentError = 'No se pudo inicializar Stripe.';
        return;
      }
    }

    if (this.elements && this.card) return;

    try {
      this.elements = this.stripe.elements();
      this.card = this.elements.create('card', { hidePostalCode: true });

      if (this.cardElementRef && this.cardElementRef.nativeElement) {
        try { this.card.unmount(); } catch { /* noop */ }
        this.card.mount(this.cardElementRef.nativeElement);
      }

      this.card.on('change', (ev: any) => {
        this.paymentError = ev.error ? ev.error.message : null;
      });
    } catch (err: any) {
      console.error('Error setupCardElement:', err);
      this.paymentError = 'Error inicializando el elemento de tarjeta.';
    }
  }

  private destroyCard() {
    if (this.card) {
      try {
        this.card.unmount();
      } catch (e) { /* noop */ }
      this.card = null;
    }
    this.elements = null;
  }

  processPayment(): void {
    void this.pay();
  }

  private async pay(): Promise<void> {
    this.paymentError = null;
    this.paymentSuccess = null;
    this.isProcessing = true;

    const cartSnapshot = await firstValueFrom(this.cart$);

    if (!cartSnapshot || !cartSnapshot.items || cartSnapshot.items.length === 0) {
      this.paymentError = 'Carrito vacío.';
      this.isProcessing = false;
      return;
    }

    const user = this.userService.getCurrentUser();
    const username = user?.username || user?.email || null;

    const itemsPayload = cartSnapshot.items.map(it => {
      let idEventoStr: string;
      if (typeof it.id_evento === 'string') {
        idEventoStr = it.id_evento;
      } else if ((it.id_evento as any)?._id) {
        idEventoStr = (it.id_evento as any)._id;
      } else if ((it.id_evento as any)?.id) {
        idEventoStr = (it.id_evento as any).id;
      } else {
        idEventoStr = String((it.id_evento as any));
      }

      const merchantArray: Array<{ id_merchant: string; cantidad: number }> = [];

      if (Array.isArray(it.merchants)) {
        it.merchants.forEach((merchantItem: any) => {
          if (merchantItem && merchantItem.id_product) {
            const eventMerchants = (it.id_evento as any)?.id_merchant;
            if (Array.isArray(eventMerchants) && eventMerchants.length > 0) {
              merchantArray.push({
                id_merchant: eventMerchants[0],
                cantidad: merchantItem.cantidad || 1
              });
            } else if ((it.id_evento as any)?.id_merchant) {
              merchantArray.push({
                id_merchant: (it.id_evento as any).id_merchant,
                cantidad: merchantItem.cantidad || 1
              });
            }
          }
        });
      }

      return {
        id_evento: idEventoStr,
        cantidad: it.cantidad,
        merchant: merchantArray
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
      description: 'Compra desde cliente',
      username: username
    };

    console.log('Payload enviado al backend:', JSON.stringify(payload, null, 2));

    try {
      const response: any = await firstValueFrom(this.carritoService.createSaga(payload as any));
      console.log("REsponse:", response.paymentids);
      const clientSecret = response?.clientSecret

      if (clientSecret) {
        if (!this.stripe) {
          this.paymentError = 'Stripe no inicializado.';
          this.isProcessing = false;
          return;
        }
        if (!this.card) {
          this.paymentError = 'Elemento de tarjeta no inicializado.';
          this.isProcessing = false;
          return;
        }

        // Confirmar con Stripe (cliente)
        const name = this.paymentForm.get('cardholderName')?.value || undefined;

        const result = await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.card,
            billing_details: {
              name
            }
          }
        });

        if (result.error) {
          this.paymentError = result.error.message || 'Error al procesar el pago.';
          this.isProcessing = false;
          return;
        }

        // Comprobamos el estado del paymentIntent
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          try {
            const user = this.userService.getCurrentUser();
            const username = user?.username || user?.email || 'guest';

            let orderId = response?.order?._id ?? null;

            if (!orderId) {
              const pi: any = result.paymentIntent;
              orderId = pi?.metadata?.orderId ?? null;
            }

            if (!orderId) {
              console.warn('No se tiene orderId (response.order._id ni paymentIntent.metadata.orderId). Los tickets se crearán con orderId null.');
            }

            const ticketPromises = itemsPayload.map(it => {
              const ticketPayload = {
                orderId,
                eventId: it.id_evento,
                username,
                type: 'general'
              };
              return firstValueFrom(this.carritoService.createTicket(ticketPayload));
            });

            const createdTickets = await Promise.all(ticketPromises);

            this.carritoService.updatePayment(response.paymentids, { status: 'SHAVED' })
              .subscribe({
                next: res => console.log('Pago actualizado', res),
                error: err => console.error('Error', err)
              });

            // éxito: limpiar carrito y mostrar mensaje
            this.paymentSuccess = 'Pago realizado con éxito. Tickets generados.';
            console.log('Tickets creados:', createdTickets);

            this.cart$.subscribe(cart => {
              if (cart) {
                console.log("ID del carrito:",);
                this.carritoService.updateStateCarr(cart._id, { status: 'paid' })
                  .subscribe({
                    next: res => console.log('Pago actualizado', res),
                    error: err => console.error('Error', err)
                  });

              }
            });

            this.carritoService.clearCart();
          } catch (ticketErr: any) {
            console.error('Error creando tickets tras pago exitoso:', ticketErr);
            this.paymentSuccess = 'Pago realizado con éxito. Error creando tickets (ver consola).';
          }

          this.isProcessing = false;
          // desmontar los elementos
          this.destroyCard();
          return;
        }

        this.paymentError = `Estado de pago: ${result.paymentIntent?.status || 'desconocido'}`;
        this.isProcessing = false;
        return;
      }

      if (!clientSecret) {
        if (response && (response.order || response.success || response.message)) {
          this.paymentSuccess = 'Orden procesada por el servidor.';
          this.isProcessing = false;
          this.carritoService.clearCart();
          this.destroyCard();
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
      return;
    }
  }

  getProductId(product: any): string {
    return product?._id || product?.id || String(product);
  }

  updateMerchantProductQuantity(item: CartItem, productId: string, newQuantity: number) {
    if (!item || !item.id_evento) return;

    const pid = productId || '';

    if (newQuantity < 0) newQuantity = 0;
    if (newQuantity > item.cantidad) newQuantity = item.cantidad;

    if (newQuantity === 0) {
      this.carritoService.removeMerchantProductFromCart((item.id_evento as any)?._id || (item.id_evento as any).id || String(item.id_evento), pid)
        .subscribe(() => { }, err => console.error(err));
    } else {
      this.carritoService.updateCartMerchantItem((item.id_evento as any)?._id || (item.id_evento as any).id || String(item.id_evento), pid, newQuantity)
        .subscribe(() => { }, err => console.error(err));
    }
  }

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

  getTotalPrice(cart: Carrito | null): number {
    if (!cart) return 0;
    return cart.items.reduce((acc: number, item: any) => {
      return acc + this.getItemTotal(item);
    }, 0);
  }
}