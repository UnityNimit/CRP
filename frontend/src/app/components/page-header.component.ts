import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div>
        <h1>{{ title }}</h1>
        @if (subtitle) { <p>{{ subtitle }}</p> }
      </div>
      <div class="actions"><ng-content /></div>
    </header>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    h1 { margin: 0 0 0.35rem 0; font-size: 1.5rem; color: var(--color-ink); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; }
    p { margin: 0; color: var(--color-muted); font-size: 0.95rem; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}