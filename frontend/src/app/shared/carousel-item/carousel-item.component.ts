import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselHome } from '../../core/models/carousel.model';

@Component({
    selector: 'app-carousel-item',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './carousel-item.component.html',
    styleUrls: ['./carousel-item.component.scss']
})
export class CarouselItemComponent {
    @Input() carousel!: CarouselHome;
}
