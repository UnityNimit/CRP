export interface LoginResponse {
  token: string;
  role: 'COMPANY' | 'STUDENT' | 'ADMIN';
  displayName: string;
  userId: number;
}

export interface MeResponse {
  id: number;
  email: string;
  role: 'COMPANY' | 'STUDENT' | 'ADMIN';
  displayName: string;
  profileName: string | null;
}

// FIX: Aligned perfectly with Spring Boot's PageResponse.java
export interface PageResponse<T> {
  content: T[];
  pageNumber: number; 
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export type PostingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';

export interface Posting {
  id: number;
  title: string;
  description: string;
  minCgpa: number;
  allowedBranches: string[];
  gradYear: number;
  deadline: string;
  status: PostingStatus;
  rejectionReason?: string;
  companyName: string;
  companyId: number;
  approvedAt?: string;
  createdAt: string;
  applicationCount: number;
}

export interface Application {
  id: number;
  postingId: number;
  postingTitle: string;
  companyName: string;
  studentName: string;
  studentBranch: string;
  coverNote: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface AnalyticsSummary {
  placementRate: number;
  totalStudents: number;
  placedStudents: number;
  totalCompanies: number;
  approvedCompanies: number;
  pendingCompanies: number;
  companyApprovalRate: number;
  pendingPostings: number;
  openPostings: number;
  closedPostings: number;
  totalApplications: number;
  applicationsPerCompany: { companyName: string; count: number }[];
  postingsByStatus: Record<string, number>;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface EligibilityTip {
  fitScore: number;
  summary: string;
  reasons: string[];
}
export interface PendingCompany {
  id: number;
  name: string;
  hrName: string;
  email: string;
  website: string;
}

export interface StudentUploadResult {
  email: string;
  status: string;
  generatedPassword: string;
}