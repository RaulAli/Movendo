import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'card-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card-category.component.html',
  styleUrls: ['./card-category.component.scss']
})
export class CardCategory {
  @Input() category!: Category;
}
