import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="brand">
          <h1>Join CRP.</h1>
          <p>Apply to recruit top university talent.</p>
        </div>

        @if (success) {
          <div class="success-banner">
            <h3>Application Received</h3>
            <p>Our Placement Cell will verify your company details. You will receive an email once approved to post jobs.</p>
            <a routerLink="/login" class="btn-primary" style="display: block; text-align: center; text-decoration: none; margin-top: 1.5rem;">Return to login</a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
            <div class="input-group">
              <label>HR Representative Name</label>
              <input type="text" formControlName="hrName" placeholder="Jane Doe" />
            </div>

            <div class="input-group">
              <label>Company Name</label>
              <input type="text" formControlName="companyName" placeholder="Acme Corp" />
            </div>

            <div class="input-group">
              <label>Company Website</label>
              <input type="url" formControlName="website" placeholder="https://acme.com" />
            </div>

            <div class="input-group">
              <label>Work Email</label>
              <input type="email" formControlName="email" placeholder="jane@acme.com" />
            </div>

            <div class="input-group">
              <label>Password</label>
              <input type="password" formControlName="password" placeholder="••••••••" />
            </div>

            @if (error) { <div class="error-banner">{{ error }}</div> }

            <button type="submit" class="btn-primary" [disabled]="loading || form.invalid">
              {{ loading ? 'Submitting...' : 'Submit Application' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Already approved? <a routerLink="/login">Sign in here</a></p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Identical premium styles to your login page to maintain theme consistency */
    .auth-layout { min-height: 100vh; display: grid; place-items: center; background-color: #000; color: #fff; font-family: -apple-system, sans-serif; padding: 2rem; }
    .auth-container { width: 100%; max-width: 440px; padding: 3rem 2.5rem; background: #0a0a0a; border: 1px solid #222; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8); }
    .brand { margin-bottom: 2.5rem; text-align: center; }
    .brand h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.05em; margin: 0 0 0.2rem 0; color: #fff; }
    .brand p { font-size: 0.85rem; color: #888; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .input-group { margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem; color: #aaa; }
    input { width: 100%; padding: 0.85rem 1rem; background: #000; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.95rem; box-sizing: border-box; transition: all 0.2s; }
    input:focus { outline: none; border-color: #fff; box-shadow: 0 0 0 1px #fff; }
    .btn-primary { width: 100%; padding: 0.9rem; background: #fff; color: #000; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; margin-top: 0.5rem; }
    .btn-primary:hover:not([disabled]) { background: #ddd; }
    .btn-primary[disabled] { background: #333; color: #666; cursor: not-allowed; }
    .error-banner { background: #2a0a0a; border: 1px solid #5a1a1a; color: #ff6b6b; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; }
    .success-banner { text-align: center; padding: 1rem; }
    .success-banner h3 { color: #4ade80; margin-bottom: 0.5rem; }
    .success-banner p { color: #aaa; font-size: 0.95rem; line-height: 1.5; }
    .auth-footer { margin-top: 2.5rem; text-align: center; border-top: 1px solid #222; padding-top: 1.5rem; }
    .auth-footer a { color: #fff; text-decoration: none; font-weight: 500; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class CompanyRegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  success = false;
  loading = false;
  error = '';

  form = this.fb.group({
    hrName: ['', Validators.required],
    companyName: ['', Validators.required],
    website: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    // Hardcoding URL here since this is an unauthenticated public route
    this.http.post('https://crp-b2xa.onrender.com/api/v1/auth/register-company', this.form.value)
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed. Email might already be in use.';
          this.loading = false;
        }
      });
  }
}