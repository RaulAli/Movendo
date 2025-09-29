import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselItemComponent } from '../carousel-item/carousel-item.component';
import { CarouselService } from '../../core/services/carousel.service';
import { CarouselHome } from '../../core/models/carousel.model';

@Component({
    selector: 'app-carousel',
    standalone: true,
    imports: [CommonModule, CarouselItemComponent],
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
    @Input() slug_evento!: string | null;
    @Input() page!: string | null;

    carouselData: CarouselHome[] = [];

    @ViewChild('carousel', { static: false }) carousel!: ElementRef<HTMLDivElement>;

    private currentIndex = 0;

    constructor(private carouselService: CarouselService) { }

    ngOnInit(): void {
        this.load_carousel();
    }

    load_carousel(): void {
        // console.log(this.slug_evento);
        if (!this.slug_evento) {
            this.carouselService.getCarouselHome().subscribe((res: any) => {
                console.log('[CarouselComponent] Data received:', res);
                this.carouselData = res.category;
            });
        }
    }
}