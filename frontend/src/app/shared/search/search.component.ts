import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Filters } from '../../core/models/filters.model';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../core/models/evento.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class SearchComponent implements OnInit {
  @Output() searchEvent: EventEmitter<Filters> = new EventEmitter();

  search_value: string | undefined = '';

  listEventos: Evento[] = [];
  filters: Filters = new Filters();
  private search: string = '';

  constructor(
    private EventoService: EventoService,
    private Router: Router,
    private ActivatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const qp = this.ActivatedRoute.snapshot.queryParamMap;
    const nombre = qp.get('nombre');
    const offset = qp.get('offset');

    if (nombre) {
      this.filters.nombre = this.toSlug(nombre);
    }

    if (offset) this.filters.offset = Number(offset) || 0;

    this.ActivatedRoute.queryParams.subscribe(params => {
      if (params['nombre'] !== undefined) {
        this.filters.nombre = this.toSlug(params['nombre']);
      }
      if (params['offset'] !== undefined) {
        this.filters.offset = Number(params['offset']) || 0;
      }
    });
  }

  private toSlug(input: string): string {
    return String(input || '')
      .trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public type_event(writtingValue: any): void {
    this.search = String(writtingValue || '');
    this.search_value = this.search;

    this.filters.nombre = this.toSlug(this.search);
    this.filters.offset = 0;

    setTimeout(() => {
      this.searchEvent.emit(this.filters);

      this.Router.navigate(['/shop'], {
        queryParams: this.filters,
        replaceUrl: true
      });

      if (this.filters.nombre && this.filters.nombre.length !== 0) {
        this.getListEventos();
      }
    }, 150);
  }

  getListEventos() {
    const q = (this.filters.nombre || '').trim();
    if (!q) {
      this.listEventos = [];
      return;
    }

    this.EventoService.find_product_nombre(q).subscribe(
      (data: any) => {
        this.listEventos = data?.eventos || [];
      },
      (err) => {
        console.error('Error getListEventos', err);
        this.listEventos = [];
      }
    );
  }

  public search_event(value: string | undefined): void {
    if (typeof value === 'string') {
      this.search_value = value;

      this.filters.nombre = this.toSlug(value);
      this.filters.offset = 0;

      this.Router.navigate(['/shop'], {
        queryParams: this.filters,
        replaceUrl: true
      });
    }
  }
}
