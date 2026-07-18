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
  template: `
    <app-page-header title="Job Approvals" subtitle="Review and approve roles before they become visible to students." />

    @if (message) { <div class="success-banner">{{ message }}</div> }

    <div class="split-layout">
      <!-- Left List Pane -->
      <div class="list-pane">
        @if (!postings.length) {
          <app-empty-state title="Queue clear" message="No postings awaiting approval." />
        } @else {
          <div class="queue-list">
            @for (p of postings; track p.id) {
              <button class="queue-item" [class.active]="selected?.id === p.id" (click)="select(p)">
                <div class="qi-header">
                  <strong>{{ p.title }}</strong>
                </div>
                <span class="company-name">{{ p.companyName }}</span>
                <app-status-chip [status]="p.status" />
              </button>
            }
          </div>
        }
      </div>

      <!-- Right Detail Pane -->
      <div class="detail-pane">
        @if (selected) {
          <div class="detail-card">
            <h3>{{ selected.title }}</h3>
            <p class="company-highlight">{{ selected.companyName }}</p>
            <div class="desc-box">{{ selected.description }}</div>
            
            <ul class="specs">
              <li><strong>Min CGPA:</strong> {{ selected.minCgpa }}</li>
              <li><strong>Branches:</strong> {{ selected.allowedBranches.join(', ') || 'All' }}</li>
              <li><strong>Deadline:</strong> {{ selected.deadline }}</li>
            </ul>
            
            <div class="actions">
              <button class="btn-primary" (click)="approve(selected)">Approve Posting</button>
            </div>
            
            <form [formGroup]="rejectForm" (ngSubmit)="reject()" class="reject-form">
              <label>Rejection reason</label>
              <textarea formControlName="reason" rows="2" placeholder="Explain why this posting is rejected..."></textarea>
              <button class="btn-danger" type="submit" [disabled]="rejectForm.invalid" style="margin-top: 0.5rem;">Reject Posting</button>
            </form>
          </div>
        } @else if (postings.length > 0) {
          <div class="placeholder-pane">
            <p>Select a posting from the list to review details.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .success-banner { background: var(--color-success-bg); border: 1px solid #86efac; color: var(--color-success); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-weight: 500; font-size: 0.9rem; }
    
    .split-layout { display: grid; grid-template-columns: 350px 1fr; gap: 1.5rem; align-items: start; }
    
    .list-pane { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); max-height: calc(100vh - 200px); overflow-y: auto; }
    .queue-list { display: flex; flex-direction: column; }
    .queue-item { display: block; width: 100%; text-align: left; background: transparent; border: none; border-bottom: 1px solid var(--color-border); padding: 1.25rem; cursor: pointer; transition: all 0.2s; }
    .queue-item:last-child { border-bottom: none; }
    .queue-item:hover { background: #f8fafc; }
    .queue-item.active { background: #eff6ff; border-left: 4px solid var(--color-accent); }
    .qi-header strong { font-size: 1rem; color: var(--color-ink); display: block; margin-bottom: 0.2rem; }
    .company-name { display: block; color: var(--color-muted); font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 500; }
    
    .detail-pane { min-height: 400px; }
    .detail-card { background: var(--color-panel); padding: 2rem; border-radius: var(--radius); border: 1px solid var(--color-border); box-shadow: var(--shadow); }
    .detail-card h3 { margin: 0 0 0.25rem 0; font-size: 1.5rem; color: var(--color-ink); }
    .company-highlight { color: var(--color-accent); font-weight: 600; margin: 0 0 1.5rem 0; font-size: 1rem; }
    .desc-box { background: #f8fafc; padding: 1.5rem; border-radius: 6px; border: 1px solid var(--color-border); color: var(--color-ink); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; }
    
    .specs { list-style: none; padding: 0; margin: 0 0 2rem 0; }
    .specs li { padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); font-size: 0.95rem; }
    .specs li strong { display: inline-block; width: 120px; color: var(--color-muted); }
    
    .actions { padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); margin-bottom: 1.5rem; }
    .reject-form label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--color-ink); }
    
    .placeholder-pane { display: flex; align-items: center; justify-content: center; height: 100%; min-height: 400px; background: var(--color-panel); border: 1px dashed var(--color-border); border-radius: var(--radius); color: var(--color-muted); font-size: 0.95rem; }

    @media (max-width: 900px) { .split-layout { grid-template-columns: 1fr; } }
  `]
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
    this.api.pendingPostings().subscribe(res => {
      this.postings = res.content;
      // If the currently selected item is no longer in the queue, clear it.
      if (this.selected && !this.postings.find(p => p.id === this.selected!.id)) {
        this.selected = undefined;
      }
    });
  }

  select(p: Posting) {
    this.selected = p;
    this.message = '';
    this.rejectForm.reset();
  }

  approve(p: Posting) {
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
}