import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="brand">
          <h1>CRP.</h1>
          <p>Campus Recruitment Platform</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="input-group">
            <label for="email">Email address</label>
            <input id="email" type="email" formControlName="email" placeholder="name@domain.com" autocomplete="email" />
          </div>

          <div class="input-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
          </div>

          @if (error) { <div class="error-banner">{{ error }}</div> }

          <button type="submit" class="btn-primary" [disabled]="loading || form.invalid">
            {{ loading ? 'Authenticating...' : 'Sign in' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Partner company? <a routerLink="/company-register">Apply to recruit</a></p>
          <p class="student-note">Students: Use the credentials provided by the Placement Cell.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: grid;
      place-items: center;
      background-color: #000000;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .auth-container {
      width: 100%;
      max-width: 400px;
      padding: 3rem 2.5rem;
      background: #0a0a0a;
      border: 1px solid #222222;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }
    .brand {
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .brand h1 {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.05em;
      margin: 0 0 0.2rem 0;
      color: #ffffff;
    }
    .brand p {
      font-size: 0.85rem;
      color: #888888;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .input-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #aaaaaa;
    }
    input {
      width: 100%;
      padding: 0.85rem 1rem;
      background: #000000;
      border: 1px solid #333333;
      border-radius: 6px;
      color: #ffffff;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #ffffff;
      box-shadow: 0 0 0 1px #ffffff;
    }
    input::placeholder {
      color: #444444;
    }
    .btn-primary {
      width: 100%;
      padding: 0.9rem;
      background: #ffffff;
      color: #000000;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }
    .btn-primary:hover:not([disabled]) {
      background: #dddddd;
    }
    .btn-primary[disabled] {
      background: #333333;
      color: #666666;
      cursor: not-allowed;
    }
    .error-banner {
      background: #2a0a0a;
      border: 1px solid #5a1a1a;
      color: #ff6b6b;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .auth-footer {
      margin-top: 2.5rem;
      text-align: center;
      border-top: 1px solid #222222;
      padding-top: 1.5rem;
    }
    .auth-footer p {
      font-size: 0.85rem;
      color: #888888;
      margin: 0.5rem 0;
    }
    .auth-footer a {
      color: #ffffff;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .auth-footer a:hover {
      text-decoration: underline;
    }
    .student-note {
      font-size: 0.75rem !important;
      color: #555555 !important;
      margin-top: 1rem !important;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = '';
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    
    const { email, password } = this.form.getRawValue();
    
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate([this.auth.homeRoute()]),
      error: () => {
        this.error = 'Invalid email or password. Please verify your credentials.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}