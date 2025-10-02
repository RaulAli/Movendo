import { Routes } from '@angular/router';
import { DetailsPage } from './details.page';
import { detailsResolver } from './details-resolver.service';

export const DETAILS_ROUTES: Routes = [
    {
        path: ':slug',
        component: DetailsPage,
        resolve: { evento: detailsResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        title: 'Detalles del evento'
    }
];
