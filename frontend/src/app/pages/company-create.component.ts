import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Posting } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';

@Component({
  selector: 'app-company-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusChipComponent],
  templateUrl: './company-create.component.html'
})
export class CompanyCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  error = '';
  loading = false;
  postingId?: number;
  existing?: Posting;

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    minCgpa: [7.0, [Validators.required, Validators.min(0), Validators.max(10)]],
    allowedBranches: ['CSE, IT', Validators.required],
    gradYear: [2026, Validators.required],
    deadline: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.postingId = +id;
      this.loading = true;
      this.api.getPosting(this.postingId).subscribe({
        next: p => {
          this.existing = p;
          this.form.patchValue({
            title: p.title,
            description: p.description,
            minCgpa: p.minCgpa,
            allowedBranches: p.allowedBranches.join(', '),
            gradYear: p.gradYear,
            deadline: p.deadline
          });
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load posting';
          this.loading = false;
        }
      });
    }
  }

  get isEditMode(): boolean {
    return !!this.postingId;
  }

  get canEdit(): boolean {
    return !this.existing || this.existing.status === 'DRAFT' || this.existing.status === 'NEEDS_REVISION';
  }

  private buildBody(submit: boolean) {
    const v = this.form.getRawValue();
    return {
      title: v.title,
      description: v.description,
      minCgpa: v.minCgpa,
      allowedBranches: (v.allowedBranches || '').split(',').map(s => s.trim()).filter(Boolean),
      gradYear: v.gradYear,
      deadline: v.deadline,
      ...(submit !== undefined ? { submit } : {})
    };
  }

  saveDraft() {
    if (this.form.invalid) return;
    this.error = '';
    if (this.isEditMode && this.postingId) {
      this.api.updatePosting(this.postingId, this.buildBody(false)).subscribe({
        next: () => this.router.navigate(['/company']),
        error: () => (this.error = 'Failed to save draft')
      });
    } else {
      this.api.createPosting({ ...this.buildBody(false), submit: false }).subscribe({
        next: () => this.router.navigate(['/company']),
        error: () => (this.error = 'Failed to save draft')
      });
    }
  }

  submitForReview() {
    if (this.form.invalid) return;
    this.error = '';
    if (this.isEditMode && this.postingId) {
      this.api.updatePosting(this.postingId, this.buildBody(false)).subscribe({
        next: () => {
          this.api.submitPosting(this.postingId!).subscribe({
            next: () => this.router.navigate(['/company']),
            error: () => (this.error = 'Failed to submit for review')
          });
        },
        error: () => (this.error = 'Failed to update posting')
      });
    } else {
      this.api.createPosting({ ...this.buildBody(false), submit: true }).subscribe({
        next: () => this.router.navigate(['/company']),
        error: () => (this.error = 'Failed to submit for review')
      });
    }
  }
}
