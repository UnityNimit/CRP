import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Posting } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';
import { StatusChipComponent } from '../components/status-chip.component';
import { EmptyStateComponent } from '../components/empty-state.component';

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
  revisionForm = this.fb.group({ comment: ['', [Validators.required, Validators.minLength(5)]] });

  ngOnInit() { this.load(); }

  load() {
    this.api.pendingPostings().subscribe(res => {
      this.postings = res.content;
      if (this.selected && !this.postings.find(p => p.id === this.selected!.id)) {
        this.selected = undefined;
      }
    });
  }

  select(p: Posting) {
    this.selected = p;
    this.message = '';
    this.rejectForm.reset();
    this.revisionForm.reset();
  }

  approve(p: Posting) {
    const trust = p.companyTrust;
    if (trust?.riskLevel === 'HIGH') {
      const msg = `This company has HIGH trust risk (${trust.ghostRate}% ghost rate, ${trust.blackHoleRate}% black-hole). ${trust.summary}. Approve anyway?`;
      if (!confirm(msg)) return;
    }
    this.api.approvePosting(p.id).subscribe({
      next: () => { this.message = 'Posting approved successfully'; this.load(); }
    });
  }

  reject() {
    if (!this.selected || this.rejectForm.invalid) return;
    this.api.rejectPosting(this.selected.id, this.rejectForm.value.reason!).subscribe({
      next: () => { this.message = 'Posting rejected successfully'; this.load(); }
    });
  }

  requestRevision() {
    if (!this.selected || this.revisionForm.invalid) return;
    this.api.requestRevision(this.selected.id, this.revisionForm.value.comment!).subscribe({
      next: () => { this.message = 'Revision requested'; this.selected = undefined; this.load(); }
    });
  }

  isResubmitted(p: Posting): boolean {
    return !!p.resubmittedAt;
  }

  hasFieldChanges(p: Posting): boolean {
    return !!p.fieldChanges?.length;
  }

  showRiskPill(p: Posting): boolean {
    const risk = p.companyTrust?.riskLevel;
    return risk === 'HIGH' || risk === 'MEDIUM';
  }

  riskLabel(p: Posting): string {
    return p.companyTrust?.riskLevel ?? '';
  }
}
