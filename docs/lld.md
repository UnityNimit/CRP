# Campus Recruiting Portal — Low-Level Design

## 1. Backend packages

```
com.credx.campus
  config/          Security, JWT, CORS, Scheduler
  security/        JwtService, JwtAuthFilter
  domain/
    user/          User, Role
    company/       CompanyProfile
    student/       StudentProfile
    posting/       JobPosting, PostingStatus
    application/   Application, ApplicationStatus
    notification/  Notification
    analytics/     AnalyticsService
  common/          Exceptions, handlers
  seed/            DataSeeder
```

## 2. Entities

- **users** — id, email, password_hash, role, display_name
- **company_profiles** — user_id, name, description
- **student_profiles** — user_id, branch, cgpa, grad_year
- **job_postings** — company_id, title, description, min_cgpa, allowed_branches (JSON), grad_year, deadline, status, rejection_reason, approved_at, approved_by
- **applications** — posting_id, student_id, cover_note, status (UNIQUE posting_id+student_id)
- **notifications** — user_id, message, read, created_at

## 3. API base: `/api/v1`

| Method | Path | Role |
|--------|------|------|
| POST | /auth/login | public |
| GET | /me | auth |
| POST | /company/postings | COMPANY |
| GET | /company/postings | COMPANY |
| GET | /company/postings/{id}/applications | COMPANY |
| PATCH | /company/applications/{id}/status | COMPANY |
| GET | /student/postings | STUDENT |
| GET | /student/postings/{id} | STUDENT |
| POST | /student/applications | STUDENT |
| GET | /student/applications | STUDENT |
| GET | /admin/postings/pending | ADMIN |
| POST | /admin/postings/{id}/approve | ADMIN |
| POST | /admin/postings/{id}/reject | ADMIN |
| GET | /admin/analytics/summary | ADMIN |
| GET | /notifications | auth |
| PATCH | /notifications/{id}/read | auth |

## 4. Student visibility query

```sql
status = 'APPROVED' AND deadline >= CURRENT_DATE
```

## 5. Security

- BCrypt passwords
- JWT HS256, claims: sub (userId), role, 8h expiry
- @PreAuthorize on controllers

## 6. TiDB connection

```properties
jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslMode=VERIFY_IDENTITY&useSSL=true
```

Database: `campus_portal` (never `sys`).
