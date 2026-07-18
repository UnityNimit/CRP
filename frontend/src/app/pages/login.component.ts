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
      <div class="hero-panel">
        <div class="hero-badge">CRP // Campus recruiting orchestration</div>
        <h1>Move from approvals to placements faster.</h1>
        <p>
          A role-based platform for the placement cell, companies, and students, with approvals, analytics,
          and bulk onboarding built in.
        </p>

        <div class="hero-stats">
          <div>
            <strong>3 roles</strong>
            <span>admin, company, student</span>
          </div>
          <div>
            <strong>Live insights</strong>
            <span>applications, approvals, rates</span>
          </div>
          <div>
            <strong>Bulk flow</strong>
            <span>CSV onboarding for students</span>
          </div>
        </div>
      </div>

      <div class="auth-container">
        <div class="brand">
          <div class="brand-mark">CRP.</div>
          <p>Campus Recruiting Platform</p>
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

          <button type="submit" class="btn-primary auth-button" [disabled]="loading || form.invalid">
            {{ loading ? 'Authenticating...' : 'Sign in' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Partner company? <a routerLink="/company-register">Apply to recruit</a></p>
          <p class="student-note">Students use the credentials shared by the Placement Cell.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(360px, 420px);
      gap: 1.5rem;
      padding: 2rem;
      align-items: center;
    }
    .hero-panel,
    .auth-container {
      border: 1px solid var(--color-border);
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.74), rgba(8, 15, 30, 0.88));
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }
    .hero-panel {
      padding: 3.5rem;
      background:
        radial-gradient(circle at top right, rgba(125, 211, 252, 0.18), transparent 28%),
        linear-gradient(160deg, rgba(15, 23, 42, 0.82), rgba(8, 15, 30, 0.95));
    }
    .hero-badge {
      display: inline-flex;
      padding: 0.45rem 0.8rem;
      border: 1px solid rgba(125, 211, 252, 0.22);
      border-radius: 999px;
      color: #bae6fd;
      background: rgba(14, 165, 233, 0.08);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 1.2rem;
    }
    .hero-panel h1 {
      font-size: clamp(2.2rem, 4vw, 4.4rem);
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.05em;
      margin: 0;
      max-width: 10ch;
    }
    .hero-panel p {
      max-width: 58ch;
      color: var(--color-muted);
      font-size: 1.02rem;
      line-height: 1.7;
      margin: 1.25rem 0 0;
    }
    .hero-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.85rem;
      margin-top: 2rem;
    }
    .hero-stats div {
      padding: 1rem;
      border-radius: 20px;
      background: rgba(2, 6, 23, 0.38);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }
    .hero-stats strong {
      display: block;
      color: var(--color-ink);
      font-size: 1rem;
      margin-bottom: 0.3rem;
    }
    .hero-stats span {
      color: var(--color-muted);
      font-size: 0.82rem;
    }
    .auth-container {
      width: 100%;
      max-width: 460px;
      padding: 2rem;
      margin-inline: auto;
    }
    .brand {
      margin-bottom: 1.75rem;
    }
    .brand-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(148, 163, 184, 0.8));
      color: #08111f;
      font-size: 1.3rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      box-shadow: 0 16px 30px rgba(15, 23, 42, 0.35);
      margin-bottom: 1rem;
    }
    .brand p {
      font-size: 0.8rem;
      color: var(--color-muted);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .input-group {
      margin-bottom: 0.25rem;
    }
    label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #cbd5e1;
    }
    .auth-button {
      width: 100%;
      margin-top: 0.4rem;
    }
    .error-banner {
      background: rgba(127, 29, 29, 0.24);
      border: 1px solid rgba(251, 113, 133, 0.24);
      color: #fecdd3;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      font-size: 0.86rem;
      margin: 0.2rem 0 0.25rem;
      text-align: center;
    }
    .auth-footer {
      margin-top: 1.4rem;
      text-align: center;
      border-top: 1px solid rgba(148, 163, 184, 0.14);
      padding-top: 1.2rem;
    }
    .auth-footer p {
      font-size: 0.86rem;
      color: var(--color-muted);
      margin: 0.5rem 0;
    }
    .auth-footer a {
      color: #e0f2fe;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .auth-footer a:hover {
      text-decoration: underline;
    }
    .student-note {
      font-size: 0.76rem !important;
      color: #64748b !important;
      margin-top: 1rem !important;
    }
    @media (max-width: 980px) {
      .auth-layout {
        grid-template-columns: 1fr;
      }
      .hero-panel {
        padding: 2rem;
      }
      .hero-stats {
        grid-template-columns: 1fr;
      }
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
        // FIX: Dynamically read the real error message from the backend!
        this.error = err.error?.message || 'Invalid email or password. Please verify your credentials.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}