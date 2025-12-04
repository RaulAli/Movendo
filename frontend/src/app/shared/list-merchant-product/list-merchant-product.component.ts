import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/merch-prods.model';
import { FormsModule } from '@angular/forms';

export interface SelectedProduct {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-list-merchant-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-merchant-product.component.html',
  styleUrls: ['./list-merchant-product.component.scss'],
})
export class MerchantsComponent {
  @Input() products: Product[] = [];
  @Output() selectionChanged = new EventEmitter<SelectedProduct[]>();

  selectedProducts: { [productId: string]: SelectedProduct } = {};

  constructor() { }

  onSelectionChange(product: Product, event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedProducts[product.id] = { product, quantity: 1 };
    } else {
      delete this.selectedProducts[product.id];
    }
    this.emitSelection();
  }

  onQuantityChange(product: Product, event: any): void {
    const quantity = parseInt(event.target.value, 10);
    if (this.selectedProducts[product.id]) {
      this.selectedProducts[product.id].quantity = quantity;
    }
    this.emitSelection();
  }

  private emitSelection(): void {
    this.selectionChanged.emit(Object.values(this.selectedProducts));
  }
}
