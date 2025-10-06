import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../core/models/category.model';

export interface EventoFilters {
    category: string;
    price_min: number | null;
    price_max: number | null;
}

@Component({
    selector: 'app-filters',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {

    private _listCategories: Category[] = [];

    @Input()
    set listCategories(value: Category[]) {
        this._listCategories = value;
        this.buildCategoryControls();
    }
    get listCategories(): Category[] {
        return this._listCategories;
    }

    @Input() initialFilters: EventoFilters | null = null;

    @Output() eventofiltros = new EventEmitter<EventoFilters>();

    filterForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.filterForm = this.fb.group({
            price_min: [null],
            price_max: [null],
            categories: this.fb.group({})
        });
    }

    ngOnInit(): void {
        if (this.initialFilters) {
            this.setInitialFilters();
        }
    }

    private buildCategoryControls(): void {
        const categoryGroup = this.filterForm.get('categories') as FormGroup;
        if (!categoryGroup) return;

        Object.keys(categoryGroup.controls).forEach(key => {
            categoryGroup.removeControl(key);
        });

        this.listCategories.forEach(category => {
            if (category.slug) {
                categoryGroup.addControl(category.slug, this.fb.control(false));
            }
        });

        if (this.initialFilters) {
            this.setInitialFilters();
        }
    }

    private setInitialFilters(): void {
        const { category, price_min, price_max } = this.initialFilters!;
        if (price_min !== null) this.filterForm.get('price_min')?.setValue(price_min);
        if (price_max !== null) this.filterForm.get('price_max')?.setValue(price_max);

        if (category) {
            const selected = category.split(',');
            const categoryGroup = this.filterForm.get('categories') as FormGroup;
            selected.forEach(slug => {
                if (categoryGroup.get(slug)) {
                    categoryGroup.get(slug)?.setValue(true);
                }
            });
        }
    }

    applyFilters(): void {
        const formValue = this.filterForm.value;

        const selectedCategories = Object.keys(formValue.categories)
            .filter(slug => formValue.categories[slug] === true)
            .join(',');

        const filters: EventoFilters = {
            category: selectedCategories,
            price_min: formValue.price_min,
            price_max: formValue.price_max
        };

        this.eventofiltros.emit(filters);
    }

    clearFilters(): void {
        this.filterForm.reset();
        this.eventofiltros.emit({ category: '', price_min: null, price_max: null });
    }
}
