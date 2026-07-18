import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="chip" [class]="statusClass">{{ label }}</span>`,
  styles: [`
    .chip { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em; }
    .draft { background: #f1f5f9; color: var(--color-muted); }
    .pending, .pending-review { background: var(--color-warning-bg); color: var(--color-warning); }
    .needs-revision { background: #fff7ed; color: #c2410c; }
    .approved, .selected, .shortlisted { background: var(--color-success-bg); color: var(--color-success); }
    .rejected { background: var(--color-danger-bg); color: var(--color-danger); }
    .closed, .applied { background: #f1f5f9; color: var(--color-muted); }
  `]
})
export class StatusChipComponent {
  @Input() status = '';
  get label(): string {
    const map: Record<string, string> = {
      DRAFT: 'Draft',
      PENDING_REVIEW: 'Awaiting review',
      NEEDS_REVISION: 'Needs revision',
      APPROVED: 'Live',
      REJECTED: 'Rejected',
      CLOSED: 'Closed',
      APPLIED: 'Under review',
      SHORTLISTED: 'Shortlisted',
      SELECTED: 'Offered'
    };
    return map[this.status] || this.status;
  }
  get statusClass(): string {
    const s = this.status.toLowerCase().replace(/_/g, '-');
    if (s === 'approved' || s === 'selected') return 'approved';
    if (s === 'shortlisted') return 'shortlisted';
    if (s === 'draft') return 'draft';
    if (s === 'pending' || s === 'pending-review') return 'pending-review';
    if (s === 'needs-revision') return 'needs-revision';
    if (s === 'rejected') return 'rejected';
    return 'closed';
  }
}
