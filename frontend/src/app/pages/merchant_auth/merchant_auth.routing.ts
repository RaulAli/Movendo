import { Routes } from '@angular/router';
import { AuthMerchantPage } from './merchant_auth.page';
import { MerchantGuard } from '../../core/guards/merchant_guard.service';
import { DashboardComponentMerch } from '../merchant_dashboard/merch_dashboard.component';

export const AuthMerchantRoutes: Routes = [
  {
    path: 'login',
    component: AuthMerchantPage,
    data: {
      title: 'Merchant Login'
    }
  },
  {
    path: 'register',
    component: AuthMerchantPage,
    data: {
      title: 'Merchant Register'
    }
  },
  {
    path: 'dashboard',
    component: DashboardComponentMerch,
    canActivate: [MerchantGuard],
    data: {
      title: 'Merchant Dashboard'
    }
  }
];
