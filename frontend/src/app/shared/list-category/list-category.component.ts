import { Component, OnInit } from '@angular/core';
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
export class ListCategoryComponent implements OnInit {
    category: Category[] = [];
    loading = false;
    error: string | null = null;
    editing: Category | null = null;

    constructor(
        private categoryService: CategoryService,
        private router: Router // <- lo mantengo para respetar tu código original
    ) { }

    ngOnInit(): void {
        this.loadCategory();
    }

    loadCategory(): void {
        this.loading = true;
        this.error = null;

        this.categoryService.list().subscribe({
            next: data => {
                this.category = data;
                this.loading = false;
            },
            error: () => {
                this.error = 'Error cargando categorías';
                this.loading = false;
            }
        });
    }

    trackByCategory(index: number, category: Category): string {
        return category.slug ?? index.toString();
    }
}
