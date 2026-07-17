import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { StudentUploadResult } from '../models';
import { PageHeaderComponent } from '../components/page-header.component';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Student Management" subtitle="Bulk upload student profiles from the university database via CSV." />

    <div class="upload-panel">
      <div class="instructions">
        <h3>CSV Format Requirements</h3>
        <p>Ensure your file has a header row and exactly 8 columns in this order:</p>
        <code>Email, FullName, Branch, CGPA, GradYear, FathersName, Attendance, ActiveBacklogs</code>
      </div>

      <div class="file-action">
        <input type="file" #fileInput accept=".csv" (change)="onFileSelected($event)" hidden />
        <button class="btn-primary upload-btn" (click)="fileInput.click()" [disabled]="loading">
          {{ loading ? 'Processing...' : 'Select CSV & Upload' }}
        </button>
        @if (selectedFile) { <span class="file-name">{{ selectedFile.name }}</span> }
      </div>
      @if (error) { <p class="error-text">{{ error }}</p> }
    </div>

    @if (results.length > 0) {
      <div class="results-panel">
        <div class="results-header">
          <h3>Upload Report</h3>
          <button class="btn-secondary" (click)="downloadReport()">Download Report</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Generated Password</th>
            </tr>
          </thead>
          <tbody>
            @for (r of results; track r.email) {
              <tr>
                <td>{{ r.email }}</td>
                <td><span [class]="r.status === 'CREATED' ? 'text-success' : 'text-warning'">{{ r.status }}</span></td>
                <td><code>{{ r.generatedPassword }}</code></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .upload-panel { background: var(--color-panel); border: 1px dashed var(--color-border); border-radius: var(--radius); padding: 2rem; margin-bottom: 2rem; }
    .instructions h3 { margin-top: 0; color: var(--color-ink); }
    .instructions p { color: var(--color-muted); font-size: 0.95rem; }
    code { background: #1a1a1a; padding: 0.5rem 1rem; border-radius: 4px; display: block; margin: 1rem 0; font-family: monospace; color: #4ade80; border: 1px solid #333; }
    .file-action { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; }
    .upload-btn { padding: 0.75rem 1.5rem; }
    .file-name { color: var(--color-muted); font-size: 0.9rem; }
    .error-text { color: var(--color-danger); margin-top: 1rem; }
    .results-panel { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; }
    .results-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid var(--color-border); }
    .results-header h3 { margin: 0; }
    .text-success { color: var(--color-success); font-weight: 600; }
    .text-warning { color: var(--color-warning); font-weight: 600; }
    td code { display: inline-block; padding: 0.2rem 0.5rem; margin: 0; background: #000; }
  `]
})
export class AdminStudentsComponent {
  private api = inject(ApiService);
  
  selectedFile: File | null = null;
  loading = false;
  error = '';
  results: StudentUploadResult[] = [];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.upload();
    }
  }

  upload() {
    if (!this.selectedFile) return;
    this.loading = true;
    this.error = '';
    this.results = [];

    this.api.uploadStudentsCsv(this.selectedFile).subscribe({
      next: (res) => {
        this.results = res;
        this.loading = false;
        this.selectedFile = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to process CSV file.';
        this.loading = false;
        this.selectedFile = null;
      }
    });
  }

  downloadReport() {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Status,Password\n" 
      + this.results.map(e => `${e.email},${e.status},${e.generatedPassword}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_accounts_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}