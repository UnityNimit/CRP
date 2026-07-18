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
    <app-page-header title="Recruiter Approvals" subtitle="Verify and approve company accounts before they can post jobs." />

    <div class="toolbar panel">
      <div>
        <strong>{{ visibleCompanies().length }}</strong>
        <span>companies awaiting review</span>
      </div>
      <div class="toolbar-actions">
        <input
          type="search"
          [value]="searchTerm"
          (input)="searchTerm = $any($event.target).value"
          placeholder="Search company, HR, email"
        />
        @if (searchTerm) {
          <button class="btn-secondary" type="button" (click)="searchTerm = ''">Clear</button>
        }
      </div>
    </div>
    
    @if (loading) {
      <div style="color: var(--color-muted); margin-top: 2rem;">Fetching companies...</div>
    } @else if (!visibleCompanies().length) {
      @if (searchTerm) {
        <app-empty-state title="No matches" message="No companies match your search criteria." />
      } @else {
        <app-empty-state title="Queue Clear" message="No companies are currently waiting for approval." />
      }
    } @else {
      <div class="company-grid">
        @for (c of visibleCompanies(); track c.id) {
          <div class="company-card">
            <div class="info">
              <h3>{{ c.name }}</h3>
              <p><strong>HR Rep:</strong> {{ c.hrName }} ({{ c.email }})</p>
              @if (c.website) { <p><strong>Website:</strong> <a [href]="c.website" target="_blank">{{ c.website }}</a></p> }
            </div>
            <div class="actions">
              <button class="btn-primary" (click)="approve(c)">Approve Access</button>
              <button class="btn-danger" (click)="reject(c)">Reject</button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .panel { display: flex; justify-content: space-between; align-items: center; gap: 1rem; background: var(--color-panel); padding: 1rem 1.25rem; margin-top: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius); }
    .toolbar strong { display: block; font-size: 1.15rem; color: var(--color-ink); }
    .toolbar span { color: var(--color-muted); font-size: 0.85rem; }
    .toolbar-actions { display: flex; gap: 0.75rem; align-items: center; }
    .toolbar-actions input { min-width: 260px; background: #111; border: 1px solid var(--color-border); color: var(--color-ink); border-radius: 8px; padding: 0.8rem 0.9rem; }
    .company-grid { display: grid; gap: 1rem; margin-top: 2rem; }
    .company-card { display: flex; justify-content: space-between; align-items: center; background: var(--color-panel); padding: 1.5rem 2rem; border: 1px solid var(--color-border); border-radius: var(--radius); box-shadow: var(--shadow); }
    h3 { margin: 0 0 0.5rem 0; color: var(--color-ink); font-size: 1.25rem; }
    p { margin: 0.35rem 0; color: var(--color-muted); font-size: 0.95rem; }
    a { color: var(--color-success); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .actions { display: flex; gap: 0.75rem; }
    @media (max-width: 900px) {
      .panel, .company-card { flex-direction: column; align-items: stretch; }
      .toolbar-actions { width: 100%; }
      .toolbar-actions input { min-width: 0; width: 100%; }
    }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  private api = inject(ApiService);
  companies: PendingCompany[] = [];
  loading = true;
  searchTerm = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.pendingCompanies().subscribe({
      next: (res) => { this.companies = res.content; this.loading = false; },
      error: () => { this.loading = false; }
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

  visibleCompanies() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.companies;

    return this.companies.filter(company =>
      [company.name, company.hrName, company.email, company.website]
        .some(value => value.toLowerCase().includes(term))
    );
  }
}