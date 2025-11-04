import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/layout/header/header.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { UserService } from './core/services/auth.service';
import { AdminService } from './core/services/admin_auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main class="container"><router-outlet /></main>
    <app-footer></app-footer>
  `,
  styles: [`.container{max-width:1100px;margin:0 auto;padding:1rem;}`],
})
export class AppComponent implements OnInit {
  constructor(private userService: UserService, private adminService: AdminService) {}

  ngOnInit() {
    this.userService.populate();
    this.adminService.populate();
  }
}
