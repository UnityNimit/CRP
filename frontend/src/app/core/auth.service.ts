import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginResponse, MeResponse } from '../models';

const TOKEN_KEY = 'campus_token';
const ROLE_KEY = 'campus_role';
const NAME_KEY = 'campus_name';

// Pointing directly to your live production backend
const API_URL = 'https://crp-b2xa.onrender.com/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<MeResponse | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(ROLE_KEY, res.role);
        localStorage.setItem(NAME_KEY, res.displayName);
      })
    );
  }

  loadMe() {
    return this.http.get<MeResponse>(`${API_URL}/auth/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  get token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  get role() {
    return localStorage.getItem(ROLE_KEY) as 'COMPANY' | 'STUDENT' | 'ADMIN' | null;
  }

  get displayName() {
    return localStorage.getItem(NAME_KEY);
  }

  isLoggedIn() {
    return !!this.token;
  }

  homeRoute() {
    const role = this.role;
    if (role === 'COMPANY') return '/company';
    if (role === 'STUDENT') return '/student';
    if (role === 'ADMIN') return '/admin';
    return '/login';
  }
}