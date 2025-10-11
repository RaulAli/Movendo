import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../core/services/evento.service';
import { CategoryService } from '../../core/services/category.service';
import { Evento } from '../../core/models/evento.model';
import { Category } from '../../core/models/category.model';
import { CardComponent } from '../card-evento/card-evento.component';
import { FiltersComponent, EventoFilters } from '../filters/filters.component';
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
  slug_Category!: string | null;
  initialFilters: EventoFilters | null = null;
  initialFiltersSearch: Filters | null = null;

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

    this.slug_Category = this.route.snapshot.paramMap.get('slug');

    const qp = this.route.snapshot.queryParamMap;
    this.initialFilters = {
      category: qp.get('category') || '',
      price_min: qp.get('price_min') ? Number(qp.get('price_min')) : null,
      price_max: qp.get('price_max') ? Number(qp.get('price_max')) : null
    };

    if (this.initialFilters.category || this.initialFilters.price_min || this.initialFilters.price_max) {
      this.get_list_filtered(this.initialFilters);
    } else if (this.slug_Category) {
      this.get_evento_by_cat();
    } else {
      this.loadEvento();
    }
  }

  get_list_filtered(filters: EventoFilters): void {
    this.loading = true;
    this.error = null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: filters.category || null,
        price_min: filters.price_min || null,
        price_max: filters.price_max || null
      },
      queryParamsHandling: 'merge'
    });

    this.eventoService.list_filters(filters).subscribe({
      next: (data) => {
        this.evento = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error cargando eventos filtrados';
        this.loading = false;
      }
    });
  }

  get_list_filtered_search(filters: Filters): void {
    this.loading = true;
    this.error = null;
    console.log('ListComponent.get_list_filtered_search - recibido:', filters);

    // Actualizar query params con 'nombre' (merge para mantener otros params)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        nombre: filters.nombre || null,
        offset: filters.offset || null
      },
      queryParamsHandling: 'merge'
    });

    const nombreToSend = (filters.nombre || '').trim().toLowerCase();
    if (!nombreToSend) {
      // si no hay nombre, recargar lista general
      this.loadEvento();
      return;
    }

    console.log('ListComponent.get_list_filtered_search - llamando a find_product_nombre("' + nombreToSend + '")');

    this.eventoService.find_product_nombre(nombreToSend).subscribe({
      next: (data: any) => {
        console.log('ListComponent.get_list_filtered_search - respuesta del servidor:', data);
        // soporte para dos formatos de respuesta:
        if (Array.isArray(data)) {
          this.evento = data;
        } else if (Array.isArray(data?.eventos)) {
          this.evento = data.eventos;
        } else {
          // si backend devuelve { data: { eventos: [...] } } o distinto, ajusta aquí
          this.evento = [];
        }
        console.log('ListComponent.get_list_filtered_search - eventos asignados:', this.evento.length);
        if (this.evento.length) console.table(this.evento);
        this.loading = false;
      },
      error: (err) => {
        console.error('ListComponent.get_list_filtered_search - error:', err);
        this.error = 'Error cargando eventos por búsqueda';
        this.loading = false;
      }
    });
  }

  get_evento_by_cat(): void {
    this.loading = true;
    this.error = null;

    if (this.slug_Category) {
      this.eventoService.getEventoByCategory(this.slug_Category).subscribe({
        next: (eventos) => {
          this.evento = eventos;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error cargando eventos';
          this.loading = false;
        }
      });
    }
  }

  loadEvento(): void {
    this.loading = true;
    this.error = null;

    this.eventoService.list().subscribe({
      next: data => {
        this.evento = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Error cargando eventos';
        this.loading = false;
      }
    });
  }

  trackByEvento(index: number, evento: Evento): string {
    return evento.slug ?? index.toString();
  }
}
