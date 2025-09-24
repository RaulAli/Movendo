import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prod } from '../../models/prod.model';

@Component({
  selector: 'prod-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prod-card.component.html',
  styleUrls: ['./prod-card.component.scss']
})
export class CardComponent {
  @Input() prod!: Prod;
  @Output() edit = new EventEmitter<Prod>();
  @Output() delete = new EventEmitter<string>();

  onEdit() {
    this.edit.emit(this.prod);
  }

  async onDelete() {
    this.delete.emit(this.prod.slug!);
  }
}
