import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselHome } from '../../core/models/carousel.model';

@Component({
    selector: 'app-carousel-item',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './carousel-item.component.html',
    styleUrls: ['./carousel-item.component.scss']
})
export class CarouselItemComponent implements OnChanges {
    @Input() carousel!: CarouselHome;
    @Input() type!: string;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['carousel']) {
            console.log('[CarouselItemComponent] Datos recibidos (carousel):', this.carousel);
        }

        if (changes['type']) {
            console.log('[CarouselItemComponent] Tipo recibido (type):', this.type);
        }
    }
}
