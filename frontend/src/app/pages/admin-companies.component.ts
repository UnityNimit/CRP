import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Company } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { EmptyStateComponent } from '../components/empty-state.component';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Recruiters Directory" subtitle="Manage all corporate accounts and verify pending access requests." />
    
    @if (loading) {
      <div class="spinner-container"><div class="spinner"></div></div>
    } @else if (!companies.length) {
      <app-empty-state title="No Recruiters" message="No companies have registered yet." />
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
              @if (!c.approved) {
                <button class="btn-primary" (click)="approve(c)">Approve Access</button>
                <button class="btn-danger" (click)="reject(c)">Reject</button>
              } @else {
                <span class="status-approved">Verified Partner</span>
              }
            </div>

          </div>
        }
      </div>
    }
  `,
  styles: [`
    .company-grid { display: grid; gap: 1rem; }
    .company-card { display: flex; justify-content: space-between; align-items: center; background: var(--color-panel); padding: 1.5rem 2rem; border: 1px solid var(--color-border); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
    
    .info h3 { margin: 0 0 0.5rem 0; color: var(--color-ink); font-size: 1.15rem; font-weight: 700; }
    .info p { margin: 0.35rem 0; color: var(--color-muted); font-size: 0.9rem; }
    .info strong { color: var(--color-ink); font-weight: 600; }
    .info a { color: var(--color-accent); text-decoration: none; font-weight: 500; transition: 0.2s; }
    .info a:hover { color: var(--color-accent-hover); text-decoration: underline; }
    
    .actions { display: flex; gap: 0.75rem; align-items: center; }
    .status-approved { padding: 0.4rem 1rem; background: var(--color-success-bg); color: var(--color-success); font-weight: 600; font-size: 0.85rem; border-radius: 999px; border: 1px solid #bbf7d0; display: inline-block; }
    
    @media (max-width: 768px) { .company-card { flex-direction: column; align-items: flex-start; gap: 1.25rem; } .actions { width: 100%; justify-content: flex-start; } }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  private api = inject(ApiService);
  companies: Company[] = [];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.allCompanies().subscribe({
      next: (res) => { this.companies = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  approve(c: Company) {
    if (confirm(`Approve ${c.name} to recruit?`)) {
      this.api.approveCompanyProfile(c.id).subscribe(() => this.load());
    }
  }

  reject(c: Company) {
    if (confirm(`Reject and delete application for ${c.name}?`)) {
      this.api.rejectCompanyProfile(c.id).subscribe(() => this.load());
    }
  }
}