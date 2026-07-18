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
      padding: 0.35rem 0.72rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
      border: 1px solid transparent;
    }
    .pending { background: rgba(251, 191, 36, 0.12); color: #fbbf24; border-color: rgba(251, 191, 36, 0.18); }
    .approved, .selected, .shortlisted { background: rgba(52, 211, 153, 0.12); color: #34d399; border-color: rgba(52, 211, 153, 0.18); }
    .rejected { background: rgba(251, 113, 133, 0.10); color: #fb7185; border-color: rgba(251, 113, 133, 0.18); }
    .closed, .applied { background: rgba(148, 163, 184, 0.10); color: #cbd5e1; border-color: rgba(148, 163, 184, 0.16); }
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
