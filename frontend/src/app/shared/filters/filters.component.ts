import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Category } from '../../core/models/category.model';
import { Filters } from '../../core/models/filters.model';
import { EventoService } from '../../core/services/evento.service';

@Component({
    selector: 'app-filters',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {

    private _listCategories: Category[] = [];
    listCities: string[] = [];
    minAvailablePrice: number = 0;
    maxAvailablePrice: number = 0;

    showCitiesDropdown: boolean = false;
    showCategoriesDropdown: boolean = false;

    @Input()
    set listCategories(value: Category[]) {
        this._listCategories = value;
    }
    get listCategories(): Category[] {
        return this._listCategories;
    }

    @Input() initialFilters: Filters | null = null;

    @Output() eventofiltros = new EventEmitter<Filters>();

    filterForm: FormGroup;

    constructor(private fb: FormBuilder, private eventoService: EventoService) {
        this.filterForm = this.fb.group({
            price_min: [null],
            price_max: [null],
            startDate: [null],
            endDate: [null],
            ciudad: this.fb.array([]), // Changed to FormArray
            categories: this.fb.array([]) // Changed to FormArray
        });
    }

    ngOnInit(): void {
        this.eventoService.getUniqueCities().subscribe(cities => {
            this.listCities = cities;
        });

        this.eventoService.getMinMaxPrices().subscribe(prices => {
            this.minAvailablePrice = prices.minPrice;
            this.maxAvailablePrice = prices.maxPrice;
            if (this.filterForm.get('price_min')?.value === null) {
                this.filterForm.get('price_min')?.setValue(prices.minPrice);
            }
            if (this.filterForm.get('price_max')?.value === null) {
                this.filterForm.get('price_max')?.setValue(prices.maxPrice);
            }
        });

        if (this.initialFilters) {
            this.setInitialFilters();
        }
    }

    getCiudadFormArray(): FormArray {
        return this.filterForm.get('ciudad') as FormArray;
    }

    getCategoryFormArray(): FormArray {
        return this.filterForm.get('categories') as FormArray;
    }

    isCiudadSelected(ciudad: string): boolean {
        return this.getCiudadFormArray().controls.some(control => control.value === ciudad);
    }

    isCategorySelected(categorySlug: string): boolean {
        return this.getCategoryFormArray().controls.some(control => control.value === categorySlug);
    }

    onCiudadChange(event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        const ciudadFormArray = this.getCiudadFormArray();

        if (checkbox.checked) {
            ciudadFormArray.push(this.fb.control(checkbox.value));
        } else {
            const index = ciudadFormArray.controls.findIndex(control => control.value === checkbox.value);
            if (index !== -1) {
                ciudadFormArray.removeAt(index);
            }
        }
    }

    onCategoryChange(event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        const categoryFormArray = this.getCategoryFormArray();

        if (checkbox.checked) {
            categoryFormArray.push(this.fb.control(checkbox.value));
        } else {
            const index = categoryFormArray.controls.findIndex(control => control.value === checkbox.value);
            if (index !== -1) {
                categoryFormArray.removeAt(index);
            }
        }
    }

    private setInitialFilters(): void {
        if (!this.initialFilters) return;

        const { category, price_min, price_max, startDate, endDate, ciudad } = this.initialFilters;

        // Clear existing FormArrays before patching
        this.getCiudadFormArray().clear();
        this.getCategoryFormArray().clear();

        if (ciudad && ciudad.length > 0) {
            ciudad.forEach(c => this.getCiudadFormArray().push(this.fb.control(c)));
        }
        if (category && category.length > 0) {
            category.forEach(c => this.getCategoryFormArray().push(this.fb.control(c)));
        }

        this.filterForm.patchValue({
            price_min: price_min !== undefined ? price_min : this.minAvailablePrice,
            price_max: price_max !== undefined ? price_max : this.maxAvailablePrice,
            startDate,
            endDate,
        });
    }

    applyFilters(): void {
        const formValue = this.filterForm.value;

        const filters: Filters = {
            category: formValue.categories.length > 0 ? formValue.categories : undefined,
            price_min: formValue.price_min !== null ? formValue.price_min : this.minAvailablePrice,
            price_max: formValue.price_max !== null ? formValue.price_max : this.maxAvailablePrice,
            startDate: formValue.startDate,
            endDate: formValue.endDate,
            ciudad: formValue.ciudad.length > 0 ? formValue.ciudad : undefined
        };

        this.eventofiltros.emit(filters);
    }

    clearFilters(): void {
        this.filterForm.reset({
            price_min: this.minAvailablePrice,
            price_max: this.maxAvailablePrice,
            startDate: null,
            endDate: null,
        });
        // Clear FormArrays
        this.getCiudadFormArray().clear();
        this.getCategoryFormArray().clear();

        this.eventofiltros.emit({
            category: undefined,
            price_min: this.minAvailablePrice,
            price_max: this.maxAvailablePrice,
            nombre: undefined,
            startDate: undefined,
            endDate: undefined,
            ciudad: undefined
        });
    }
}