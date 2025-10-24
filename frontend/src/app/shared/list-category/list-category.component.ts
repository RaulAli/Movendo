import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { CardCategory } from '../card-category/card-category.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
    selector: 'list-category',
    standalone: true,
    imports: [CommonModule, CardCategory, InfiniteScrollModule],
    templateUrl: './list-category.component.html',
    styleUrls: ['./list-category.component.scss']
})
export class ListCategoryComponent implements OnInit {
    private categoryService = inject(CategoryService);
    private router = inject(Router);

    // Subject para el debounce del scroll
    private scrollSubject = new Subject<void>();

    // Usamos signals para el estado reactivo
    categories = signal<Category[]>([]);
    loading = signal(false);
    finished = signal(false);
    error = signal<string | null>(null);

    // Variables de paginación
    private offset = 0;
    private limit = 9;

    constructor() {
        // Configuramos el debounce para el scroll
        this.scrollSubject.pipe(
            debounceTime(500)
        ).subscribe(() => this.loadCategories());
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    async loadCategories(): Promise<void> {
        if (this.loading() || this.finished()) return;

        this.loading.set(true);
        this.error.set(null);

        try {
            const params = this.getRequestParams(this.offset, this.limit);
            const newCategories = await this.categoryService.list(params).toPromise();

            if (newCategories && newCategories.length > 0) {
                // Agregamos las nuevas categorías al array existente
                this.categories.update(current => [...current, ...newCategories]);

                // Preparamos para la siguiente carga
                this.offset += this.limit;

                // Verificamos si hemos llegado al final
                if (newCategories.length < this.limit) {
                    this.finished.set(true);
                }
            } else {
                this.finished.set(true);
            }
        } catch (err) {
            this.error.set('Error cargando categorías');
        } finally {
            this.loading.set(false);
        }
    }

    private getRequestParams(offset: number, limit: number): any {
        return { offset, limit };
    }

    scroll() {
        if (!this.finished()) {
            this.scrollSubject.next();
        }
    }

    resetCategories() {
        this.categories.set([]);
        this.offset = 0;
        this.finished.set(false);
        this.loadCategories();
    }

    trackByCategory(index: number, category: Category): string {
        return category.slug ?? index.toString();
    }

    // Importante: limpiar la suscripción al destruir el componente
    ngOnDestroy() {
        this.scrollSubject.complete();
    }
}