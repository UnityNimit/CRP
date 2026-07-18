import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Posting, CompanyAnalyticsSummary } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';
import { EmptyStateComponent } from '../components/empty-state.component';
import { KpiCardComponent } from '../components/kpi-card.component';

@Component({
  selector: 'app-company-home',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusChipComponent, EmptyStateComponent, KpiCardComponent],
  template: `
    <app-page-header title="Recruiter Dashboard" subtitle="Manage your open roles and review applicants.">
      <a routerLink="/company/new" class="btn-primary">Post New Role</a>
    </app-page-header>

    @if (summary) {
      <div class="kpi-grid">
        <app-kpi-card label="Total Roles Posted" [value]="summary.totalJobs" />
        <app-kpi-card label="Total Applicants" [value]="summary.totalApplications" />
        <app-kpi-card label="Offers Selected" [value]="summary.selected" />
        <app-kpi-card label="Pending Review" [value]="summary.pendingReview" />
      </div>
    }

    <div class="table-container">
      <h3>Active Postings</h3>
      
      @if (loading) {
        <div class="spinner-container" style="padding: 3rem 0;"><div class="spinner"></div></div>
      } @else if (!postings.length) {
        <app-empty-state title="No roles yet" message="Create your first job posting to start recruiting." />
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Applicants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of postings; track p.id) {
              <tr>
                <td>
                  <strong>{{ p.title }}</strong>
                  @if (p.status === 'NEEDS_REVISION' && p.revisionComment) {
                    <p class="revision-hint">{{ p.revisionComment }}</p>
                  }
                </td>
                <td>{{ p.deadline }}</td>
                <td><app-status-chip [status]="p.status" /></td>
                <td>{{ p.applicationCount }}</td>
                <td class="row-actions">
                  <a [routerLink]="['/company/postings', p.id]" class="view-link">Review Applicants</a>
                  @if (p.status === 'DRAFT' || p.status === 'NEEDS_REVISION') {
                    <a [routerLink]="['/company/postings', p.id, 'edit']" class="view-link">Edit</a>
                  }
                  @if (p.status === 'APPROVED') {
                    <button class="btn-secondary btn-sm" (click)="close(p)">Close Role</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
    
    .table-container { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 1.5rem 2rem; box-shadow: var(--shadow-sm); }
    h3 { margin-top: 0; color: var(--color-ink); border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; font-size: 1.15rem; font-weight: 600; }
    
    .row-actions { display: flex; gap: 1.25rem; align-items: center; }
    
    .view-link { color: var(--color-accent); text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: color 0.2s; }
    .view-link:hover { color: var(--color-accent-hover); text-decoration: underline; }
    
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
    .revision-hint { margin: 0.35rem 0 0; font-size: 0.8rem; color: var(--color-warning); font-weight: 500; }
    
    @media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class CompanyHomeComponent implements OnInit {
  private api = inject(ApiService);
  
  postings: Posting[] = [];
  summary?: CompanyAnalyticsSummary;
  loading = true;

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.loading = true;
    
    // Load Analytics Funnel
    this.api.companyAnalytics().subscribe(s => this.summary = s);
    
    // Load Postings Table
    this.api.companyPostings().subscribe({
      next: res => { this.postings = res.content; this.loading = false; },
      error: () => (this.loading = false)
    });
  }

  close(p: Posting) {
    if (!confirm(`Are you sure you want to close "${p.title}"? Students will no longer be able to apply.`)) return;
    this.api.closePosting(p.id).subscribe({ next: () => this.reload() });
  }
}