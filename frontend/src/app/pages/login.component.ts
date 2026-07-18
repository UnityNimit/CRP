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
      <div class="auth-card">
        <!-- Left Side: Image -->
        <div class="auth-image"></div>
        
        <!-- Right Side: Form -->
        <div class="auth-content">
          <div class="brand">
            <h1>Campus Recruiting Portal</h1>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
            <div class="input-group">
              <label for="email">Email address</label>
              <input id="email" type="email" formControlName="email" placeholder="name@university.edu" autocomplete="email" />
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
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout { min-height: 100vh; display: grid; place-items: center; background-color: var(--color-bg); padding: 2rem; font-family: var(--font-display); }
    
    .auth-card { display: flex; width: 100%; max-width: 1000px; min-height: 550px; background: var(--color-panel); border-radius: 16px; box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--color-border); }
    
    .auth-image { flex: 1; background: #e2e8f0 url('/campus.jpeg') center/cover no-repeat; border-right: 1px solid var(--color-border); }
    
    .auth-content { flex: 1; padding: 3rem 4rem; display: flex; flex-direction: column; justify-content: center; }
    
    .brand { margin-bottom: 2.5rem; text-align: center; }
    .brand h1 { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; color: var(--color-ink); }
    
    .input-group { margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-ink); }
    
    .btn-primary { width: 100%; padding: 0.85rem; margin-top: 0.5rem; font-size: 0.95rem; }
    
    .error-banner { background: #fee2e2; border: 1px solid #f87171; color: #b91c1c; padding: 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; font-weight: 500; }
    
    .auth-footer { margin-top: 2.5rem; text-align: center; border-top: 1px solid var(--color-border); padding-top: 1.5rem; }
    .auth-footer p { font-size: 0.9rem; color: var(--color-muted); margin: 0; }
    .auth-footer a { color: var(--color-accent); text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .auth-footer a:hover { color: var(--color-accent-hover); text-decoration: underline; }

    @media (max-width: 900px) {
      .auth-image { display: none; }
      .auth-content { padding: 3rem 2rem; }
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
    
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: () => this.router.navigate([this.auth.homeRoute()]),
      error: (err) => {
        this.error = err.error?.message || 'Invalid email or password.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}