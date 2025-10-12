import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Filters } from '../../core/models/filters.model';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../core/models/evento.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SearchComponent implements OnInit {
  @Output() searchEvent: EventEmitter<Filters> = new EventEmitter();

  search_value: string = '';
  listEventos: Evento[] = [];

  constructor(
    private eventoService: EventoService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.search_value = this.route.snapshot.queryParamMap.get('nombre') || '';
  }

  onInput(): void {
    const query = this.search_value.trim();
    if (query.length > 2) {
      this.getAutocompleteSuggestions(query);
    } else {
      this.listEventos = [];
    }
  }

  emitSearch(): void {
    const filters: Filters = {
      nombre: this.search_value.trim() || undefined,
      offset: 0
    };
    this.searchEvent.emit(filters);
    this.listEventos = [];
  }

  private getAutocompleteSuggestions(query: string): void {
    const filters: Filters = { nombre: query, limit: 5 };

    this.eventoService.list_filters(filters).subscribe({
      next: (eventos) => {
        this.listEventos = eventos;
      },
      error: (err) => {
        console.error('Error fetching autocomplete suggestions', err);
        this.listEventos = [];
      }
    });
  }
}