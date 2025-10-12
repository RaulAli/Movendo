import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../core/models/category.model';
import { Filters } from '../../core/models/filters.model';

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

    @Input() initialFilters: Filters | null = null;

    @Output() eventofiltros = new EventEmitter<Filters>();

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

        Object.keys(categoryGroup.controls).forEach(key => categoryGroup.removeControl(key));

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
        if (!this.initialFilters) return;

        const { category, price_min, price_max } = this.initialFilters;
        this.filterForm.patchValue({ price_min, price_max });

        if (category) {
            const selected = category.split(',');
            const categoryGroup = this.filterForm.get('categories') as FormGroup;
            Object.keys(categoryGroup.controls).forEach(slug => categoryGroup.get(slug)?.setValue(false));
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

        const filters: Filters = {
            category: selectedCategories || undefined,
            price_min: formValue.price_min,
            price_max: formValue.price_max
        };

        this.eventofiltros.emit(filters);
    }

    clearFilters(): void {
        this.filterForm.reset();
        this.eventofiltros.emit({ category: undefined, price_min: undefined, price_max: undefined, nombre: undefined });
    }
}