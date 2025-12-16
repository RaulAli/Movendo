import { Component, OnInit, Input } from '@angular/core';
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
import { forkJoin } from 'rxjs';
import { RAGSearchResponse, RAGSearchResult } from '../../core/models/rag-search.model';

@Component({
  selector: 'list-evento',
  standalone: true,
  imports: [CommonModule, CardComponent, FiltersComponent, SearchComponent, PaginationComponent],
  templateUrl: './list-evento.component.html',
  styleUrls: ['./list-evento.component.scss']
})
export class ListComponent implements OnInit {
  @Input() evento: Evento[] = [];
  listCategories: Category[] = [];
  loading = false;
  error: string | null = null;
  filters!: Filters;

  totalItems = 0;
  currentPage = 1;

  // <-- HACERLO ACCESIBLE A LA PLANTILLA (public)
  readonly DEFAULT_LIMIT = 3;
  readonly DEFAULT_OFFSET = 0;

  // Campos para búsqueda inteligente (IA)
  intelligentSearchActive = false;
  intelligentResults: RAGSearchResult[] = [];
  currentQuery: string = '';
  searchSummary: RAGSearchResponse['summary'] | null = null;

  constructor(
    private eventoService: EventoService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    forkJoin({
      categories: this.categoryService.list({}),
      minMaxPrices: this.eventoService.getMinMaxPrices()
    }).subscribe({
      next: (results) => {
        this.listCategories = results.categories;
        const minPrice = results.minMaxPrices.minPrice;
        const maxPrice = results.minMaxPrices.maxPrice;

        const qp = this.route.snapshot.queryParamMap;
        const encodedFilters = qp.get('f');

        let initialFilters: Filters;

        if (encodedFilters) {
          try {
            const decodedString = decodeURIComponent(encodedFilters);
            initialFilters = JSON.parse(decodedString);
          } catch {
            initialFilters = this.getDefaultFilters(minPrice, maxPrice);
          }
        } else {
          initialFilters = this.getDefaultFilters(minPrice, maxPrice);
        }

        this.get_list_filtered(initialFilters);
      },
      error: (err) => {
        console.error('Error cargando datos iniciales', err);
        this.error = 'Error al cargar datos iniciales';
      }
    });
  }

  private getDefaultFilters(minPrice: number, maxPrice: number): Filters {
    const qp = this.route.snapshot.queryParamMap;
    return {
      nombre: qp.get('nombre') || undefined,
      category: qp.getAll('category').length > 0 ? qp.getAll('category') : undefined,
      price_min: qp.get('price_min') ? Number(qp.get('price_min')) : minPrice,
      price_max: qp.get('price_max') ? Number(qp.get('price_max')) : maxPrice,
      limit: qp.get('limit') ? Number(qp.get('limit')) : this.DEFAULT_LIMIT,
      offset: qp.get('offset') ? Number(qp.get('offset')) : this.DEFAULT_OFFSET,
      ciudad: qp.getAll('ciudad').length > 0 ? qp.getAll('ciudad') : undefined,
    };
  }

  get_list_filtered(newFilters: Filters): void {
    this.loading = true;
    this.error = null;

    if ((newFilters.category && newFilters.category.length > 0) || newFilters.nombre) {
      newFilters.offset = 0;
    }

    this.filters = this.filters ? { ...this.filters, ...newFilters } : newFilters;

    this.currentPage = (this.filters.offset ?? this.DEFAULT_OFFSET) / (this.filters.limit ?? this.DEFAULT_LIMIT) + 1;

    const encodedFilters = encodeURIComponent(JSON.stringify(this.filters));

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { f: encodedFilters },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    // Si hay una búsqueda inteligente activa, desactívala al cargar filtros tradicionales
    this.intelligentSearchActive = false;
    this.intelligentResults = [];
    this.currentQuery = '';
    this.searchSummary = null;

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

  // Handler para resultados del SearchComponent (búsqueda IA)
  handleIntelligentSearch(response: RAGSearchResponse): void {
    this.intelligentSearchActive = true;
    this.currentQuery = response.query;
    this.searchSummary = response.summary ?? null;
    this.intelligentResults = response.results ?? [];
    this.evento = this.intelligentResults.map(r => this.convertToEvento(r));
    this.totalItems = response.meta?.totalFound ?? this.evento.length;
    this.currentPage = 1;
    this.loading = false;
  }

  // Reinicia la vista IA y vuelve a la búsqueda tradicional paginada
  resetIntelligentSearch(): void {
    this.intelligentSearchActive = false;
    this.intelligentResults = [];
    this.currentQuery = '';
    this.searchSummary = null;
    // recargar lista según filtros actuales
    this.get_list_filtered(this.filters ?? this.getDefaultFilters(0, 99999));
  }

  onPageChange(page: number): void {
    const newOffset = (page - 1) * (this.filters.limit ?? this.DEFAULT_LIMIT);
    this.get_list_filtered({ offset: newOffset });
  }

  trackByEvento(index: number, evento: Evento): string {
    return evento.slug ?? index.toString();
  }

  // ---------- Helpers para mapear RAGSearchResult -> Evento ----------
  private toDateString(d?: Date | string): string | undefined {
    if (!d) return undefined;
    if (typeof d === 'string') return d;
    return d.toISOString();
  }

  // Ajusta fields para que coincidan con tu Evento model
  convertToEvento(result: RAGSearchResult): Evento {
    return {
      _id: result._id,
      nombre: result.nombre,
      fecha: this.toDateString(result.startDate) ?? '',
      ciudad: result.ciudad,
      category: result.category,
      slug: result.slug,
      image: Array.isArray(result.image) ? (result.image.length ? result.image[0] : undefined) : (result.image as unknown as string | undefined),
      price: result.price,
      favouritesCount: 0,
      startDate: this.toDateString(result.startDate),
      endDate: this.toDateString(result.endDate),
      isActive: true,
      status: 'PUBLISHED'
    };
  }

  // Devuelve clase CSS para el badge de relevancia (puedes adaptar los nombres de clase)
  getRelevanceColor(relevancePercentage: number): string {
    if (relevancePercentage >= 80) return 'bg-success';
    if (relevancePercentage >= 50) return 'bg-warning';
    return 'bg-secondary';
  }
}
