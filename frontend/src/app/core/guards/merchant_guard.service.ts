import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoleService } from '../services/role.service';

@Injectable({
  providedIn: 'root'
})
export class MerchantGuard implements CanActivate {

  constructor(private roleService: RoleService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.roleService.currentRole === 'merchant') {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
