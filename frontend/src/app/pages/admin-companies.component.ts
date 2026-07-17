import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { PendingCompany } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { EmptyStateComponent } from '../components/empty-state.component';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Recruiter Approvals" subtitle="Verify and approve companies before they can post jobs." />
    
    @if (loading) {
      <p>Loading pending companies...</p>
    } @else if (!companies.length) {
      <app-empty-state title="All caught up" message="No companies are currently waiting for approval." />
    } @else {
      <div class="company-grid">
        @for (c of companies; track c.id) {
          <div class="company-card">
            <div class="info">
              <h3>{{ c.name }}</h3>
              <p><strong>HR Rep:</strong> {{ c.hrName }} ({{ c.email }})</p>
              @if (c.website) { <p><strong>Website:</strong> <a [href]="c.website" target="_blank">{{ c.website }}</a></p> }
            </div>
            <div class="actions">
              <button class="btn-primary" (click)="approve(c)">Approve</button>
              <button class="btn-danger" (click)="reject(c)">Reject</button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .company-grid { display: grid; gap: 1rem; }
    .company-card { display: flex; justify-content: space-between; align-items: center; background: var(--color-panel); padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius); box-shadow: var(--shadow); }
    h3 { margin: 0 0 0.5rem 0; color: var(--color-ink); }
    p { margin: 0.25rem 0; color: var(--color-muted); font-size: 0.9rem; }
    a { color: var(--color-accent); text-decoration: none; }
    .actions { display: flex; gap: 0.5rem; }
    @media (max-width: 768px) { .company-card { flex-direction: column; align-items: flex-start; gap: 1rem; } .actions { width: 100%; } .actions button { flex: 1; } }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  private api = inject(ApiService);
  companies: PendingCompany[] = [];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.pendingCompanies().subscribe(res => {
      this.companies = res.content;
      this.loading = false;
    });
  }

  approve(c: PendingCompany) {
    if (confirm(`Approve ${c.name} to recruit?`)) {
      this.api.approveCompanyProfile(c.id).subscribe(() => this.load());
    }
  }

  reject(c: PendingCompany) {
    if (confirm(`Reject and delete application for ${c.name}?`)) {
      this.api.rejectCompanyProfile(c.id).subscribe(() => this.load());
    }
  }
}