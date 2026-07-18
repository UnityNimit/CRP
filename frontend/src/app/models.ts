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

export interface PageResponse<T> {
  content: T[];
  pageNumber: number; 
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export type PostingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';

export interface FieldChange {
  field: string;
  previous: string | null;
  current: string | null;
}

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
  revisionComment?: string;
  resubmittedAt?: string;
  revisionRequestedAt?: string;
  fieldChanges?: FieldChange[];
  companyName: string;
  companyId: number;
  approvedAt?: string;
  createdAt: string;
  applicationCount: number;
  companyTrust?: CompanyTrustScore;
}

export type TrustRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface CompanyTrustScore {
  companyId: number;
  companyName: string;
  closedPostings: number;
  closedApps: number;
  closedOffers: number;
  untouched: number;
  reviewed: number;
  blackHoleRate: number | null;
  interviewGhostRate: number | null;
  ghostRate: number | null;
  trustScore: number | null;
  riskLevel: TrustRiskLevel;
  sampleOk: boolean;
  minSampleSize: number;
  summary: string;
}

export interface Application {
  id: number;
  postingId: number;
  postingTitle: string;
  companyName: string;
  studentName: string;
  studentEmail: string;
  studentCgpa: number;
  studentBranch: string;
  resumeLink: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface BulkStatusResponse {
  updated: number;
  failed: { id: number; reason: string }[];
}

export interface AnalyticsSummary {
  placementRate: number;
  totalStudents: number;
  placedStudents: number;
  pendingPostings: number;
  openPostings: number;
  closedPostings: number;
  totalApplications: number;
  applicationsPerCompany: { companyName: string; count: number }[];
  postingsByStatus: Record<string, number>;
  ghostLeaderboard?: CompanyTrustScore[];
}

export interface CompanyAnalyticsSummary {
  totalJobs: number;
  totalApplications: number;
  pendingReview: number;
  shortlisted: number;
  selected: number;
  rejected: number;
}

export interface EligibilityTip {
  eligible: boolean; // STRICT BOOLEAN MATH
  checks: string[];
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

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}