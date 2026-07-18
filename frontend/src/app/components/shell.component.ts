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
            <div class="user-profile">
              <span class="brand-role">{{ auth.role }}</span>
              <span class="user-name">{{ auth.displayName }}</span>
            </div>
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
    .shell { display: flex; height: 100vh; overflow: hidden; background: var(--color-bg); }
    
    .sidebar { width: 280px; background: var(--color-panel); border-right: 1px solid var(--color-border); display: flex; flex-direction: column; justify-content: space-between; padding: 2.5rem 1.5rem; z-index: 10; }
    
    .brand { margin-bottom: 2.5rem; padding: 0 0.5rem; }
    .brand-name { font-size: 1.35rem; font-weight: 800; display: block; margin-bottom: 1rem; color: var(--color-ink); letter-spacing: -0.03em; line-height: 1.2; }
    
    .user-profile { display: flex; align-items: center; gap: 0.75rem; }
    .brand-role { font-size: 0.65rem; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.05em; padding: 0.25rem 0.5rem; background: #eff6ff; border-radius: 4px; font-weight: 700; }
    .user-name { font-size: 0.95rem; font-weight: 600; color: var(--color-ink); }
    
    nav { display: flex; flex-direction: column; gap: 0.35rem; }
    nav a { color: var(--color-muted); text-decoration: none; padding: 0.8rem 1rem; border-radius: 6px; font-size: 0.95rem; font-weight: 500; transition: all 0.2s ease; display: block; }
    nav a:hover { color: var(--color-ink); background: #f1f5f9; }
    nav a.active { background: #eff6ff; color: var(--color-accent); font-weight: 600; }
    
    .sidebar-bottom { padding: 0 0.5rem; }
    .btn-logout { width: 100%; padding: 0.85rem; background: transparent; border: 1px solid var(--color-border); color: var(--color-muted); border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; }
    .btn-logout:hover { background: var(--color-danger-bg); color: var(--color-danger); border-color: #fca5a5; }

    .main-content { flex: 1; overflow-y: auto; padding: 3rem 4rem; background: var(--color-bg); }
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