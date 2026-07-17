import { Component, inject } from '@angular/core';
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
          @for (item of navItems(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.exact }">
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>
      <div class="main">
        <header class="topbar">
          <span class="welcome">Welcome, {{ auth.displayName }}</span>
          <button class="btn-secondary" (click)="logout()">Sign out</button>
        </header>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; background: var(--color-bg); color: var(--color-ink); }
    .sidebar { width: 260px; background: var(--color-panel); border-right: 1px solid var(--color-border); display: flex; flex-direction: column; padding: 2.5rem 1.5rem; }
    .brand { margin-bottom: 3rem; }
    .brand-name { font-size: 1.5rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: #fff; letter-spacing: -0.03em; }
    .brand-role { font-size: 0.75rem; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; padding: 0.2rem 0.5rem; background: #222; border-radius: 4px; display: inline-block; font-weight: 600; }
    nav { display: flex; flex-direction: column; gap: 0.5rem; }
    nav a { color: var(--color-muted); text-decoration: none; padding: 0.85rem 1rem; border-radius: 6px; font-size: 0.95rem; font-weight: 500; transition: all 0.2s; }
    nav a:hover { color: #fff; background: #1a1a1a; }
    nav a.active { background: #fff; color: #000; font-weight: 600; }
    .main { flex: 1; display: flex; flex-direction: column; }
    .topbar { height: 70px; display: flex; justify-content: space-between; align-items: center; padding: 0 3rem; border-bottom: 1px solid var(--color-border); background: var(--color-panel); }
    .welcome { font-size: 0.9rem; color: var(--color-muted); }
    .content { padding: 3rem; flex: 1; overflow-y: auto; background: var(--color-bg); }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  router = inject(Router);

  navItems() {
    const role = this.auth.role;
    if (role === 'COMPANY') {
      return [
        { path: '/company', label: 'Postings', exact: true },
        { path: '/company/new', label: 'New posting', exact: false }
      ];
    }
    if (role === 'STUDENT') {
      return [
        { path: '/student', label: 'Browse roles', exact: true },
        { path: '/student/applications', label: 'My applications', exact: false }
      ];
    }
    return [
      { path: '/admin', label: 'Job Approvals', exact: true },
      { path: '/admin/companies', label: 'Recruiters', exact: false },
      { path: '/admin/students', label: 'Students', exact: false },
      { path: '/admin/analytics', label: 'Analytics', exact: false }
    ];
  }

  logout() {
    this.auth.logout();
  }
}