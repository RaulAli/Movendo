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
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'list-evento',
  standalone: true,
  imports: [CommonModule, CardComponent, FiltersComponent, SearchComponent, PaginationComponent],
  templateUrl: './list-evento.component.html',
  styleUrls: ['./list-evento.component.scss']
})
export class ListComponent implements OnInit {

  evento: Evento[] = [];
  listCategories: Category[] = [];
  loading = false;
  error: string | null = null;
  filters!: Filters;

  totalItems = 0;
  currentPage = 1;

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

    const initialFilters: Filters = {
      nombre: qp.get('nombre') || undefined,
      category: qp.get('category') || undefined,
      price_min: qp.get('price_min') ? Number(qp.get('price_min')) : undefined,
      price_max: qp.get('price_max') ? Number(qp.get('price_max')) : undefined,
      limit: qp.get('limit') ? Number(qp.get('limit')) : this.DEFAULT_LIMIT,
      offset: qp.get('offset') ? Number(qp.get('offset')) : this.DEFAULT_OFFSET
    };

    this.get_list_filtered(initialFilters);
  }

  get_list_filtered(newFilters: Filters): void {
    this.loading = true;
    this.error = null;

    // Reset offset if category or name filters are applied
    if (newFilters.category || newFilters.nombre) {
      newFilters.offset = 0;
    }

    this.filters = this.filters ? { ...this.filters, ...newFilters } : newFilters;

    this.currentPage = (this.filters.offset ?? this.DEFAULT_OFFSET) / (this.filters.limit ?? this.DEFAULT_LIMIT) + 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filters,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    this.eventoService.list_filters(this.filters).subscribe({
      next: (data) => {
        this.evento = data.data;
        this.totalItems = data.total;
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

  onPageChange(page: number): void {
    const newOffset = (page - 1) * (this.filters.limit ?? this.DEFAULT_LIMIT);
    this.get_list_filtered({ offset: newOffset });
  }

  trackByEvento(index: number, evento: Evento): string {
    return evento.slug ?? index.toString();
  }
}