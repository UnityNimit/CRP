import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Application, ApplicationStatus } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { EmptyStateComponent } from '../components/empty-state.component';

interface KanbanColumn {
  status: ApplicationStatus;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './student-applications.component.html',
  styleUrl: './student-applications.component.scss'
})
export class StudentApplicationsComponent implements OnInit {
  private api = inject(ApiService);
  applications: Application[] = [];
  loading = true;

  columns: KanbanColumn[] = [
    { status: 'APPLIED', title: 'Applied', subtitle: 'Under company review' },
    { status: 'SHORTLISTED', title: 'Shortlisted for Interview', subtitle: 'Company is interested' },
    { status: 'SELECTED', title: 'Offered', subtitle: 'Congratulations!' },
    { status: 'REJECTED', title: 'Rejected', subtitle: 'Not moving forward' }
  ];

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.loading = true;
    this.api.myApplications().subscribe({
      next: res => {
        this.applications = res.content;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  forColumn(status: ApplicationStatus): Application[] {
    return this.applications.filter(a => a.status === status);
  }
}
