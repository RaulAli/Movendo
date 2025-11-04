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

    menuItems = ['Main', 'Events', 'Clients', 'Merchan'];
    selectedMenuItem = 'Main';

    // Datos dinámicos
    cards: any[] = [];
    eventos: Evento[] = [];
    contenidoDB: any = {};

    ngOnInit(): void {
        this.loadContentFromDB();
    }

    loadContentFromDB() {
        this.contenidoDB = {
            Main: [
                { title: 'Resumen General', content: 'Métricas importantes del sistema' },
                { title: 'Eventos Recientes', content: 'Últimos eventos creados' },
                { title: 'Clientes Activos', content: 'Clientes activos' },
                { title: 'Inventario Merchan', content: 'Stock disponible' }
            ],
            Events: 'api',
            Clients: [],
            Merchan: []
        };

        this.Cargar_MenuItem();
    }

    selectMenuItem(item: string) {
        this.selectedMenuItem = item;
        this.Cargar_MenuItem();
    }

    Cargar_MenuItem() {
        switch (this.selectedMenuItem) {
            case 'Main':
                this.cards = this.contenidoDB['Main'] ?? [];
                break;

            case 'Events':
                this.eventos = [];
                this.eventoService.list().subscribe({
                    next: (data) => (this.eventos = data ?? []),
                    error: (err) => console.error('Error cargando eventos', err)
                });
                break;

            case 'Clients':
                break;

            case 'Merchan':
                break;
        }
    }

    onVerMas(card: any) {
        console.log('Ver más de:', card);
    }

    onEdit(evento: Evento) {
        console.log('Editar evento:', evento);
    }

    onDelete(evento: Evento) {
        console.log('Eliminar evento:', evento);
    }
}
