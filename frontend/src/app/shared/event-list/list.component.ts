import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProdService } from '../../core/services/prod.service';
import { Prod } from '../../core/models/prod.model';
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
    this.loadProds();
  }

  loadProds(): void {
    this.loading = true;
    this.error = null;

    this.prodService.list().subscribe({
      next: data => {
        this.prods = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Error cargando productos';
        this.loading = false;
      }
    });
  }

  trackByProd(index: number, prod: Prod): string {
    return prod.slug ?? index.toString();
  }

}
