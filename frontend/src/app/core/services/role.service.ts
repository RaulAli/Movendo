import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JwtService } from './jwt.service';

export type UserRole = 'admin' | 'client' | 'guest';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private roleSubject = new BehaviorSubject<UserRole>('guest');
  public role$ = this.roleSubject.asObservable();

  constructor(private jwtService: JwtService) {
    this.checkRole();
  }

  checkRole() {
    const decodedToken = this.jwtService.getDecodedToken();
    if (decodedToken) {
      if (decodedToken.isAdmin) {
        this.roleSubject.next('admin');
      } else {
        this.roleSubject.next('client');
      }
    } else {
      this.roleSubject.next('guest');
    }
  }

  get currentRole(): UserRole {
    return this.roleSubject.value;
  }
}
