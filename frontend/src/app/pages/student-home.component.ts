import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// FIX: Corrected all import paths
import { ApiService } from '../core/api.service';
import { Posting } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { EmptyStateComponent } from '../components/empty-state.component';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './student-home.component.html'
})
export class StudentHomeComponent implements OnInit {
  private api = inject(ApiService);
  postings: Posting[] = [];
  loading = true;

  ngOnInit() {
    this.api.studentPostings().subscribe({
      next: res => { this.postings = res.content; this.loading = false; },
      error: () => (this.loading = false)
    });
  }
}