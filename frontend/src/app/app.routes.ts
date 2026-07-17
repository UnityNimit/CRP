import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth.guard';
import { ShellComponent } from './components/shell.component';

import { LoginComponent } from './pages/login.component';
import { CompanyHomeComponent } from './pages/company-home.component';
import { CompanyCreateComponent } from './pages/company-create.component';
import { CompanyDetailComponent } from './pages/company-detail.component';
import { StudentHomeComponent } from './pages/student-home.component';
import { StudentJobDetailComponent } from './pages/student-job-detail.component';
import { StudentApplicationsComponent } from './pages/student-applications.component';
import { AdminPendingComponent } from './pages/admin-pending.component';
import { AdminAnalyticsComponent } from './pages/admin-analytics.component';
import { CompanyRegisterComponent } from './pages/company-register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'company-register', component: CompanyRegisterComponent, canActivate: [guestGuard] },
  {
    path: 'company',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard('COMPANY')],
    children: [
      { path: '', component: CompanyHomeComponent },
      { path: 'new', component: CompanyCreateComponent },
      { path: 'postings/:id', component: CompanyDetailComponent }
    ]
  },
  {
    path: 'student',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard('STUDENT')],
    children: [
      { path: '', component: StudentHomeComponent },
      { path: 'jobs/:id', component: StudentJobDetailComponent },
      { path: 'applications', component: StudentApplicationsComponent }
    ]
  },
  {
    path: 'admin',
    component: ShellComponent,
    canActivate: [authGuard, roleGuard('ADMIN')],
    children: [
      { path: '', component: AdminPendingComponent },
      { path: 'analytics', component: AdminAnalyticsComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];