import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Application } from '../../core/models';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { StatusChipComponent } from '../../shared/status-chip.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatusChipComponent, EmptyStateComponent],
  templateUrl: './student-applications.component.html'
})
export class StudentApplicationsComponent implements OnInit {
  private api = inject(ApiService);
  applications: Application[] = [];

  ngOnInit() {
    this.api.myApplications().subscribe(res => (this.applications = res.content));
  }
}
