import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Evento } from '../../core/models/evento.model';
import { EventoService } from '../../core/services/evento.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'list-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
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
    editingEvento: Evento | null = null;

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
        this.editingEvento = { ...evento };
    }

    onSave(evento: Evento) {
        console.log("hola");
        if (evento.slug) {
            console.log(evento.slug);
            const { nombre, ciudad, category, price, isActive } = evento;
            const updatedData = { nombre, ciudad, category, price, isActive };

            this.eventoService.update(evento.slug, updatedData).subscribe({
                next: (data) => {
                    const index = this.eventos.findIndex(e => e.slug === evento.slug);
                    if (index !== -1) {
                        this.eventos[index] = data;
                    }
                    this.editingEvento = null;
                },
                error: (err) => console.error('Error actualizando evento', err)
            });
        }
    }

    onCancel() {
        this.editingEvento = null;
    }

    onDelete(evento: Evento) {
        if (evento.slug && confirm(`¿Estás seguro de que quieres eliminar el evento "${evento.nombre}"?`)) {
            this.eventoService.delete(evento.slug).subscribe({
                next: () => {
                    this.eventos = this.eventos.filter(e => e.slug !== evento.slug);
                },
                error: (err) => console.error('Error eliminando evento', err)
            });
        }
    }
}
