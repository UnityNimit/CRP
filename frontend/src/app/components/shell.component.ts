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
          @for (item of navItems(); track item.label) {
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
    .shell { display: flex; min-height: 100vh; color: var(--color-ink); }
    .sidebar {
      width: 278px;
      background: linear-gradient(180deg, rgba(8, 15, 30, 0.96), rgba(15, 23, 42, 0.82));
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 2.25rem 1.4rem;
      backdrop-filter: blur(18px);
    }
    .brand { margin-bottom: 2.5rem; }
    .brand-name {
      font-size: 1.5rem;
      font-weight: 800;
      display: block;
      margin-bottom: 0.35rem;
      letter-spacing: -0.05em;
    }
    .brand-role {
      font-size: 0.72rem;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      padding: 0.35rem 0.6rem;
      background: rgba(148, 163, 184, 0.12);
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 999px;
      display: inline-block;
      font-weight: 700;
    }
    nav { display: flex; flex-direction: column; gap: 0.55rem; }
    nav a {
      color: var(--color-muted);
      text-decoration: none;
      padding: 0.9rem 1rem;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 500;
      transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
      display: block;
      border: 1px solid transparent;
    }
    nav a:hover { color: #fff; background: rgba(148, 163, 184, 0.10); transform: translateX(2px); }
    nav a.active {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(226, 232, 240, 0.88));
      color: #08111f;
      border-color: rgba(255, 255, 255, 0.28);
      font-weight: 700;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24);
    }
    .main { flex: 1; display: flex; flex-direction: column; }
    .topbar {
      min-height: 78px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2.5rem;
      border-bottom: 1px solid var(--color-border);
      background: rgba(8, 15, 30, 0.7);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .welcome { font-size: 0.92rem; color: #cbd5e1; }
    .content { padding: 2.5rem; flex: 1; overflow-y: auto; }
    @media (max-width: 980px) {
      .shell { flex-direction: column; }
      .sidebar { width: 100%; }
      .topbar { padding: 0 1.25rem; }
      .content { padding: 1.25rem; }
    }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  router = inject(Router);

  navItems() {
    const role = this.auth.role;
    if (role === 'COMPANY') {
      return [
        { path: ['/company'], label: 'Postings', exact: true },
        { path: ['/company', 'new'], label: 'New posting', exact: false }
      ];
    }
    if (role === 'STUDENT') {
      return [
        { path: ['/student'], label: 'Browse roles', exact: true },
        { path: ['/student', 'applications'], label: 'My applications', exact: false }
      ];
    }
    // FIX: Using exact route arrays ensures Angular never gets lost
    return [
      { path: ['/admin'], label: 'Job Approvals', exact: true },
      { path: ['/admin', 'companies'], label: 'Recruiters', exact: false },
      { path: ['/admin', 'students'], label: 'Students', exact: false },
      { path: ['/admin', 'analytics'], label: 'Analytics', exact: false }
    ];
  }

  logout() {
    this.auth.logout();
  }
}