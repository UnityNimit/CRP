import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Application, ApplicationStatus } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';
import { EmptyStateComponent } from '../components/empty-state.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatusChipComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Applicant Tracking" subtitle="Review candidates and update their recruitment status." />

    @if (message) { <div class="success-banner">{{ message }}</div> }

    <div class="table-container">
      @if (!applications.length) {
        <app-empty-state title="No applicants yet" message="Applications will appear here once students apply." />
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Branch</th>
              <th>Resume / Portfolio</th>
              <th>Current Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            @for (a of applications; track a.id) {
              <tr>
                <td><strong>{{ a.studentName }}</strong></td>
                <td>{{ a.studentBranch }}</td>
                <td>
                  <a [href]="a.resumeLink" target="_blank" class="resume-link">View External Link ↗</a>
                </td>
                <td><app-status-chip [status]="a.status" /></td>
                <td class="actions">
                  <button class="btn-secondary btn-sm" (click)="updateStatus(a, 'SHORTLISTED')" [disabled]="a.status === 'SHORTLISTED' || a.status === 'SELECTED' || a.status === 'REJECTED'">Shortlist</button>
                  <button class="btn-primary btn-sm" (click)="updateStatus(a, 'SELECTED')" [disabled]="a.status === 'SELECTED' || a.status === 'REJECTED'">Select</button>
                  <button class="btn-danger btn-sm" (click)="updateStatus(a, 'REJECTED')" [disabled]="a.status === 'REJECTED' || a.status === 'SELECTED'">Reject</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .table-container { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 1.5rem; overflow-x: auto; box-shadow: var(--shadow); }
    .resume-link { color: var(--color-success); font-weight: 500; text-decoration: none; font-size: 0.9rem; }
    .resume-link:hover { text-decoration: underline; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-sm { padding: 0.4rem 0.6rem; font-size: 0.75rem; }
    .success-banner { background: #0a2a1a; border: 1px solid #1a5a2a; color: var(--color-success); padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem; font-weight: 500; }
  `]
})
export class CompanyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  
  postingId = 0;
  applications: Application[] = [];
  message = '';

  ngOnInit() {
    this.postingId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.api.postingApplications(this.postingId).subscribe(res => (this.applications = res.content));
  }

  updateStatus(app: Application, status: ApplicationStatus) {
    if (!confirm(`Mark ${app.studentName} as ${status}?`)) return;
    
    this.api.updateApplicationStatus(app.id, status).subscribe({
      next: () => {
        this.message = `Successfully updated ${app.studentName} to ${status}`;
        this.load();
        setTimeout(() => this.message = '', 3000);
      }
    });
  }
}