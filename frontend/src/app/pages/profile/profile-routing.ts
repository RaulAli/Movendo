// src/app/pages/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { ProfilePage } from './profile.page';
import { AuthGuard } from '../../core/guards';
export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfilePage,
    canActivate: [AuthGuard]
  },
];