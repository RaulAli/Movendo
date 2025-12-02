import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/merch-prods.model';

@Component({
  selector: 'app-list-merchant-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-merchant-product.component.html',
  styleUrls: ['./list-merchant-product.component.scss'],
})
export class MerchantsComponent {
  @Input() products: Product[] = [];
  @Output() productSelected = new EventEmitter<Product>();

  constructor() { }

  onProductClick(product: Product): void {
    this.productSelected.emit(product);
  }
}
