import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './features/auth/login.component';
import { CompanyHomeComponent } from './features/company/company-home.component';
import { CompanyCreateComponent } from './features/company/company-create.component';
import { CompanyDetailComponent } from './features/company/company-detail.component';
import { StudentHomeComponent } from './features/student/student-home.component';
import { StudentJobDetailComponent } from './features/student/student-job-detail.component';
import { StudentApplicationsComponent } from './features/student/student-applications.component';
import { AdminPendingComponent } from './features/admin/admin-pending.component';
import { AdminAnalyticsComponent } from './features/admin/admin-analytics.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
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
