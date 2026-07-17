import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Posting } from '../../core/models';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { StatusChipComponent } from '../../shared/status-chip.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-admin-pending',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusChipComponent, EmptyStateComponent],
  templateUrl: './admin-pending.component.html'
})
export class AdminPendingComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  postings: Posting[] = [];
  selected?: Posting;
  message = '';
  rejectForm = this.fb.group({ reason: ['', [Validators.required, Validators.minLength(5)]] });

  ngOnInit() { this.load(); }

  load() {
    this.api.pendingPostings().subscribe(res => (this.postings = res.content));
  }

  select(p: Posting) {
    this.selected = p;
    this.message = '';
    this.rejectForm.reset();
  }

  approve(p: Posting) {
    this.api.approvePosting(p.id).subscribe({
      next: () => { this.message = 'Posting approved'; this.selected = undefined; this.load(); }
    });
  }

  reject() {
    if (!this.selected || this.rejectForm.invalid) return;
    this.api.rejectPosting(this.selected.id, this.rejectForm.value.reason!).subscribe({
      next: () => { this.message = 'Posting rejected'; this.selected = undefined; this.load(); }
    });
  }
}
