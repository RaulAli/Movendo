import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
    offset = 0;
    limit = 9;
    category: Category[] = [];
    loading = false;
    finished = false;
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
        // if (this.loading || this.finished) return;

        const params = this.getRequestParams(this.offset, this.limit);
        this.loading = true;
        this.error = null;

        this.categoryService.list(params).subscribe({
            next: data => {
                // console.log(data);
                var sizeCategory = data.length;
                this.category = data;

                if (sizeCategory < this.limit) {
                    this.finished = true;
                } else {
                    this.limit = this.limit + 3;
                }
                this.loading = false;
            },
            error: () => {
                this.error = 'Error cargando categorías';
                this.loading = false;
            }
        });
    }

    getRequestParams(offset: number, limit: number): any {
        let params: any = {};

        params[`offset`] = offset;
        params[`limit`] = limit;

        return params;
    }

    scroll() {
        if (this.finished !== true) {
            this.loadCategory();
        }

    }

    trackByCategory(index: number, category: Category): string {
        return category.slug ?? index.toString();
    }
}
