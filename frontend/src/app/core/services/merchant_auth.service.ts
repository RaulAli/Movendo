import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { map } from 'rxjs/operators';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root',
})
export class AuthMerchantService {
  constructor(
    private apiService: ApiService,
    private jwtService: JwtService,
    private roleService: RoleService
  ) {
    this.populate();
  }

  populate() {
    const token = this.jwtService.getToken();
    if (token) {
      const decodedToken = this.jwtService.getDecodedToken();
      if (decodedToken && decodedToken.role === 'merchant') {
        this.roleService.checkRole();
      }
    }
  }

  attemptAuth(type: string, credentials: any): Observable<{ accessToken: string, refreshToken: string }> {
    const route = type === 'login' ? '/merchant/login' : '/merchant/register';

            return this.apiService.post(route, credentials).pipe(
                map((data: any) => {
                    console.log('AuthMerchantService: Response data from backend:', data); // Added for debugging
                    if (data.accessToken) {
                        this.jwtService.saveToken(data.accessToken);
                        this.roleService.checkRole();
                    }
                    return data;
                })
            );  }

  logout(): void {
    this.jwtService.destroyToken();
    this.roleService.checkRole();
  }
}
