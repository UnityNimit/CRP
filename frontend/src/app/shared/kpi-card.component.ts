import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="kpi">
      <span class="label">{{ label }}</span>
      <strong class="value">{{ value }}</strong>
      @if (hint) { <small>{{ hint }}</small> }
    </div>
  `,
  styles: [`
    .kpi {
      background: var(--color-panel);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: 1rem 1.1rem;
      box-shadow: var(--shadow);
    }
    .label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-muted);
      margin-bottom: 0.35rem;
    }
    .value {
      font-family: var(--font-display);
      font-size: 1.75rem;
      color: var(--color-ink);
    }
    small {
      display: block;
      margin-top: 0.35rem;
      color: var(--color-muted);
      font-size: 0.8rem;
    }
  `]
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() hint = '';
}
