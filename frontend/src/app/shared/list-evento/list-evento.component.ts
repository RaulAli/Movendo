import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../core/models/evento.model';
import { CardComponent } from '../card-evento/card-evento.component';

@Component({
  selector: 'list-evento',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './list-evento.component.html',
  styleUrls: ['./list-evento.component.scss']
})
export class ListComponent implements OnInit {

  evento: Evento[] = [];
  loading = false;
  error: string | null = null;
  editing: Evento | null = null;
  slug_Category!: string | null;

  constructor(
    private eventoService: EventoService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.slug_Category = this.route.snapshot.paramMap.get('slug');

    if (this.slug_Category !== null) { // Salto home al shop con categorys

      this.get_evento_by_cat();

    } else {

      this.loadEvento();
    }
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
        this.error = 'Error cargando eventoos';
        this.loading = false;
      }
    });
  }

  trackByEvento(index: number, evento: Evento): string {
    return evento.slug ?? index.toString();
  }

}
