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
    <div class="auth-split">
      <div class="auth-image">
        <div class="overlay">
          <h2>Empowering the next generation of professionals.</h2>
          <p>Streamlined placement infrastructure for universities and top-tier recruiters.</p>
        </div>
      </div>
      
      <div class="auth-content">
        <div class="auth-container">
          <div class="brand">
            <h1>CRP.</h1>
            <p>Campus Recruitment Platform</p>
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
              {{ loading ? 'Authenticating...' : 'Sign in to account' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Partner company? <a routerLink="/company-register">Apply to recruit</a></p>
            <p class="student-note">Students: Use the credentials provided by your Placement Cell.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-split { display: flex; min-height: 100vh; background-color: var(--color-panel); font-family: var(--font-display); }
    
    /* Left Side: Image */
    .auth-image { flex: 1.2; position: relative; background: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover no-repeat; display: flex; align-items: flex-end; padding: 4rem; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.2) 100%); z-index: 1; }
    .auth-image h2 { position: relative; z-index: 2; color: #ffffff; font-size: 2.5rem; font-weight: 700; margin: 0 0 1rem 0; letter-spacing: -0.02em; max-width: 600px; line-height: 1.2; }
    .auth-image p { position: relative; z-index: 2; color: #cbd5e1; font-size: 1.1rem; margin: 0; max-width: 500px; line-height: 1.5; }
    
    /* Right Side: Form */
    .auth-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--color-bg); }
    .auth-container { width: 100%; max-width: 420px; padding: 3rem; background: var(--color-panel); border: 1px solid var(--color-border); border-radius: 12px; box-shadow: var(--shadow-lg); }
    
    .brand { margin-bottom: 2.5rem; text-align: center; }
    .brand h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; margin: 0 0 0.25rem 0; color: var(--color-ink); }
    .brand p { font-size: 0.8rem; color: var(--color-muted); margin: 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    
    .input-group { margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-ink); }
    
    .btn-primary { width: 100%; padding: 0.85rem; margin-top: 0.5rem; font-size: 0.95rem; }
    
    .error-banner { background: var(--color-danger-bg); border: 1px solid #f87171; color: var(--color-danger); padding: 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; font-weight: 500; }
    
    .auth-footer { margin-top: 2.5rem; text-align: center; border-top: 1px solid var(--color-border); padding-top: 1.5rem; }
    .auth-footer p { font-size: 0.9rem; color: var(--color-muted); margin: 0.5rem 0; }
    .auth-footer a { color: var(--color-accent); text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .auth-footer a:hover { color: var(--color-accent-hover); text-decoration: underline; }
    .student-note { font-size: 0.8rem !important; color: #94a3b8 !important; margin-top: 1.5rem !important; }

    @media (max-width: 900px) {
      .auth-image { display: none; }
      .auth-content { background: var(--color-bg); }
      .auth-container { box-shadow: none; border: none; background: transparent; padding: 1rem; }
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
      error: (err) => {
        this.error = err.error?.message || 'Invalid email or password. Please verify your credentials.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}