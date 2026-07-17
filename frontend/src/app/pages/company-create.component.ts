import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { PageHeaderComponent } from '../components/page-header.component';

@Component({
  selector: 'app-company-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './company-create.component.html'
})
export class CompanyCreateComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  error = '';
  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    minCgpa: [7.0, [Validators.required, Validators.min(0), Validators.max(10)]],
    allowedBranches: ['CSE, IT', Validators.required],
    gradYear: [2026, Validators.required],
    deadline: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body = {
      title: v.title,
      description: v.description,
      minCgpa: v.minCgpa,
      allowedBranches: (v.allowedBranches || '').split(',').map(s => s.trim()).filter(Boolean),
      gradYear: v.gradYear,
      deadline: v.deadline
    };
    this.api.createPosting(body).subscribe({
      next: () => this.router.navigate(['/company']),
      error: () => (this.error = 'Failed to create posting')
    });
  }
}
