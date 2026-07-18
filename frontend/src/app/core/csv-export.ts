import { Application } from '../models';

function escapeCsv(value: string | number | null | undefined): string {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportApplicantsCsv(applications: Application[], postingId: number): void {
  const rows = applications
    .filter(a => a.status !== 'REJECTED')
    .map(a => [
      escapeCsv(a.studentName),
      escapeCsv(a.studentEmail),
      escapeCsv(a.studentCgpa),
      escapeCsv(a.studentBranch),
      escapeCsv(a.status),
      escapeCsv(a.resumeLink)
    ].join(','));

  const header = 'Name,Email,CGPA,Branch,Status,ResumeLink';
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `applicants-${postingId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
