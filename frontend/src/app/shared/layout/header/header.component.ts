import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/auth.service';
import { JwtService } from '../../../core/services/jwt.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  logged = false;
  user: any;
  private subscription!: Subscription;

  constructor(
    private userService: UserService,
    private JwtService: JwtService,
    private router: Router) { }

  ngOnInit() {
    this.subscription = this.userService.isAuthenticated.subscribe((auth) => {
      this.logged = auth;
      if (auth) {
        this.loadDataUser();
      } else {
        this.user = null;
      }
      console.log(auth);
    });
  }

  loadDataUser() {
    this.user = this.userService.getCurrentUser();
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.JwtService.destroyToken();
    this.userService.logout()
    this.router.navigate(['/login']);
    window.location.reload();
  }
}
