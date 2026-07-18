import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../core/api.service';
import { AnalyticsSummary } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { KpiCardComponent } from '../components/kpi-card.component';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, PageHeaderComponent, KpiCardComponent],
  template: `
    <app-page-header title="Recruiting Analytics" subtitle="Placement rate = students with ≥1 selected offer ÷ total students." />

    @if (loading) {
      <div class="spinner-container"><div class="spinner"></div></div>
    } @else if (summary) {
      <div class="kpis">
        <app-kpi-card label="Placement rate" [value]="summary.placementRate + '%'" [hint]="summary.placedStudents + ' of ' + summary.totalStudents + ' students placed'" />
        <app-kpi-card label="Pending approvals" [value]="summary.pendingPostings" />
        <app-kpi-card label="Open roles" [value]="summary.openPostings" />
        <app-kpi-card label="Total applications" [value]="summary.totalApplications" />
      </div>

      <div class="charts">
        <section class="chart-panel">
          <h3>Applications per company</h3>
          <canvas baseChart [data]="barData" [options]="barOptions" type="bar"></canvas>
        </section>
        <section class="chart-panel">
          <h3>Postings by status</h3>
          <canvas baseChart [data]="doughnutData" type="doughnut"></canvas>
        </section>
      </div>
    }
  `,
  styles: [`
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .charts { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; }
    .chart-panel { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm); }
    h3 { margin-top: 0; margin-bottom: 1.5rem; color: var(--color-ink); font-size: 1.1rem; font-weight: 600; }
    @media (max-width: 1000px) { .kpis { grid-template-columns: repeat(2, 1fr); } .charts { grid-template-columns: 1fr; } }
  `]
})
export class AdminAnalyticsComponent implements OnInit {
  private api = inject(ApiService);
  summary?: AnalyticsSummary;
  loading = true;

  barData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Applications', backgroundColor: '#2563eb' }] };
  barOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, animation: { duration: 800 }, plugins: { legend: { display: false } } };
  doughnutData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: ['#d97706', '#16a34a', '#dc2626', '#64748b'] }] };

  ngOnInit() {
    this.api.analytics().subscribe({
      next: (s) => {
        this.summary = s;
        this.barData = { labels: s.applicationsPerCompany.map(c => c.companyName), datasets: [{ data: s.applicationsPerCompany.map(c => c.count), label: 'Applications', backgroundColor: '#2563eb' }] };
        this.doughnutData = { labels: Object.keys(s.postingsByStatus), datasets: [{ data: Object.values(s.postingsByStatus), backgroundColor: ['#d97706', '#16a34a', '#dc2626', '#64748b'] }] };
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}