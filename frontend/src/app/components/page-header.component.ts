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
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }
    h1 {
      margin: 0 0 0.25rem 0;
      font-size: clamp(1.8rem, 2.8vw, 2.6rem);
      letter-spacing: -0.04em;
    }
    p { margin: 0; color: var(--color-muted); max-width: 68ch; line-height: 1.6; }
    .actions { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
