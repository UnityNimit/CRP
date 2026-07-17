import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AnalyticsSummary,
  Application,
  ApplicationStatus,
  EligibilityTip,
  Notification,
  PageResponse,
  Posting
} from '../models';

// Pointing directly to your live production backend
const API_URL = 'https://crp-b2xa.onrender.com/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ================= COMPANY ACTIONS =================

  createPosting(body: object) {
    return this.http.post<Posting>(`${API_URL}/postings`, body);
  }

  companyPostings(page = 0, size = 20) {
    return this.http.get<PageResponse<Posting>>(`${API_URL}/postings/company`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  postingApplications(postingId: number) {
    return this.http.get<PageResponse<Application>>(`${API_URL}/company/postings/${postingId}/applications`);
  }

  updateApplicationStatus(id: number, status: ApplicationStatus) {
    return this.http.patch<Application>(`${API_URL}/company/applications/${id}/status`, { status });
  }

  closePosting(id: number) {
    // Note: The UI calls this, but we need to add the endpoint to the backend JobPostingController later.
    return this.http.post<Posting>(`${API_URL}/postings/${id}/close`, {});
  }

  // ================= STUDENT ACTIONS =================

  studentPostings(page = 0, size = 20) {
    return this.http.get<PageResponse<Posting>>(`${API_URL}/postings`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  apply(postingId: number, coverNote: string) {
    return this.http.post<Application>(`${API_URL}/student/applications`, { postingId, coverNote });
  }

  myApplications() {
    return this.http.get<PageResponse<Application>>(`${API_URL}/student/applications`);
  }

  studentPosting(id: number) {
    // Note: We will need to add a GET /postings/{id} to JobPostingController to fetch single details.
    return this.http.get<Posting>(`${API_URL}/postings/${id}`);
  }

  eligibility(id: number) {
    // Note: Placeholder for the AI Eligibility check feature.
    return this.http.get<EligibilityTip>(`${API_URL}/postings/${id}/eligibility`);
  }

  // ================= ADMIN ACTIONS =================

  pendingPostings(page = 0, size = 20) {
    return this.http.get<PageResponse<Posting>>(`${API_URL}/postings/admin`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  approvePosting(id: number) {
    return this.http.patch<Posting>(`${API_URL}/postings/${id}/status`, null, {
      params: new HttpParams().set('status', 'APPROVED')
    });
  }

  rejectPosting(id: number, reason: string) {
    return this.http.patch<Posting>(`${API_URL}/postings/${id}/status`, null, {
      params: new HttpParams().set('status', 'REJECTED').set('remarks', reason)
    });
  }

  analytics() {
    return this.http.get<AnalyticsSummary>(`${API_URL}/admin/analytics/summary`);
  }

  adminPosting(id: number) {
    return this.http.get<Posting>(`${API_URL}/postings/${id}`);
  }

  // ================= SHARED ACTIONS =================

  notifications() {
    return this.http.get<PageResponse<Notification>>(`${API_URL}/notifications`);
  }

  markNotificationRead(id: number) {
    return this.http.patch<void>(`${API_URL}/notifications/${id}/read`, {});
  }
}