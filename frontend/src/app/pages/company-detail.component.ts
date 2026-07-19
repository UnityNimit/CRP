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
          <button class="btn-secondary btn-sm" [disabled]="!actionableSelectionCount" (click)="bulkUpdate('SHORTLISTED')">
            Move to Shortlist ({{ actionableSelectionCount }})
          </button>
          <button class="btn-primary btn-sm" [disabled]="!actionableSelectionCount" (click)="bulkUpdate('SELECTED')">
            Select (Offer)
          </button>
          <button class="btn-danger btn-sm" [disabled]="!actionableSelectionCount" (click)="bulkUpdate('REJECTED')">
            Reject
          </button>
        </div>
        <button class="btn-secondary btn-sm export-btn" (click)="exportCsv()">
          Export Eligible Applicants to CSV
        </button>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="applications" class="applicant-table">
          
          <!-- Checkbox Column -->
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                (change)="$event ? toggleAllRows() : null"
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()"
                color="primary">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null"
                [checked]="selection.isSelected(row)"
                [disabled]="!isBulkSelectable(row)"
                color="primary">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="studentName">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row"><strong style="color: var(--color-ink);">{{ row.studentName }}</strong></td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="studentEmail">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let row">{{ row.studentEmail || 'N/A' }}</td>
          </ng-container>

          <!-- CGPA Column -->
          <ng-container matColumnDef="studentCgpa">
            <th mat-header-cell *matHeaderCellDef>CGPA</th>
            <td mat-cell *matCellDef="let row"><strong>{{ row.studentCgpa || row.cgpa }}</strong></td>
          </ng-container>

          <!-- Branch Column -->
          <ng-container matColumnDef="studentBranch">
            <th mat-header-cell *matHeaderCellDef>Branch</th>
            <td mat-cell *matCellDef="let row"><span class="branch-tag">{{ row.studentBranch }}</span></td>
          </ng-container>

          <!-- Resume Column -->
          <ng-container matColumnDef="resumeLink">
            <th mat-header-cell *matHeaderCellDef>Resume</th>
            <td mat-cell *matCellDef="let row">
              <a [href]="row.resumeLink" target="_blank" class="resume-link">View ↗</a>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row"><app-status-chip [status]="row.status" /></td>
          </ng-container>

          <!-- Actions Column -->
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
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .bulk-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    
    .table-container { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: var(--radius); overflow-x: auto; box-shadow: var(--shadow-sm); }
    .applicant-table { width: 100%; background: transparent !important; }
    
    /* OVERRIDING DEFAULT ANGULAR MATERIAL STYLES */
    ::ng-deep .mat-mdc-table { font-family: var(--font-display) !important; background: transparent !important; }
    ::ng-deep .mat-mdc-header-cell { background: #f8fafc !important; color: var(--color-muted) !important; font-weight: 600 !important; font-size: 0.75rem !important; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--color-border) !important; }
    ::ng-deep .mat-mdc-cell { border-bottom: 1px solid var(--color-border) !important; color: var(--color-ink) !important; font-size: 0.9rem !important; }
    
    .branch-tag { background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; border: 1px solid var(--color-border); }
    .resume-link { color: var(--color-accent); font-weight: 600; text-decoration: none; font-size: 0.85rem; transition: 0.2s; }
    .resume-link:hover { color: var(--color-accent-hover); text-decoration: underline; }
    
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.85rem; }
    .btn-xs { padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 4px; }
    .export-btn { background: #f8fafc; border-color: #cbd5e1; }
    
    .success-banner { background: var(--color-success-bg); border: 1px solid #86efac; color: var(--color-success); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-weight: 500; font-size: 0.95rem; }
    .hint { color: var(--color-muted); font-size: 0.85rem; margin-top: 1rem; text-align: right; }
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

  /** Offered/rejected stay visible, but are locked out of bulk actions. */
  isBulkSelectable(app: Application): boolean {
    return app.status !== 'SELECTED' && app.status !== 'REJECTED';
  }

  get actionableSelection(): Application[] {
    return this.selection.selected.filter(a => this.isBulkSelectable(a));
  }

  get actionableSelectionCount(): number {
    return this.actionableSelection.length;
  }

  isAllSelected(): boolean {
    const selectable = this.applications.filter(a => this.isBulkSelectable(a));
    return selectable.length > 0 && this.actionableSelectionCount === selectable.length;
  }

  toggleAllRows() {
    const selectable = this.applications.filter(a => this.isBulkSelectable(a));
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.clear();
      this.selection.select(...selectable);
    }
  }

  bulkUpdate(status: ApplicationStatus) {
    const ids = this.actionableSelection.map(a => a.id);
    if (!ids.length) {
      this.message = 'No actionable applicants selected (offered/rejected are locked).';
      setTimeout(() => (this.message = ''), 3000);
      return;
    }
    if (!confirm(`Update ${ids.length} applicant(s) to ${status}?`)) return;

    this.api.bulkUpdateApplicationStatus(ids, status).subscribe({
      next: (res) => {
        const failed = res.failed.length ? ` (${res.failed.length} failed)` : '';
        this.message = `Updated ${res.updated} applicant(s) to ${status}${failed}`;
        this.load();
        setTimeout(() => (this.message = ''), 4000);
      }
    });
  }

  updateStatus(app: Application, status: ApplicationStatus) {
    if (app.status === 'SELECTED' || app.status === 'REJECTED') {
      this.message = 'This applicant is locked and cannot be changed.';
      setTimeout(() => (this.message = ''), 3000);
      return;
    }
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
    this.message = 'CSV export started successfully.';
    setTimeout(() => (this.message = ''), 3000);
  }
}