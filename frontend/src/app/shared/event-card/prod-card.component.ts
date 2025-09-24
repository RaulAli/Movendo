import { Component, Input } from '@angular/core';
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
}
