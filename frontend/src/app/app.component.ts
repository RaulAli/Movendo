import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/layout/header/header.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { UserService } from './core/services/auth.service';
import { AdminService } from './core/services/admin_auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <app-header></app-header>
    <main [ngClass]="{ 'container': !isDashboardRoute }">
      <router-outlet />
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem;
    }
  `],
})
export class AppComponent implements OnInit {
  isDashboardRoute = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.userService.populate();
    this.adminService.populate();

    // Detecta la ruta actual
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isDashboardRoute = event.urlAfterRedirects.includes('/dashboard');
      });
  }
}
