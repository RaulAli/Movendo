import { Routes } from '@angular/router';
import { AdminAuthPage } from './admin_auth.page';
import { AdminGuard } from '../../core/guards/admin_guard.service';
import { AdminDashboardComponent } from '../admin_dashboard/admin_dashboard.component';

export const AdminAuthRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    component: AdminAuthPage,
    data: {
      title: 'Admin Login'
    }
  },
  {
    path: 'register',
    component: AdminAuthPage,
    data: {
      title: 'Admin Register'
    }
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    data: {
      title: 'Admin Dashboard'
    }
  }
];
