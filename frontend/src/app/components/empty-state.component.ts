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
      padding: 3rem 1rem;
      color: var(--color-muted);
      background: var(--color-panel);
      border-radius: var(--radius);
      border: 1px dashed var(--color-border);
    }
    h3 { color: var(--color-ink); }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() message = 'Check back later.';
}
