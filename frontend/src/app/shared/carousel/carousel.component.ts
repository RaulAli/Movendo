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

    @ViewChild('carousel', { static: true }) carousel!: ElementRef<HTMLDivElement>;

    constructor(private carouselService: CarouselService) { }

    ngOnInit(): void {
        this.load_carousel();
    }

    load_carousel(): void {
        if (!this.slug_evento) {
            this.carouselService.getCarouselHome().subscribe((res: any) => {
                // console.log('[CarouselComponent] Data received:', res);
                this.carouselData = res.category;
            });
        } else {
            this.carouselService.getCarouselEvento(this.slug_evento).subscribe((res: any) => {
                // console.log('[CarouselComponent] Evento data received:', res);
                this.carouselData = res.evento.image;
            });
        }
    }

    scrollNext() {
        this.carousel.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }

    scrollPrev() {
        this.carousel.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
}
