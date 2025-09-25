import { Component, OnInit } from '@angular/core';
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
export class ListCategoryComponent implements OnInit {

    categories: Categories[] = [];
    loading = false;
    error: string | null = null;
    editing: Categories | null = null;

    constructor(
        private categoriesService: CategoriesService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.loading = true;
        this.error = null;

        this.categoriesService.list().subscribe({
            next: data => {
                this.categories = data;
                this.loading = false;
            },
            error: err => {
                this.error = 'Error cargando productos';
                this.loading = false;
            }
        });
    }

    trackByProd(index: number, categories: Categories): string {
        return categories.slug ?? index.toString();
    }

}
