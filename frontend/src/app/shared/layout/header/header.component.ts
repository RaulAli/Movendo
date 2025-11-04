import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/auth.service';
import { JwtService } from '../../../core/services/jwt.service';
import { RoleService, UserRole } from '../../../core/services/role.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  role: UserRole = 'guest';
  user: any;
  private subscription!: Subscription;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private roleService: RoleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subscription = this.roleService.role$.subscribe((newRole) => {
      this.role = newRole;

      if (newRole === 'client') {
        this.user = this.userService.getCurrentUser();
      } else {
        this.user = null;
      }

      console.log('🧭 Rol actualizado:', newRole);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  logout() {
    this.jwtService.destroyToken();
    this.roleService.checkRole();
    this.router.navigate(['/login']);
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }
}
