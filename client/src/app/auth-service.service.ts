import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../service/modal/modalService';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  private getToken(): string | null {
    // Extrahieren Sie den JWT aus dem Cookie
    const name = 'jwt-token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }
}
