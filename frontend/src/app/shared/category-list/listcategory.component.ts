import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoriesService } from '../../core/services/category.service';
import { Categories } from '../../models/category.model';
import { CardCategories } from '../category-card/cat-card.component';

@Component({
    selector: 'categories-list',
    standalone: true,
    imports: [CommonModule, CardCategories],
    templateUrl: './listcategory.component.html',
    styleUrls: ['./listcategory.component.scss']
})
export class ListCategoryComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('categoriesCarousel') carouselRef!: ElementRef;

    categories: Categories[] = [];
    loading = false;
    error: string | null = null;
    editing: Categories | null = null;

    currentSlide = 0;
    indicators: number[] = [];
    private cardsPerView = 5;
    private resizeObserver: ResizeObserver | null = null;

    constructor(
        private categoriesService: CategoriesService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    ngAfterViewInit(): void {
        this.setupCarouselResponsive();
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    loadCategories(): void {
        this.loading = true;
        this.error = null;

        this.categoriesService.list().subscribe({
            next: data => {
                this.categories = data;
                this.updateIndicators();
                this.loading = false;
            },
            error: err => {
                this.error = 'Error cargando productos';
                this.loading = false;
            }
        });
    }

    // Configurar responsividad del carrusel
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

        if (containerWidth < 768) {
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
        const totalSlides = Math.ceil(this.categories.length / this.cardsPerView);
        this.indicators = Array(totalSlides).fill(0).map((_, i) => i);
    }

    scrollCarousel(direction: number): void {
        const totalSlides = Math.ceil(this.categories.length / this.cardsPerView);
        this.currentSlide = (this.currentSlide + direction + totalSlides) % totalSlides;
        this.goToSlide(this.currentSlide);
    }

    goToSlide(slideIndex: number): void {
        this.currentSlide = slideIndex;
        const carousel = this.carouselRef.nativeElement;
        const cardWidth = 280 + 20;
        const scrollPosition = this.currentSlide * this.cardsPerView * cardWidth;

        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    trackByProd(index: number, categories: Categories): string {
        return categories.slug ?? index.toString();
    }
}