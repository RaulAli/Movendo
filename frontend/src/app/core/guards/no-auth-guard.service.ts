// no-auth-guard.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.jwtService.getToken();

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken?.id;

        if (userId) {
          this.router.navigateByUrl('/home');
          return false;
        }
      } catch (error) {
        console.error('Error decodificando el token:', error);
      }
    }

    return true;
  }
}