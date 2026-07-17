import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
  // FIX: Removed missing styleUrl. 
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
        this.error = 'Invalid email or password';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}