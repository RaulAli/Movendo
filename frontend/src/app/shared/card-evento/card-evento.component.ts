import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento } from '../../core/models/evento.model';
import { CarouselComponent } from '../../shared/carousel/carousel.component';

@Component({
  selector: 'card-evento',
  standalone: true,
  imports: [CommonModule, CarouselComponent],
  templateUrl: './card-evento.component.html',
  styleUrls: ['./card-evento.component.scss']
})
export class CardComponent {
  @Input() evento!: Evento;
}
