import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { CardCategory } from '../card-category/card-category.component';

@Component({
    selector: 'list-category',
    standalone: true,
    imports: [CommonModule, CardCategory],
    templateUrl: './list-category.component.html',
    styleUrls: ['./list-category.component.scss']
})
export class ListCategoryComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('categoryCarousel') carouselRef!: ElementRef;

    category: Category[] = [];
    loading = false;
    error: string | null = null;
    editing: Category | null = null;

    // Variables para el carrusel
    currentSlide = 0;
    indicators: number[] = [];
    private cardsPerView = 4;
    private resizeObserver: ResizeObserver | null = null;
    private cardWidth = 280;
    private cardGap = 30;

    constructor(
        private categoryService: CategoryService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadCategory(); // Cambiado el nombre del método para coincidir
    }

    ngAfterViewInit(): void {
        this.setupCarouselResponsive();
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    loadCategory(): void {
        this.loading = true;
        this.error = null;

        this.categoryService.list().subscribe({
            next: data => {
                this.category = data;
                this.updateIndicators();
                this.loading = false;

                setTimeout(() => {
                    this.updateCardsPerView();
                }, 100);
            },
            error: err => {
                this.error = 'Error cargando categorías';
                this.loading = false;
            }
        });
    }

    private setupCarouselResponsive(): void {
        this.updateCardsPerView();

        this.resizeObserver = new ResizeObserver(() => {
            this.updateCardsPerView();
            this.updateIndicators();
        });

        if (this.carouselRef?.nativeElement) {
            this.resizeObserver.observe(this.carouselRef.nativeElement);
        }
    }

    private updateCardsPerView(): void {
        const containerWidth = this.carouselRef?.nativeElement?.clientWidth || 1200;

        if (containerWidth < 640) {
            this.cardsPerView = 1;
        } else if (containerWidth < 768) {
            this.cardsPerView = 1;
        } else if (containerWidth < 1024) {
            this.cardsPerView = 2;
        } else if (containerWidth < 1400) {
            this.cardsPerView = 3;
        } else {
            this.cardsPerView = 4;
        }

        this.updateIndicators();
    }

    private updateIndicators(): void {
        const totalSlides = Math.ceil(this.category.length / this.cardsPerView);
        this.indicators = Array(totalSlides).fill(0).map((_, i) => i);
    }

    scrollCarousel(direction: number): void {
        const totalSlides = Math.ceil(this.category.length / this.cardsPerView);
        this.currentSlide = (this.currentSlide + direction + totalSlides) % totalSlides;
        this.goToSlide(this.currentSlide);
    }

    goToSlide(slideIndex: number): void {
        this.currentSlide = slideIndex;
        const carousel = this.carouselRef.nativeElement;

        const scrollPosition = this.currentSlide * this.cardsPerView * (this.cardWidth + this.cardGap);

        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    trackByCategory(index: number, category: Category): string {
        return category.slug ?? index.toString();
    }
}