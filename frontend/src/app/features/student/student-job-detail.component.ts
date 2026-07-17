import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { EligibilityTip, Posting } from '../../core/models';
import { PageHeaderComponent } from '../../shared/page-header.component';

@Component({
  selector: 'app-student-job-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './student-job-detail.component.html'
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
  form = this.fb.group({ coverNote: ['', Validators.maxLength(1000)] });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.studentPosting(id).subscribe(p => (this.posting = p));
    this.api.eligibility(id).subscribe(e => (this.eligibility = e));
  }

  apply() {
    if (!this.posting) return;
    this.api.apply(this.posting.id, this.form.value.coverNote || '').subscribe({
      next: () => {
        this.message = 'Application submitted successfully';
        setTimeout(() => this.router.navigate(['/student/applications']), 1200);
      },
      error: () => (this.error = 'Could not apply — posting may be closed or already applied.')
    });
  }
}
