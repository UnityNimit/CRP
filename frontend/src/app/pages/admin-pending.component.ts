import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { AnalyticsSummary, Posting } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';
import { EmptyStateComponent } from '../components/empty-state.component';
import { KpiCardComponent } from '../components/kpi-card.component';

@Component({
  selector: 'app-admin-pending',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusChipComponent, EmptyStateComponent, KpiCardComponent],
  templateUrl: './admin-pending.component.html'
})
export class AdminPendingComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  postings: Posting[] = [];
  summary?: AnalyticsSummary;
  selected?: Posting;
  message = '';
  searchTerm = '';
  rejectForm = this.fb.group({ reason: ['', [Validators.required, Validators.minLength(5)]] });

  ngOnInit() {
    this.load();
    this.loadSummary();
  }

  load() {
    this.api.pendingPostings().subscribe(res => (this.postings = res.content));
  }

  loadSummary() {
    this.api.analytics().subscribe(summary => (this.summary = summary));
  }

  select(p: Posting) {
    this.selected = p;
    this.message = '';
    this.rejectForm.reset();
  }

  approve(p: Posting) {
    this.api.approvePosting(p.id).subscribe({
      next: () => { this.message = 'Posting approved'; this.selected = undefined; this.load(); this.loadSummary(); }
    });
  }

  reject() {
    if (!this.selected || this.rejectForm.invalid) return;
    this.api.rejectPosting(this.selected.id, this.rejectForm.value.reason!).subscribe({
      next: () => { this.message = 'Posting rejected'; this.selected = undefined; this.load(); this.loadSummary(); }
    });
  }

  visiblePostings() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.postings;

    return this.postings.filter(posting =>
      [posting.title, posting.companyName, posting.description, posting.allowedBranches.join(' ')]
        .some(value => value.toLowerCase().includes(term))
    );
  }
}
