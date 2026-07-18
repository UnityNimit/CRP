import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Posting } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { EmptyStateComponent } from '../components/empty-state.component';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Browse Roles" subtitle="Only approved, open postings from verified companies." />

    @if (loading) {
      <div class="spinner-container"><div class="spinner"></div></div>
    } @else if (!postings.length) {
      <app-empty-state title="No open roles" message="Check back after the placement cell approves new postings." />
    } @else {
      <div class="job-list">
        @for (p of postings; track p.id) {
          <article class="job-card">
            <div class="job-info">
              <h3>{{ p.title }}</h3>
              <p class="company">{{ p.companyName }}</p>
              <p class="meta">
                <strong>Min CGPA:</strong> {{ p.minCgpa }} &nbsp;&middot;&nbsp; 
                <strong>Branches:</strong> {{ p.allowedBranches.join(', ') || 'All Branches' }} &nbsp;&middot;&nbsp; 
                <strong>Deadline:</strong> {{ p.deadline }}
              </p>
            </div>
            <div class="job-actions">
              <a [routerLink]="['/student/jobs', p.id]" class="btn-primary">View & Apply</a>
            </div>
          </article>
        }
      </div>
    }
  `,
  styles: [`
    .job-list { display: flex; flex-direction: column; gap: 1rem; }
    
    .job-card { 
      display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; 
      background: var(--color-panel); padding: 1.5rem 2rem; border-radius: var(--radius); 
      border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); 
      transition: box-shadow 0.2s ease, border-color 0.2s ease; 
    }
    .job-card:hover { box-shadow: var(--shadow); border-color: #cbd5e1; }
    
    .job-info h3 { margin: 0 0 0.35rem 0; color: var(--color-ink); font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
    .company { color: var(--color-accent); font-weight: 600; margin: 0 0 1rem 0; font-size: 0.95rem; }
    
    .meta { color: var(--color-muted); font-size: 0.85rem; margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .meta strong { color: var(--color-ink); font-weight: 600; }
    
    .job-actions { flex-shrink: 0; }
    
    @media (max-width: 768px) { 
      .job-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; } 
      .job-actions { width: 100%; } 
      .job-actions .btn-primary { display: block; text-align: center; } 
    }
  `]
})
export class StudentHomeComponent implements OnInit {
  private api = inject(ApiService);
  postings: Posting[] = [];
  loading = true;

  ngOnInit() {
    this.api.studentPostings().subscribe({
      next: res => { this.postings = res.content; this.loading = false; },
      error: () => (this.loading = false)
    });
  }
}