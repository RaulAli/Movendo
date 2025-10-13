import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) { }

  canActivate(): boolean {
    const user = this.userService.getCurrentUser();
    if (user && (user.token || Object.keys(user).length > 0)) {
      return true;
    }
    this.router.navigate(['/auth/login']);
    return false;
  }
}
