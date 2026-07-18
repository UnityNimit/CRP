import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-company-register',
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

          @if (success) {
            <div class="success-banner">
              <h3>Application Received</h3>
              <p>The placement cell will verify your account. You will receive an email once approved.</p>
              <a routerLink="/login" class="btn-primary" style="display: block; text-align: center; text-decoration: none; margin-top: 1.5rem;">Return to sign in</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
              <div class="form-row">
                <div class="input-group">
                  <label>HR Representative</label>
                  <input type="text" formControlName="hrName" placeholder="Jane Doe" />
                </div>
                <div class="input-group">
                  <label>Company Name</label>
                  <input type="text" formControlName="companyName" placeholder="Acme Corp" />
                </div>
              </div>

              <div class="input-group">
                <label>Work Email</label>
                <input type="email" formControlName="email" placeholder="jane@acme.com" />
              </div>

              <div class="input-group">
                <label>Corporate Website</label>
                <input type="url" formControlName="website" placeholder="https://acme.com" />
              </div>

              <div class="input-group">
                <label>Create Password</label>
                <input type="password" formControlName="password" placeholder="••••••••" />
              </div>

              @if (error) { <div class="error-banner">{{ error }}</div> }

              <button type="submit" class="btn-primary" [disabled]="loading || form.invalid">
                {{ loading ? 'Submitting...' : 'Apply to Recruit' }}
              </button>
            </form>

            <div class="auth-footer">
              <p>Already approved? <a routerLink="/login">Sign in here</a></p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout { min-height: 100vh; display: grid; place-items: center; background-color: var(--color-bg); padding: 2rem; font-family: var(--font-display); }
    .auth-card { display: flex; width: 100%; max-width: 1000px; min-height: 650px; background: var(--color-panel); border-radius: 16px; box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--color-border); }
    .auth-image { flex: 1; background: #e2e8f0 url('/campus.jpeg') center/cover no-repeat; border-right: 1px solid var(--color-border); }
    .auth-content { flex: 1; padding: 3rem 4rem; display: flex; flex-direction: column; justify-content: center; }
    
    .brand { margin-bottom: 2rem; text-align: center; }
    .brand h1 { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; color: var(--color-ink); }
    
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .input-group { margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--color-ink); }
    
    .btn-primary { width: 100%; padding: 0.85rem; margin-top: 0.5rem; font-size: 0.95rem; }
    
    .error-banner { background: #fee2e2; border: 1px solid #f87171; color: #b91c1c; padding: 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; font-weight: 500; }
    .success-banner { text-align: center; background: #dcfce7; padding: 2rem; border-radius: 8px; border: 1px solid #86efac; }
    .success-banner h3 { color: #16a34a; margin: 0 0 0.75rem 0; font-size: 1.25rem; }
    .success-banner p { color: var(--color-ink); font-size: 0.95rem; margin: 0; line-height: 1.6; }
    
    .auth-footer { margin-top: 2rem; text-align: center; border-top: 1px solid var(--color-border); padding-top: 1.5rem; }
    .auth-footer p { font-size: 0.9rem; color: var(--color-muted); margin: 0; }
    .auth-footer a { color: var(--color-accent); text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .auth-footer a:hover { color: var(--color-accent-hover); text-decoration: underline; }

    @media (max-width: 900px) {
      .auth-image { display: none; }
      .auth-content { padding: 3rem 2rem; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class CompanyRegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  success = false; loading = false; error = '';
  form = this.fb.group({ hrName: ['', Validators.required], companyName: ['', Validators.required], website: [''], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]] });
  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.http.post('https://crp-b2xa.onrender.com/api/v1/auth/register-company', this.form.value).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (err) => { this.error = err.error?.message || 'Registration failed.'; this.loading = false; }
    });
  }
}