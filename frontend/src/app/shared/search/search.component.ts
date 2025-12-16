import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../core/models/evento.model';
import { Filters } from '../../core/models/filters.model';
import { RAGSearchResponse, IntelligentAutocomplete } from '../../core/models/rag-search.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() searchEvent: EventEmitter<Filters> = new EventEmitter();
  @Output() intelligentSearchEvent: EventEmitter<RAGSearchResponse> = new EventEmitter();

  searchValue: string = '';
  listEventos: Evento[] = [];
  suggestions: any[] = [];
  loading: boolean = false;
  showSuggestions: boolean = false;
  useIntelligentSearch: boolean = true; // Por defecto usar IA

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private eventoService: EventoService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.searchValue = this.route.snapshot.queryParamMap.get('nombre') || '';

    // Configurar debounce para autocomplete
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.onSearchInput(query);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(): void {
    this.searchSubject.next(this.searchValue.trim());
  }

  onSearchInput(query: string): void {
    if (query.length >= 2) {
      if (this.useIntelligentSearch) {
        this.getIntelligentSuggestions(query);
      } else {
        this.getTraditionalSuggestions(query);
      }
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  emitSearch(): void {
    const query = this.searchValue.trim();

    if (!query) return;

    if (this.useIntelligentSearch) {
      this.performIntelligentSearch(query);
    } else {
      this.performTraditionalSearch(query);
    }

    this.suggestions = [];
    this.showSuggestions = false;
  }

  performTraditionalSearch(query: string): void {
    const filters: Filters = {
      nombre: query,
      offset: 0
    };

    // Navegar con query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { nombre: query },
      queryParamsHandling: 'merge'
    });

    this.searchEvent.emit(filters);
  }

  performIntelligentSearch(query: string): void {
    this.loading = true;

    this.eventoService.intelligentSearch(query).subscribe({
      next: (response) => {
        this.loading = false;
        this.intelligentSearchEvent.emit(response);

        // También podemos navegar con un indicador de búsqueda IA
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            q: query,
            ai: 'true'
          },
          queryParamsHandling: 'merge'
        });
      },
      error: (err) => {
        console.error('Error en búsqueda inteligente:', err);
        this.loading = false;
        // Fallback a búsqueda tradicional
        this.performTraditionalSearch(query);
      }
    });
  }

  getTraditionalSuggestions(query: string): void {
    const filters: Filters = { nombre: query, limit: 5 };

    this.eventoService.list_filters(filters).subscribe({
      next: (eventos) => {
        this.suggestions = eventos.data.map(e => ({
          type: 'event',
          nombre: e.nombre,
          ciudad: e.ciudad,
          category: e.category,
          slug: e.slug,
          image: e.image?.[0]
        }));
        this.showSuggestions = true;
      },
      error: (err) => {
        console.error('Error obteniendo sugerencias:', err);
        this.suggestions = [];
      }
    });
  }

  getIntelligentSuggestions(query: string): void {
    this.eventoService.intelligentAutocomplete(query).subscribe({
      next: (response) => {
        this.suggestions = [
          ...response.suggestions,
          ...(response.suggestedQueries || [])
        ];
        this.showSuggestions = true;
      },
      error: (err) => {
        console.error('Error obteniendo sugerencias inteligentes:', err);
        this.getTraditionalSuggestions(query);
      }
    });
  }

  selectSuggestion(suggestion: any): void {
    if (suggestion.type === 'event') {
      // Navegar al evento
      this.router.navigate(['/eventos', suggestion.slug]);
    } else if (suggestion.type === 'query') {
      // Usar la consulta sugerida
      this.searchValue = suggestion.text;
      this.emitSearch();
    }
    this.suggestions = [];
    this.showSuggestions = false;
  }

  toggleSearchMode(): void {
    this.useIntelligentSearch = !this.useIntelligentSearch;
    this.suggestions = [];
    this.showSuggestions = false;

    // Si hay texto, buscar inmediatamente
    if (this.searchValue.trim().length >= 2) {
      this.onSearchInput(this.searchValue.trim());
    }
  }

  clearSearch(): void {
    this.searchValue = '';
    this.suggestions = [];
    this.showSuggestions = false;

    // Limpiar query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { nombre: null, q: null, ai: null },
      queryParamsHandling: 'merge'
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  // dentro de SearchComponent class
  getExampleQueries(): string[] {
    return [
      'Eventos de música en Barcelona este fin de semana',
      'Mercado gastronómico Madrid sábado',
      'Teatro infantil Valencia julio',
      'Concierto rock cerca de mí',
      'Planes gratuitos en Sevilla'
    ];
  }

}