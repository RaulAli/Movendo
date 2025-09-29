// // src/app/pages/details/details-resolver.service.ts
// import { Injectable, inject } from '@angular/core';
// import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
// import { Observable } from 'rxjs';
// import { Evento } from '../../core/models/evento.model';
// import { EventoService } from '../../core/services/evento.service';

// @Injectable({ providedIn: 'root' })
// export class DetailsResolver implements Resolve<Evento> {
//     private svc = inject(EventoService);

//     resolve(route: ActivatedRouteSnapshot): Observable<Evento> {
//         const slug = route.paramMap.get('slug') ?? '';
//         return this.svc.get(slug);
//     }
// }
