import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categories } from '../../core/models/category.model';

@Component({
  selector: 'categories-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cat-card.component.html',
  styleUrls: ['./cat-card.component.scss']
})
export class CardCategories {
  @Input() categories!: Categories;
}
