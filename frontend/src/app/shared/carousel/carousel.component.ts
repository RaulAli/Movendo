import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
    carouselData: CarouselHome[] = [];

    @ViewChild('carousel', { static: true }) carousel!: ElementRef<HTMLDivElement>;

    constructor(private carouselService: CarouselService) { }

    ngOnInit(): void {
        this.carouselService.getCarouselHome().subscribe((res: any) => {
            console.log('[CarouselComponent] Data received:', res);
            this.carouselData = res.category;
        });
    }

    scrollNext() {
        this.carousel.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }

    scrollPrev() {
        this.carousel.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
}
