import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { map } from 'rxjs/operators';
import { RoleService } from './role.service';

interface Admin {
  id: string;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private roleService: RoleService
  ) { }

  populate() {
    const token = this.jwtService.getToken();
    if (token) {
      const decodedToken = this.jwtService.getDecodedToken();
      if (decodedToken && decodedToken.role == "admin") {
        this.roleService.checkRole();
      } else if (decodedToken && decodedToken.role != "admin") {

      } else {
        this.logout();
      }
    }
  }

  attemptAuth(type: string, credentials: any): Observable<{ token: string }> {
    const route = type === 'login' ? '/admins/login' : '/admins';

    return this.apiService.post(route, credentials, 3002).pipe(
      map((data: any) => {
        if (data.token) {
          this.jwtService.saveToken(data.token);
          this.roleService.checkRole();
        }
        return data;
      })
    );
  }

  logout(): void {
    this.jwtService.destroyToken();
    this.roleService.checkRole();
  }
}
