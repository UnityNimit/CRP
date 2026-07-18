import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="chip" [class]="statusClass">{{ label }}</span>`,
  styles: [`
    .chip { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em; }
    .pending { background: var(--color-warning-bg); color: var(--color-warning); }
    .approved, .selected, .shortlisted { background: var(--color-success-bg); color: var(--color-success); }
    .rejected { background: var(--color-danger-bg); color: var(--color-danger); }
    .closed, .applied { background: #f1f5f9; color: var(--color-muted); }
  `]
})
export class StatusChipComponent {
  @Input() status = '';
  get label(): string {
    const map: Record<string, string> = { PENDING: 'Reviewing', APPROVED: 'Live', REJECTED: 'Rejected', CLOSED: 'Closed', APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', SELECTED: 'Selected' };
    return map[this.status] || this.status;
  }
  get statusClass(): string {
    const s = this.status.toLowerCase();
    if (s === 'approved' || s === 'selected') return 'approved';
    if (s === 'shortlisted') return 'shortlisted';
    if (s === 'pending') return 'pending';
    if (s === 'rejected') return 'rejected';
    return 'closed';
  }
}