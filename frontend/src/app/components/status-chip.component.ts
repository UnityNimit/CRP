import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="chip" [class]="statusClass">{{ label }}</span>`,
  styles: [`
    .chip {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      transition: background 0.18s ease, color 0.18s ease;
    }
    .pending { background: #fdf4e3; color: var(--color-warning); }
    .approved, .selected, .shortlisted { background: #e6f4ec; color: var(--color-success); }
    .rejected { background: #fdecea; color: var(--color-danger); }
    .closed, .applied { background: #eef2f6; color: var(--color-muted); }
  `]
})
export class StatusChipComponent {
  @Input() status = '';

  get label(): string {
    const map: Record<string, string> = {
      PENDING: 'Awaiting approval',
      APPROVED: 'Live',
      REJECTED: 'Rejected',
      CLOSED: 'Closed',
      APPLIED: 'Applied',
      SHORTLISTED: 'Shortlisted',
      SELECTED: 'Selected'
    };
    return map[this.status] || this.status;
  }

  get statusClass(): string {
    const s = this.status.toLowerCase();
    if (s === 'approved' || s === 'selected') return 'approved';
    if (s === 'shortlisted') return 'shortlisted';
    if (s === 'pending') return 'pending';
    if (s === 'rejected') return 'rejected';
    if (s === 'closed' || s === 'applied') return 'closed';
    return 'applied';
  }
}
