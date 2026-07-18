import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApiService } from '../core/api.service';
import { Application, ApplicationStatus } from '../models';
import { exportApplicantsCsv } from '../core/csv-export';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';
import { EmptyStateComponent } from '../components/empty-state.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    PageHeaderComponent,
    StatusChipComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header
      title="Applicant Tracking"
      subtitle="Select applicants for batch actions or export the pipeline to CSV." />

    @if (message) { <div class="success-banner">{{ message }}</div> }

    @if (!applications.length) {
      <app-empty-state title="No applicants yet" message="Applications will appear here once students apply." />
    } @else {
      <div class="toolbar">
        <div class="bulk-actions">
          <button class="btn-secondary btn-sm" [disabled]="!selection.hasValue()" (click)="bulkUpdate('SHORTLISTED')">
            Move to Shortlist ({{ selection.selected.length }})
          </button>
          <button class="btn-primary btn-sm" [disabled]="!selection.hasValue()" (click)="bulkUpdate('SELECTED')">
            Select (Offer)
          </button>
          <button class="btn-danger btn-sm" [disabled]="!selection.hasValue()" (click)="bulkUpdate('REJECTED')">
            Reject
          </button>
        </div>
        <button class="btn-secondary btn-sm" (click)="exportCsv()">
          Export Eligible Applicants to CSV
        </button>
      </div>

      <div class="table-container mat-elevation-z1">
        <table mat-table [dataSource]="applications" class="applicant-table">
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                (change)="$event ? toggleAllRows() : null"
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()" />
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null"
                [checked]="selection.isSelected(row)" />
            </td>
          </ng-container>

          <ng-container matColumnDef="studentName">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row"><strong>{{ row.studentName }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="studentEmail">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let row">{{ row.studentEmail }}</td>
          </ng-container>

          <ng-container matColumnDef="studentCgpa">
            <th mat-header-cell *matHeaderCellDef>CGPA</th>
            <td mat-cell *matCellDef="let row">{{ row.studentCgpa }}</td>
          </ng-container>

          <ng-container matColumnDef="studentBranch">
            <th mat-header-cell *matHeaderCellDef>Branch</th>
            <td mat-cell *matCellDef="let row">{{ row.studentBranch }}</td>
          </ng-container>

          <ng-container matColumnDef="resumeLink">
            <th mat-header-cell *matHeaderCellDef>Resume</th>
            <td mat-cell *matCellDef="let row">
              <a [href]="row.resumeLink" target="_blank" class="resume-link">View ↗</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row"><app-status-chip [status]="row.status" /></td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row" class="actions">
              <button class="btn-secondary btn-xs" (click)="updateStatus(row, 'SHORTLISTED')" [disabled]="row.status === 'SHORTLISTED' || row.status === 'SELECTED' || row.status === 'REJECTED'">Shortlist</button>
              <button class="btn-primary btn-xs" (click)="updateStatus(row, 'SELECTED')" [disabled]="row.status === 'SELECTED' || row.status === 'REJECTED'">Offer</button>
              <button class="btn-danger btn-xs" (click)="updateStatus(row, 'REJECTED')" [disabled]="row.status === 'REJECTED' || row.status === 'SELECTED'">Reject</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
      <p class="hint">Export includes all non-rejected applicants currently loaded ({{ applications.length }} rows).</p>
    }
  `,
  styles: [`
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .bulk-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .table-container {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      overflow-x: auto;
      box-shadow: var(--shadow);
    }
    .applicant-table { width: 100%; }
    .resume-link { color: var(--color-success); font-weight: 500; text-decoration: none; font-size: 0.9rem; }
    .resume-link:hover { text-decoration: underline; }
    .actions { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .btn-sm { padding: 0.45rem 0.75rem; font-size: 0.8rem; }
    .btn-xs { padding: 0.3rem 0.5rem; font-size: 0.7rem; }
    .success-banner {
      background: #0a2a1a;
      border: 1px solid #1a5a2a;
      color: var(--color-success);
      padding: 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
      font-weight: 500;
    }
    .hint { color: var(--color-muted); font-size: 0.85rem; margin-top: 0.75rem; }
    th.mat-mdc-header-cell, td.mat-mdc-cell { padding: 0.65rem 0.75rem !important; }
  `]
})
export class CompanyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  postingId = 0;
  applications: Application[] = [];
  message = '';
  selection = new SelectionModel<Application>(true, [], true, (a, b) => a.id === b.id);
  displayedColumns = ['select', 'studentName', 'studentEmail', 'studentCgpa', 'studentBranch', 'resumeLink', 'status', 'actions'];

  ngOnInit() {
    this.postingId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.api.postingApplications(this.postingId, 0, 500).subscribe(res => {
      this.applications = res.content;
      this.selection.clear();
    });
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.applications.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.applications);
    }
  }

  bulkUpdate(status: ApplicationStatus) {
    const ids = this.selection.selected.map(a => a.id);
    if (!ids.length) return;
    if (!confirm(`Update ${ids.length} applicant(s) to ${status}?`)) return;

    this.api.bulkUpdateApplicationStatus(ids, status).subscribe({
      next: res => {
        const failed = res.failed.length ? ` (${res.failed.length} failed)` : '';
        this.message = `Updated ${res.updated} applicant(s) to ${status}${failed}`;
        this.load();
        setTimeout(() => (this.message = ''), 4000);
      }
    });
  }

  updateStatus(app: Application, status: ApplicationStatus) {
    if (!confirm(`Mark ${app.studentName} as ${status}?`)) return;
    this.api.updateApplicationStatus(app.id, status).subscribe({
      next: () => {
        this.message = `Updated ${app.studentName} to ${status}`;
        this.load();
        setTimeout(() => (this.message = ''), 3000);
      }
    });
  }

  exportCsv() {
    exportApplicantsCsv(this.applications, this.postingId);
    this.message = 'CSV export started';
    setTimeout(() => (this.message = ''), 2000);
  }
}
