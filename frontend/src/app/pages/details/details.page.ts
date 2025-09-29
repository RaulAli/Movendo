// pages/details/details.page.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { Evento } from '../../core/models/evento.model';
import { EventoService } from '../../core/services/evento.service';

@Component({
  selector: 'details-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss']
})
export class DetailsPage {
  private route = inject(ActivatedRoute);
  private svc = inject(EventoService);

  evento$ = this.route.paramMap.pipe(
    switchMap(params => this.svc.get(params.get('slug') ?? ''))
  );
}
