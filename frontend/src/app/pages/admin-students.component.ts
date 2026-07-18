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
          {{ loading ? 'Processing Server Upload...' : 'Select CSV & Upload' }}
        </button>
        @if (selectedFile) { <span class="file-name">{{ selectedFile.name }}</span> }
      </div>
      @if (error) { <div class="error-banner">{{ error }}</div> }
    </div>

    @if (results.length > 0) {
      <div class="results-panel">
        <div class="results-header">
          <h3>System Upload Report</h3>
          <button class="btn-secondary" (click)="downloadReport()">Download Passwords</button>
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
                <td><code class="pass-code">{{ r.generatedPassword }}</code></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .upload-panel { background: var(--color-panel); border: 2px dashed #cbd5e1; border-radius: var(--radius); padding: 2.5rem; margin-top: 1.5rem; margin-bottom: 2rem; box-shadow: var(--shadow-sm); transition: border-color 0.2s; }
    .upload-panel:hover { border-color: var(--color-accent); }
    
    .instructions h3 { margin-top: 0; color: var(--color-ink); font-size: 1.15rem; font-weight: 600; }
    .instructions p { color: var(--color-muted); font-size: 0.95rem; margin-bottom: 1rem; }
    code { background: #f1f5f9; padding: 0.5rem 0.8rem; border-radius: 6px; display: inline-block; margin: 1rem 0; font-family: monospace; color: var(--color-ink); border: 1px solid var(--color-border); font-size: 0.85rem; }
    
    .file-action { display: flex; align-items: center; gap: 1.5rem; margin-top: 1.5rem; }
    .upload-btn { padding: 0.75rem 1.5rem; font-size: 0.95rem; }
    .file-name { color: var(--color-muted); font-size: 0.95rem; font-weight: 500; }
    
    .error-banner { background: var(--color-danger-bg); border: 1px solid #fca5a5; color: var(--color-danger); padding: 1rem; border-radius: 6px; font-size: 0.9rem; margin-top: 1.5rem; font-weight: 500; }
    
    .results-panel { background: var(--color-panel); border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
    .results-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-border); background: #f8fafc; }
    .results-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--color-ink); }
    
    .text-success { color: var(--color-success); font-weight: 600; font-size: 0.85rem; }
    .text-warning { color: var(--color-warning); font-weight: 600; font-size: 0.85rem; }
    .pass-code { display: inline-block; padding: 0.25rem 0.5rem; margin: 0; background: #ffffff; border: 1px solid var(--color-border); color: var(--color-ink); border-radius: 4px; font-weight: 500; }
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
        this.error = err.error?.message || 'Failed to process CSV file. Ensure exactly 8 columns exist.';
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