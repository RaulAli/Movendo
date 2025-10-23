import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Category } from '../../core/models/category.model';
import { Filters } from '../../core/models/filters.model';
import { EventoService } from '../../core/services/evento.service';
import { UserService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-filters',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit, OnDestroy {

    private _listCategories: Category[] = [];
    listCities: string[] = [];
    minAvailablePrice: number = 0;
    maxAvailablePrice: number = 0;
    currentUser: any = null;
    canlikes: boolean = false;
    showCitiesDropdown: boolean = false;
    showCategoriesDropdown: boolean = false;

    private routeSub?: Subscription;

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

    constructor(
        private fb: FormBuilder,
        private eventoService: EventoService,
        private userService: UserService,
        private route: ActivatedRoute
    ) {
        this.filterForm = this.fb.group({
            price_min: [null],
            price_max: [null],
            startDate: [null],
            endDate: [null],
            ciudad: this.fb.array([]),
            categories: this.fb.array([]),
            showFavorites: [false]
        });
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(user => {
            this.currentUser = user;
            this.canlikes = !!(user && (user.token || user.username || user.email));
        });

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

        this.routeSub = this.route.queryParamMap.subscribe(paramMap => {
            this.applyParamsFromEncodedUrl(paramMap);

            if (this.initialFilters && paramMap.keys.length === 0) {
                this.setInitialFilters();
            }
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
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

    onFavoritesChange(event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        this.filterForm.get('showFavorites')?.setValue(checkbox.checked);
    }

    applyFilters(): void {
        const formValue = this.filterForm.value;

        const filters: Filters = {
            category: formValue.categories.length > 0 ? formValue.categories : undefined,
            price_min: formValue.price_min !== null ? formValue.price_min : this.minAvailablePrice,
            price_max: formValue.price_max !== null ? formValue.price_max : this.maxAvailablePrice,
            startDate: formValue.startDate,
            endDate: formValue.endDate,
            ciudad: formValue.ciudad.length > 0 ? formValue.ciudad : undefined,
            showFavorites: formValue.showFavorites ? true : undefined,
            username: formValue.showFavorites && this.currentUser ? this.currentUser.username : undefined
        };

        console.log('Filters emitidos:', filters);
        this.eventofiltros.emit(filters);
    }

    clearFilters(): void {
        this.filterForm.reset({
            price_min: this.minAvailablePrice,
            price_max: this.maxAvailablePrice,
            startDate: null,
            endDate: null,
            showFavorites: false
        });
        this.getCiudadFormArray().clear();
        this.getCategoryFormArray().clear();

        this.eventofiltros.emit({
            category: undefined,
            price_min: this.minAvailablePrice,
            price_max: this.maxAvailablePrice,
            nombre: undefined,
            startDate: undefined,
            endDate: undefined,
            ciudad: undefined,
            showFavorites: undefined,
            username: undefined
        });
    }

    private applyParamsFromEncodedUrl(paramMap: ParamMap) {
        const encodedFilters = paramMap.get('f');

        if (encodedFilters) {
            try {
                const decodedString = decodeURIComponent(encodedFilters);
                const filters: Filters = JSON.parse(decodedString);

                this.applyDecodedFilters(filters);
                return;
            } catch (error) {
                console.error('Error decodificando filtros de la URL:', error);
                this.applyParamsFromParamMap(paramMap);
                return;
            }
        }

        this.applyParamsFromParamMap(paramMap);
    }

    private applyDecodedFilters(filters: Filters) {
        const ciudadFormArray = this.getCiudadFormArray();
        const categoryFormArray = this.getCategoryFormArray();

        ciudadFormArray.clear();
        categoryFormArray.clear();

        if (filters.price_min !== undefined) {
            this.filterForm.get('price_min')?.setValue(filters.price_min);
        } else if (this.filterForm.get('price_min')?.value === null) {
            this.filterForm.get('price_min')?.setValue(this.minAvailablePrice);
        }

        if (filters.price_max !== undefined) {
            this.filterForm.get('price_max')?.setValue(filters.price_max);
        } else if (this.filterForm.get('price_max')?.value === null) {
            this.filterForm.get('price_max')?.setValue(this.maxAvailablePrice);
        }

        if (filters.startDate) {
            this.filterForm.get('startDate')?.setValue(filters.startDate);
        }

        if (filters.endDate) {
            this.filterForm.get('endDate')?.setValue(filters.endDate);
        }

        if (filters.showFavorites !== undefined) {
            this.filterForm.get('showFavorites')?.setValue(filters.showFavorites);
        }

        if (filters.ciudad && filters.ciudad.length > 0) {
            filters.ciudad.forEach(ciudad => {
                ciudadFormArray.push(this.fb.control(ciudad));
            });
        }

        if (filters.category && filters.category.length > 0) {
            filters.category.forEach(categoria => {
                categoryFormArray.push(this.fb.control(categoria));
            });
        }
    }

    private applyParamsFromParamMap(paramMap: ParamMap) {
        const ciudadFormArray = this.getCiudadFormArray();
        const categoryFormArray = this.getCategoryFormArray();

        ciudadFormArray.clear();
        categoryFormArray.clear();

        const priceMin = paramMap.get('price_min');
        if (priceMin) {
            this.filterForm.get('price_min')?.setValue(Number(priceMin));
        }

        const priceMax = paramMap.get('price_max');
        if (priceMax) {
            this.filterForm.get('price_max')?.setValue(Number(priceMax));
        }

        const startDate = paramMap.get('startDate');
        if (startDate) {
            this.filterForm.get('startDate')?.setValue(startDate);
        }

        const endDate = paramMap.get('endDate');
        if (endDate) {
            this.filterForm.get('endDate')?.setValue(endDate);
        }

        const showFavorites = paramMap.get('showFavorites');
        if (showFavorites !== null) {
            this.filterForm.get('showFavorites')?.setValue(showFavorites === 'true');
        }

        const ciudades = paramMap.getAll('ciudad');
        if (ciudades.length > 0) {
            ciudades.forEach(ciudad => {
                ciudadFormArray.push(this.fb.control(ciudad));
            });
        }

        const categorias = paramMap.getAll('category');
        if (categorias.length > 0) {
            categorias.forEach(categoria => {
                categoryFormArray.push(this.fb.control(categoria));
            });
        }

        if (!priceMin && this.filterForm.get('price_min')?.value === null) {
            this.filterForm.get('price_min')?.setValue(this.minAvailablePrice);
        }

        if (!priceMax && this.filterForm.get('price_max')?.value === null) {
            this.filterForm.get('price_max')?.setValue(this.maxAvailablePrice);
        }
    }
}