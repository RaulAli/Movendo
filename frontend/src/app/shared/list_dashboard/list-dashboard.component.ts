import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Evento } from '../../core/models/evento.model';
import { EventoService } from '../../core/services/evento.service';

@Component({
    selector: 'list-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './list-dashboard.component.html',
    styleUrls: ['./list-dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ListDashboardComponent implements OnInit {
    constructor(private eventoService: EventoService) { }

    evento: Evento[] = [];
    menuItems = ['Main', 'Events', 'Clients', 'Merchan'];
    selectedMenuItem = 'Main';
    contenidoHTML = '';

    cards = [
        {
            title: 'Resumen General',
            content: 'Vista general de todas las métricas y estadísticas importantes del sistema.'
        },
        {
            title: 'Eventos Recientes',
            content: 'Lista de los últimos eventos creados y su estado actual.'
        },
        {
            title: 'Clientes Activos',
            content: 'Información sobre los clientes activos en la plataforma.'
        },
        {
            title: 'Inventario Merchan',
            content: 'Control de stock y productos de merchandising disponibles.'
        }
    ];

    ngOnInit(): void {
        this.Cargar_MenuItem();
    }

    selectMenuItem(item: string) {
        this.selectedMenuItem = item;
        this.Cargar_MenuItem();
    }

    Cargar_MenuItem() {
        switch (this.selectedMenuItem) {
            case 'Main':
                this.contenidoHTML = `
          <div class="dashboard-grid">
            ${this.cards
                        .map(
                            (card, i) => `
                <div class="card">
                  <div class="card-header">
                    <h3>${card.title}</h3>
                    <span class="card-badge">${i + 1}</span>
                  </div>
                  <p>${card.content}</p>
                  <div class="card-footer">
                    <button class="card-btn">Ver más</button>
                  </div>
                </div>
              `
                        )
                        .join('')}
          </div>
        `;
                break;

            case 'Events':
                this.eventoService.list().subscribe({
                    next: (eventos: Evento[]) => {
                        this.evento = eventos ?? [];

                        if (this.evento.length === 0) {
                            this.contenidoHTML = `<p>No hay eventos disponibles.</p>`;
                            return;
                        }

                        this.contenidoHTML = `
              <div class="event-grid">
                <h2>Lista de Eventos (${this.evento.length})</h2>
                <div class="event-grid-header">
                  <span>Nombre</span>
                  <span>Ciudad</span>
                  <span>Categoría</span>
                  <span>Precio</span>
                  <span>Acciones</span>
                </div>

                ${this.evento
                                .map(
                                    (e) => `
                    <div class="event-grid-row">
                      <span>${e.nombre || 'Sin nombre'}</span>
                      <span>${e.ciudad || 'Sin ciudad'}</span>
                      <span>${e.category || 'Sin categoría'}</span>
                      <span>${e.price ? '$' + e.price : 'No definido'}</span>
                      <span>
                        <button class="btn-delete">Delete</button>
                        <button class="btn-edit">Editar Status</button>
                      </span>
                    </div>
                  `
                                )
                                .join('')}
              </div>
            `;
                    },
                    error: (err) => {
                        console.error('Error cargando eventos:', err);
                        this.contenidoHTML = `<p>Error cargando eventos.</p>`;
                    }
                });
                break;

            case 'Clients':
                this.contenidoHTML = '';
                break;

            case 'Merchan':
                this.contenidoHTML = '';
                break;

            default:
                this.contenidoHTML = '';
                break;
        }
    }
}
