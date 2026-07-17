import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../core/api.service';
import { AnalyticsSummary } from '../../core/models';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { KpiCardComponent } from '../../shared/kpi-card.component';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, PageHeaderComponent, KpiCardComponent],
  templateUrl: './admin-analytics.component.html'
})
export class AdminAnalyticsComponent implements OnInit {
  private api = inject(ApiService);
  summary?: AnalyticsSummary;

  barData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Applications', backgroundColor: '#0E7C7B' }] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    animation: { duration: 800 },
    plugins: { legend: { display: false } }
  };

  doughnutData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#B7791F', '#1B7F4E', '#B42318', '#5C6B7A'] }]
  };

  ngOnInit() {
    this.api.analytics().subscribe(s => {
      this.summary = s;
      this.barData = {
        labels: s.applicationsPerCompany.map(c => c.companyName),
        datasets: [{ data: s.applicationsPerCompany.map(c => c.count), label: 'Applications', backgroundColor: '#0E7C7B' }]
      };
      this.doughnutData = {
        labels: Object.keys(s.postingsByStatus),
        datasets: [{ data: Object.values(s.postingsByStatus), backgroundColor: ['#B7791F', '#1B7F4E', '#B42318', '#5C6B7A'] }]
      };
    });
  }
}
