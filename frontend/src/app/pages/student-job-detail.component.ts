import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { EligibilityTip, Posting } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';

@Component({
  selector: 'app-student-job-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    @if (posting) {
      <app-page-header [title]="posting.title" [subtitle]="posting.companyName" />

      <div class="detail-grid">
        <section class="panel">
          <h3>Role Details</h3>
          <p class="desc">{{ posting.description }}</p>
          <ul class="req-list">
            <li><strong>Minimum CGPA:</strong> {{ posting.minCgpa }}</li>
            <li><strong>Allowed Branches:</strong> {{ posting.allowedBranches.join(', ') || 'All Branches' }}</li>
            <li><strong>Target Batch:</strong> {{ posting.gradYear }}</li>
            <li><strong>Application Deadline:</strong> {{ posting.deadline }}</li>
          </ul>
        </section>

        @if (eligibility) {
          <section class="panel criteria-box" [class.eligible]="eligibility.eligible" [class.ineligible]="!eligibility.eligible">
            <h3>Placement Policy & Eligibility Check</h3>
            <ul class="check-list">
              @for (c of eligibility.checks; track c) { 
                <li [class.fail]="c.startsWith('❌')">{{ c }}</li> 
              }
            </ul>
            @if (!eligibility.eligible) {
              <div class="blocker-msg">SYSTEM BLOCK: You do not meet the strict mathematical requirements or placement policies for this role.</div>
            }
          </section>
        }

        <!-- Only render the Apply form if the backend math says TRUE -->
        @if (eligibility?.eligible) {
          <section class="panel">
            <h3>Submit Application</h3>
            <form [formGroup]="form" (ngSubmit)="apply()">
              <div class="form-group">
                <label>Resume / Portfolio Link (Google Drive, GitHub, etc.)</label>
                <input type="url" formControlName="resumeLink" placeholder="https://..." />
                @if (form.get('resumeLink')?.invalid && form.get('resumeLink')?.touched) {
                  <small class="error-txt">Please provide a valid URL starting with http:// or https://</small>
                }
              </div>
              @if (message) { <div class="success-banner">{{ message }}</div> }
              @if (error) { <div class="error-banner">{{ error }}</div> }
              <button class="btn-primary" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Submitting...' : 'Confirm & Apply' }}
              </button>
            </form>
          </section>
        }
      </div>
    }
  `,
  styles: [`
    .detail-grid { display: grid; gap: 1.5rem; }
    .panel { background: var(--color-panel); padding: 2rem; border-radius: var(--radius); border: 1px solid var(--color-border); box-shadow: var(--shadow); }
    h3 { margin-top: 0; color: var(--color-ink); border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem; font-size: 1.15rem; }
    .desc { color: #ccc; line-height: 1.6; margin-bottom: 1.5rem; }
    .req-list { list-style: none; padding: 0; margin: 0; }
    .req-list li { padding: 0.5rem 0; border-bottom: 1px dashed #333; color: #aaa; }
    .req-list li:last-child { border-bottom: none; }
    .req-list strong { color: #fff; display: inline-block; width: 160px; }
    
    /* Strict Criteria Box */
    .criteria-box { border-left: 4px solid var(--color-muted); }
    .criteria-box.eligible { border-left-color: var(--color-success); }
    .criteria-box.ineligible { border-left-color: var(--color-danger); }
    
    .check-list { list-style: none; padding: 0; margin-top: 1rem; }
    .check-list li { padding: 0.6rem 0; border-bottom: 1px solid #1a1a1a; color: #ddd; font-family: monospace; font-size: 0.95rem; }
    .check-list li.fail { color: var(--color-danger); font-weight: 600; }
    .check-list li:last-child { border-bottom: none; }
    
    .blocker-msg { background: #2a0a0a; color: #ff6b6b; padding: 1rem; border-radius: 6px; margin-top: 1.5rem; font-weight: 600; font-size: 0.9rem; border: 1px solid #5a1a1a; }
    
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: var(--color-muted); font-size: 0.9rem; font-weight: 500; }
    .error-txt { color: var(--color-danger); font-size: 0.8rem; display: block; margin-top: 0.4rem; }
    
    .success-banner { background: #0a2a1a; border: 1px solid #1a5a2a; color: var(--color-success); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-weight: 500; font-size: 0.9rem; }
    .error-banner { background: #2a0a0a; border: 1px solid #5a1a1a; color: #ff6b6b; padding: 1rem; border-radius: 6px; font-size: 0.9rem; margin-bottom: 1.5rem; }
  `]
})
export class StudentJobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  posting?: Posting;
  eligibility?: EligibilityTip;
  message = '';
  error = '';
  loading = false;
  
  // Strict URL Validation for Resume
  form = this.fb.group({ 
    resumeLink: ['', [Validators.required, Validators.pattern('https?://.+')]] 
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.studentPosting(id).subscribe(p => (this.posting = p));
    this.api.eligibility(id).subscribe(e => (this.eligibility = e));
  }

  apply() {
    if (!this.posting || !this.eligibility?.eligible || this.form.invalid) return;
    
    this.loading = true;
    this.error = '';
    
    this.api.apply(this.posting.id, this.form.value.resumeLink!).subscribe({
      next: () => {
        this.message = 'Application mathematically verified and submitted successfully.';
        setTimeout(() => this.router.navigate(['/student/applications']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Application blocked. Job may be closed or you are already placed.';
        this.loading = false;
      }
    });
  }
}