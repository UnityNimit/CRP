import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AnalyticsSummary,
  CompanyAnalyticsSummary,
  Application,
  ApplicationStatus,
  EligibilityTip,
  Notification,
  PageResponse,
  Posting,
  Company,              // <-- Use standard Company model
  StudentUploadResult,
  Student
} from '../models';

const API_URL = 'https://crp-b2xa.onrender.com/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ================= COMPANY ACTIONS =================

  createPosting(body: object) { return this.http.post<Posting>(`${API_URL}/postings`, body); }
  companyPostings(page = 0, size = 20) {
    return this.http.get<PageResponse<Posting>>(`${API_URL}/postings/company`, { params: new HttpParams().set('page', page).set('size', size) });
  }
  postingApplications(postingId: number, page = 0, size = 100) {
    return this.http.get<PageResponse<Application>>(`${API_URL}/company/postings/${postingId}/applications`, { params: new HttpParams().set('page', page).set('size', size) });
  }
  updateApplicationStatus(id: number, status: ApplicationStatus) { return this.http.patch<Application>(`${API_URL}/company/applications/${id}/status`, { status }); }
  closePosting(id: number) { return this.http.post<Posting>(`${API_URL}/postings/${id}/close`, {}); }
  companyAnalytics() { return this.http.get<CompanyAnalyticsSummary>(`${API_URL}/company/analytics/summary`); }

  // ================= STUDENT ACTIONS =================

  studentPostings(page = 0, size = 20) {
    return this.http.get<PageResponse<Posting>>(`${API_URL}/postings`, { params: new HttpParams().set('page', page).set('size', size) });
  }
  studentPosting(id: number) { return this.http.get<Posting>(`${API_URL}/postings/${id}`); }
  eligibility(id: number) { return this.http.get<EligibilityTip>(`${API_URL}/postings/${id}/eligibility`); }
  apply(postingId: number, resumeLink: string) { return this.http.post<Application>(`${API_URL}/student/applications`, { postingId, resumeLink }); }
  myApplications() { return this.http.get<PageResponse<Application>>(`${API_URL}/student/applications`); }

  // ================= ADMIN ACTIONS =================

  adminPostings(page = 0, size = 50) {
    return this.http.get<PageResponse<Posting>>(`${API_URL}/postings/admin`, { params: new HttpParams().set('page', page).set('size', size) });
  }
  approvePosting(id: number) {
    return this.http.patch<Posting>(`${API_URL}/postings/${id}/status`, null, { params: new HttpParams().set('status', 'APPROVED') });
  }
  rejectPosting(id: number, reason: string) {
    return this.http.patch<Posting>(`${API_URL}/postings/${id}/status`, null, { params: new HttpParams().set('status', 'REJECTED').set('remarks', reason) });
  }
  analytics() { return this.http.get<AnalyticsSummary>(`${API_URL}/admin/analytics/summary`); }
  
  allCompanies(page = 0, size = 50) {
    return this.http.get<PageResponse<Company>>(`${API_URL}/admin/companies`, { params: new HttpParams().set('page', page).set('size', size) });
  }
  approveCompanyProfile(id: number) { return this.http.post<void>(`${API_URL}/admin/companies/${id}/approve`, {}); }
  rejectCompanyProfile(id: number) { return this.http.post<void>(`${API_URL}/admin/companies/${id}/reject`, {}); }
  uploadStudentsCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<StudentUploadResult[]>(`${API_URL}/admin/students/upload`, formData);
  }
  getAllStudents(page = 0, size = 50) {
    return this.http.get<PageResponse<Student>>(`${API_URL}/admin/students`, { params: new HttpParams().set('page', page).set('size', size) });
  }

  // ================= SHARED ACTIONS =================

  notifications() { return this.http.get<PageResponse<Notification>>(`${API_URL}/notifications`); }
  markNotificationRead(id: number) { return this.http.patch<void>(`${API_URL}/notifications/${id}/read`, {}); }
}