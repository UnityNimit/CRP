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
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = '/api/v1';

  constructor(private http: HttpClient) {}

  // Company
  createPosting(body: object) {
    return this.http.post<Posting>(`${this.api}/company/postings`, body);
  }

  companyPostings(page = 0, size = 20) {
    return this.http.get<PageResponse<Posting>>(`${this.api}/company/postings`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  closePosting(id: number) {
    return this.http.post<Posting>(`${this.api}/company/postings/${id}/close`, {});
  }

  postingApplications(postingId: number) {
    return this.http.get<PageResponse<Application>>(`${this.api}/company/postings/${postingId}/applications`);
  }

  updateApplicationStatus(id: number, status: ApplicationStatus) {
    return this.http.patch<Application>(`${this.api}/company/applications/${id}/status`, { status });
  }

  // Student
  studentPostings(page = 0, size = 20) {
    return this.http.get<PageResponse<Posting>>(`${this.api}/student/postings`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  studentPosting(id: number) {
    return this.http.get<Posting>(`${this.api}/student/postings/${id}`);
  }

  eligibility(id: number) {
    return this.http.get<EligibilityTip>(`${this.api}/student/postings/${id}/eligibility`);
  }

  apply(postingId: number, coverNote: string) {
    return this.http.post<Application>(`${this.api}/student/applications`, { postingId, coverNote });
  }

  myApplications() {
    return this.http.get<PageResponse<Application>>(`${this.api}/student/applications`);
  }

  // Admin
  pendingPostings() {
    return this.http.get<PageResponse<Posting>>(`${this.api}/admin/postings/pending`);
  }

  adminPosting(id: number) {
    return this.http.get<Posting>(`${this.api}/admin/postings/${id}`);
  }

  approvePosting(id: number) {
    return this.http.post<Posting>(`${this.api}/admin/postings/${id}/approve`, {});
  }

  rejectPosting(id: number, reason: string) {
    return this.http.post<Posting>(`${this.api}/admin/postings/${id}/reject`, { reason });
  }

  analytics() {
    return this.http.get<AnalyticsSummary>(`${this.api}/admin/analytics/summary`);
  }

  notifications() {
    return this.http.get<PageResponse<Notification>>(`${this.api}/notifications`);
  }

  markNotificationRead(id: number) {
    return this.http.patch<void>(`${this.api}/notifications/${id}/read`, {});
  }
}
