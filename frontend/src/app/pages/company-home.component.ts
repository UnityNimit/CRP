import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Posting } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';
import { EmptyStateComponent } from '../components/empty-state.component';

@Component({
  selector: 'app-company-home',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusChipComponent, EmptyStateComponent],
  templateUrl: './company-home.component.html'
})
export class CompanyHomeComponent implements OnInit {
  private api = inject(ApiService);
  postings: Posting[] = [];
  loading = true;

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.loading = true;
    this.api.companyPostings().subscribe({
      next: res => { this.postings = res.content; this.loading = false; },
      error: () => (this.loading = false)
    });
  }

  close(p: Posting) {
    if (!confirm(`Close posting "${p.title}"? Students will no longer be able to apply.`)) return;
    this.api.closePosting(p.id).subscribe({ next: () => this.reload() });
  }
}
