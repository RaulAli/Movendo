import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Evento } from '../../core/models/evento.model';

@Component({
  selector: 'card-evento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card-evento.component.html',
  styleUrls: ['./card-evento.component.scss']
})
export class CardComponent {
  @Input() evento!: Evento;
}
