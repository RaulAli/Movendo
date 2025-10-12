import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../core/services/evento.service';
import { CategoryService } from '../../core/services/category.service';
import { Evento } from '../../core/models/evento.model';
import { Category } from '../../core/models/category.model';
import { CardComponent } from '../card-evento/card-evento.component';
import { FiltersComponent } from '../filters/filters.component';
import { SearchComponent } from '../search/search.component';
import { Filters } from '../../core/models/filters.model';

@Component({
  selector: 'list-evento',
  standalone: true,
  imports: [CommonModule, CardComponent, FiltersComponent, SearchComponent],
  templateUrl: './list-evento.component.html',
  styleUrls: ['./list-evento.component.scss']
})
export class ListComponent implements OnInit {

  evento: Evento[] = [];
  listCategories: Category[] = [];
  loading = false;
  error: string | null = null;
  initialFilters!: Filters;

  private readonly DEFAULT_LIMIT = 3;
  private readonly DEFAULT_OFFSET = 0;

  constructor(
    private eventoService: EventoService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.categoryService.list({}).subscribe({
      next: (cats) => this.listCategories = cats,
      error: (err) => console.error('Error cargando categorías', err)
    });

    const qp = this.route.snapshot.queryParamMap;

    this.initialFilters = {
      nombre: qp.get('nombre') || undefined,
      category: qp.get('category') || undefined,
      price_min: qp.get('price_min') ? Number(qp.get('price_min')) : undefined,
      price_max: qp.get('price_max') ? Number(qp.get('price_max')) : undefined,
      limit: qp.get('limit') ? Number(qp.get('limit')) : this.DEFAULT_LIMIT,
      offset: qp.get('offset') ? Number(qp.get('offset')) : this.DEFAULT_OFFSET
    };

    this.get_list_filtered(this.initialFilters);
  }

  get_list_filtered(newFilters: Filters): void {
    this.loading = true;
    this.error = null;

    const combinedFilters: Filters = {
      ...this.initialFilters,
      ...newFilters
    };

    if (newFilters.category || newFilters.nombre) {
      combinedFilters.offset = 0;
    }

    combinedFilters.limit = combinedFilters.limit ?? this.DEFAULT_LIMIT;
    combinedFilters.offset = combinedFilters.offset ?? this.DEFAULT_OFFSET;

    this.initialFilters = combinedFilters;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        nombre: combinedFilters.nombre || null,
        category: combinedFilters.category || null,
        price_min: combinedFilters.price_min || null,
        price_max: combinedFilters.price_max || null,
        limit: combinedFilters.limit,
        offset: combinedFilters.offset
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    this.eventoService.list_filters(combinedFilters).subscribe({
      next: (data) => {
        this.evento = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando eventos:', err);
        this.error = 'Error al cargar los eventos';
        this.evento = [];
        this.loading = false;
      }
    });
  }

  trackByEvento(index: number, evento: Evento): string {
    return evento.slug ?? index.toString();
  }
}