import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
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
export class CarouselComponent implements OnInit, AfterViewInit {
    @Input() slug_evento!: string | null;
    @Input() page!: string | null;
    carouselData: CarouselHome[] = [];

    @ViewChild('carousel', { static: false }) carousel!: ElementRef<HTMLDivElement>;

    private currentIndex = 0;

    constructor(private carouselService: CarouselService) { }

    ngOnInit(): void {
        this.load_carousel();
    }

    ngAfterViewInit(): void {
        // Asegurarse que el scroll inicia en 0
        this.resetScroll();
    }

    load_carousel(): void {
        if (!this.slug_evento) {
            this.carouselService.getCarouselHome().subscribe((res: any) => {
                this.carouselData = res.category;
                // Opcional: despué de cargar datos, reinicia scrolls
                setTimeout(() => this.resetScroll(), 0);
            });
        } else {
            this.carouselService.getCarouselEvento(this.slug_evento).subscribe((res: any) => {
                this.carouselData = res.evento.image;
                setTimeout(() => this.resetScroll(), 0);
            });
        }
    }

    scrollNext(): void {
        if (!this.carousel) return;
        const container = this.carousel.nativeElement;
        const items = container.querySelectorAll<HTMLElement>('app-carousel-item');
        if (!items.length) return;

        if (this.currentIndex < items.length - 1) {
            this.currentIndex++;
            container.scrollTo({
                left: items[this.currentIndex].offsetLeft,
                behavior: 'smooth'
            });
        }
    }

    scrollPrev(): void {
        if (!this.carousel) return;
        const container = this.carousel.nativeElement;
        const items = container.querySelectorAll<HTMLElement>('app-carousel-item');
        if (!items.length) return;

        if (this.currentIndex > 0) {
            this.currentIndex--;
            container.scrollTo({
                left: items[this.currentIndex].offsetLeft,
                behavior: 'smooth'
            });
        }
    }

    resetScroll(): void {
        this.currentIndex = 0;
        if (!this.carousel) return;
        const container = this.carousel.nativeElement;
        container.scrollTo({
            left: 0,
            behavior: 'smooth'
        });
    }
}