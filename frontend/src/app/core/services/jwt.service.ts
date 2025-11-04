import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  getToken(): string | null {
    return window.localStorage.getItem('accessToken');
  }

  saveToken(accessToken: string) {
    window.localStorage.setItem('accessToken', accessToken);
  }

  destroyToken() {
    window.localStorage.removeItem('accessToken');
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (Error) {
        return null;
      }
    }
    return null;
  }
}
