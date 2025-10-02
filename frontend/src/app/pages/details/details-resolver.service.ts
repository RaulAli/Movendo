import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EventoService } from '../../core/services/evento.service';
import { Evento } from '../../core/models/evento.model';

export const detailsResolver: ResolveFn<Evento | null> = (route) => {
    const svc = inject(EventoService);
    const router = inject(Router);
    const slug = route.paramMap.get('slug');

    if (!slug) {
        router.navigate(['/not-found']);
        return of(null);
    }

    return svc.get(slug).pipe(
        map(ev => ev ?? null),
        catchError(() => {
            // puedes redirigir si prefieres
            // router.navigate(['/not-found']);
            return of(null);
        })
    );
};
