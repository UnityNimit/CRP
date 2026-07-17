import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Application, ApplicationStatus } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatusChipComponent],
  templateUrl: './company-detail.component.html'
})
export class CompanyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  postingId = 0;
  applications: Application[] = [];
  message = '';

  ngOnInit() {
    this.postingId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.api.postingApplications(this.postingId).subscribe(res => (this.applications = res.content));
  }

  updateStatus(app: Application, status: ApplicationStatus) {
    this.api.updateApplicationStatus(app.id, status).subscribe({
      next: () => {
        this.message = 'Status updated';
        this.load();
      }
    });
  }
}
