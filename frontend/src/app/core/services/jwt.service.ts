import { Injectable } from '@angular/core';

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
}
