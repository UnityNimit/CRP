import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
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
      { path: '/admin', label: 'Pending queue', exact: true },
      { path: '/admin/analytics', label: 'Analytics', exact: false }
    ];
  }

  logout() {
    this.auth.logout();
  }
}
