import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselHome } from '../../core/models/carousel.model';

@Component({
    selector: 'app-carousel-item',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './carousel-item.component.html',
    styleUrls: ['./carousel-item.component.scss']
})
export class CarouselItemComponent implements OnInit {
    @Input() carousel!: CarouselHome;
    @Input() type!: string;

    ngOnInit() {
        // console.log('CarouselItemComponent initialized');
        // console.log('carousel:', this.carousel);
        // console.log('type:', this.type);
    }
}
