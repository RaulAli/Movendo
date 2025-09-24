import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProdService } from '../../core/services/prod.service';
import { Prod } from '../../models/prod.model';
import { CardComponent } from '../event-card/prod-card.component';

@Component({
  selector: 'prod-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  prods: Prod[] = [];
  loading = false;
  error: string | null = null;
  editing: Prod | null = null;

  constructor(
    private prodService: ProdService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // console.log('ListComponent inicializado');
    this.loadProds();
  }

  loadProds(): void {
    // console.log('Cargando productos...'); 
    this.loading = true;
    this.error = null;

    this.prodService.list().subscribe({
      next: data => {
        // console.log('Datos recibidos del servicio:', data);
        this.prods = data;
        this.loading = false;
        // console.log('Productos cargados en componente:', this.prods);
      },
      error: err => {
        // console.error('Error al cargar productos:', err);
        this.error = 'Error cargando productos';
        this.loading = false;
      }
    });
  }

  trackByProd(index: number, prod: Prod): string {
    // console.log('trackByProd:', prod);
    return prod.slug ?? index.toString();
  }

  onEdit(prod: Prod): void {
    console.log('Editar producto:', prod);
  }

  onRemove(slug: string | undefined): void {
    console.log('Intento de eliminar slug:', slug);

    if (!slug) {
      console.error('El prod no tiene slug válido.');
      return;
    }

    if (confirm('¿Seguro que quieres eliminar este producto?')) {
      this.prodService.delete(slug).subscribe({
        next: () => {
          console.log('Producto eliminado correctamente:', slug);
          this.loadProds();
        },
        error: err => {
          console.error('No se pudo eliminar el producto:', err);
        }
      });
    }
  }

}
