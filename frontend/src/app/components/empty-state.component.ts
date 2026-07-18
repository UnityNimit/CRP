import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty {
      text-align: center;
      padding: 3.5rem 1rem;
      color: var(--color-muted);
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(8, 15, 30, 0.82));
      border-radius: 24px;
      border: 1px dashed rgba(148, 163, 184, 0.22);
      box-shadow: var(--shadow-soft);
    }
    h3 { color: var(--color-ink); margin-bottom: 0.4rem; }
    p { max-width: 50ch; margin: 0 auto; line-height: 1.6; }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() message = 'Check back later.';
}
