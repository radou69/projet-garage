import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
interface LoginResponse {
  token: string;
}
interface RegisterPayload {
  nom: string;
  email: string;
  mot_de_passe: string;
  nom_garage: string;
  adresse_garage: string;
}
interface RegisterResponse {
  message: string;
  id: number;
}
interface JwtPayload {
  roles: string[];
  username: string;
  exp: number;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://127.0.0.1:8000/api';
  constructor(private http: HttpClient) {}
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login_check`, {
      username: email,
      password: password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }
  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, payload);
  }
  logout(): void {
    localStorage.removeItem('token');
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
  // Décode le payload du token JWT (partie centrale, base64url) sans vérifier la signature
  // — la signature est de toute façon vérifiée côté serveur à chaque requête protégée.
  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
  isPatron(): boolean {
    const payload = this.getPayload();
    return !!payload && payload.roles.includes('ROLE_PATRON');
  }
  getUsername(): string | null {
    return this.getPayload()?.username ?? null;
  }
}
