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
    <div class="auth-split">
      <div class="auth-image">
        <div class="overlay">
          <h2>Hire the top 1% of campus talent.</h2>
          <p>Join hundreds of leading enterprises recruiting directly through our verified placement portal.</p>
        </div>
      </div>

      <div class="auth-content">
        <div class="auth-container">
          <div class="brand">
            <h1>Join CRP.</h1>
            <p>Recruiter Application</p>
          </div>

          @if (success) {
            <div class="success-banner">
              <h3>Application Received</h3>
              <p>Our Placement Cell will verify your corporate identity. You will receive an email once your account is approved.</p>
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
                {{ loading ? 'Submitting...' : 'Submit Application' }}
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
    .auth-split { display: flex; min-height: 100vh; background-color: var(--color-panel); font-family: var(--font-display); }
    
    /* Left Side: Corporate Image */
    .auth-image { flex: 1; position: relative; background: url('/campus.jpeg') center/cover no-repeat; display: flex; align-items: flex-end; padding: 4rem; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.2) 100%); z-index: 1; }
    .auth-image h2 { position: relative; z-index: 2; color: #ffffff; font-size: 2.5rem; font-weight: 700; margin: 0 0 1rem 0; letter-spacing: -0.02em; max-width: 500px; line-height: 1.2; }
    .auth-image p { position: relative; z-index: 2; color: #cbd5e1; font-size: 1.1rem; margin: 0; max-width: 450px; line-height: 1.5; }

    /* Right Side: Form */
    .auth-content { flex: 1.2; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--color-bg); }
    .auth-container { width: 100%; max-width: 500px; padding: 3rem; background: var(--color-panel); border: 1px solid var(--color-border); border-radius: 12px; box-shadow: var(--shadow-lg); }
    
    .brand { margin-bottom: 2.5rem; text-align: center; }
    .brand h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; margin: 0 0 0.25rem 0; color: var(--color-ink); }
    .brand p { font-size: 0.8rem; color: var(--color-muted); margin: 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .input-group { margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-ink); }
    
    .btn-primary { width: 100%; padding: 0.85rem; margin-top: 0.5rem; font-size: 0.95rem; }
    
    .error-banner { background: var(--color-danger-bg); border: 1px solid #f87171; color: var(--color-danger); padding: 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; font-weight: 500; }
    .success-banner { text-align: center; background: var(--color-success-bg); padding: 2rem; border-radius: 8px; border: 1px solid #86efac; }
    .success-banner h3 { color: var(--color-success); margin: 0 0 0.75rem 0; font-size: 1.25rem; }
    .success-banner p { color: var(--color-ink); font-size: 0.95rem; margin: 0; line-height: 1.6; }
    
    .auth-footer { margin-top: 2.5rem; text-align: center; border-top: 1px solid var(--color-border); padding-top: 1.5rem; }
    .auth-footer p { font-size: 0.9rem; color: var(--color-muted); margin: 0.5rem 0; }
    .auth-footer a { color: var(--color-accent); text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .auth-footer a:hover { color: var(--color-accent-hover); text-decoration: underline; }

    @media (max-width: 900px) {
      .auth-image { display: none; }
      .auth-content { background: var(--color-bg); }
      .auth-container { box-shadow: none; border: none; background: transparent; padding: 1rem; }
      .form-row { grid-template-columns: 1fr; gap: 0; }
    }
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