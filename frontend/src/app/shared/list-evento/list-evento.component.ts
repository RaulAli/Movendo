import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  constructor(
    private prodService: EventoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEvento();
  }

  loadEvento(): void {
    this.loading = true;
    this.error = null;

    this.prodService.list().subscribe({
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
