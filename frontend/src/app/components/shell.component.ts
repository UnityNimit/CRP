import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-name">CRP.</span>
          <span class="brand-role">{{ auth.role }}</span>
        </div>
        <nav>
          @for (item of navItems(); track item.label) {
            <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.exact }">
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>
      <div class="main">
        <header class="topbar">
          <span class="welcome">Welcome back, <strong>{{ auth.displayName }}</strong></span>
          <button class="btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" (click)="logout()">Sign out</button>
        </header>
        <main class="content"><router-outlet></router-outlet></main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; background: var(--color-bg); }
    .sidebar { width: 260px; background: var(--color-panel); border-right: 1px solid var(--color-border); display: flex; flex-direction: column; padding: 2rem 1.5rem; z-index: 10; }
    .brand { margin-bottom: 2.5rem; padding: 0 0.5rem; }
    .brand-name { font-size: 1.5rem; font-weight: 800; display: block; margin-bottom: 0.25rem; color: var(--color-ink); letter-spacing: -0.03em; }
    .brand-role { font-size: 0.7rem; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.05em; padding: 0.2rem 0.5rem; background: #eff6ff; border-radius: 4px; display: inline-block; font-weight: 600; }
    nav { display: flex; flex-direction: column; gap: 0.25rem; }
    nav a { color: var(--color-muted); text-decoration: none; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; font-weight: 500; transition: all 0.2s ease; display: block; }
    nav a:hover { color: var(--color-ink); background: #f1f5f9; }
    nav a.active { background: #eff6ff; color: var(--color-accent); font-weight: 600; }
    .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .topbar { height: 64px; display: flex; justify-content: space-between; align-items: center; padding: 0 2.5rem; border-bottom: 1px solid var(--color-border); background: var(--color-panel); z-index: 5; box-shadow: var(--shadow-sm); }
    .welcome { font-size: 0.9rem; color: var(--color-muted); }
    .welcome strong { color: var(--color-ink); font-weight: 600; }
    .content { padding: 2.5rem; flex: 1; overflow-y: auto; background: var(--color-bg); }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  router = inject(Router);

  navItems() {
    const role = this.auth.role;
    if (role === 'COMPANY') return [ { path: ['/company'], label: 'Dashboard', exact: true }, { path: ['/company', 'new'], label: 'Post a Role', exact: false } ];
    if (role === 'STUDENT') return [ { path: ['/student'], label: 'Browse Jobs', exact: true }, { path: ['/student', 'applications'], label: 'My Applications', exact: false } ];
    return [ { path: ['/admin'], label: 'Job Approvals', exact: true }, { path: ['/admin', 'companies'], label: 'Recruiters', exact: false }, { path: ['/admin', 'students'], label: 'Students', exact: false }, { path: ['/admin', 'analytics'], label: 'Analytics', exact: false } ];
  }
  logout() { this.auth.logout(); }
}