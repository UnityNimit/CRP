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
        <div class="sidebar-top">
          <div class="brand">
            <span class="brand-name">Campus Recruiting Portal</span>
            <span class="user-name">Welcome {{ auth.displayName }}</span>
          </div>
          <nav>
            @for (item of navItems(); track item.label) {
              <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.exact }">
                {{ item.label }}
              </a>
            }
          </nav>
        </div>
        <div class="sidebar-bottom">
          <button class="btn-logout" (click)="logout()">Sign out</button>
        </div>
      </aside>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; background: var(--color-bg); font-family: var(--font-display); }
    
    .sidebar { width: 260px; background: var(--color-panel); border-right: 1px solid var(--color-border); display: flex; flex-direction: column; justify-content: space-between; padding: 2.5rem 2rem; z-index: 10; }
    
    .brand { margin-bottom: 2.5rem; }
    .brand-name { font-size: 1.15rem; font-weight: 700; display: block; color: var(--color-ink); letter-spacing: -0.02em; line-height: 1.3; margin-bottom: 0.25rem; }
    .user-name { font-size: 0.85rem; font-weight: 400; color: var(--color-muted); }
    
    nav { display: flex; flex-direction: column; gap: 0.25rem; }
    nav a { color: var(--color-muted); text-decoration: none; padding: 0.6rem 0.8rem; border-radius: 6px; font-size: 0.9rem; font-weight: 500; transition: all 0.2s ease; display: block; }
    nav a:hover { color: var(--color-ink); background: #f8fafc; }
    nav a.active { background: #f1f5f9; color: var(--color-ink); font-weight: 600; }
    
    .btn-logout { width: 100%; text-align: left; padding: 0.6rem 0.8rem; background: transparent; border: none; color: var(--color-muted); font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; border-radius: 6px; }
    .btn-logout:hover { color: var(--color-ink); background: #f8fafc; }

    .main-content { flex: 1; overflow-y: auto; padding: 2.5rem 3.5rem; background: var(--color-bg); }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  router = inject(Router);

  navItems() {
    const role = this.auth.role;
    if (role === 'COMPANY') return [ { path: ['/company'], label: 'Dashboard', exact: true }, { path: ['/company', 'new'], label: 'Post a Role', exact: false } ];
    if (role === 'STUDENT') return [ { path: ['/student'], label: 'Browse Jobs', exact: true }, { path: ['/student', 'applications'], label: 'My Applications', exact: false } ];
    return [ { path: ['/admin'], label: 'Job Directory', exact: true }, { path: ['/admin', 'companies'], label: 'Recruiters', exact: false }, { path: ['/admin', 'students'], label: 'Students', exact: false }, { path: ['/admin', 'analytics'], label: 'Analytics', exact: false } ];
  }
  logout() { this.auth.logout(); }
}