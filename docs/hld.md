# Campus Recruiting Portal — High-Level Design

## 1. Purpose

University placement cell portal where companies post roles, placement admins approve/reject postings before go-live, students apply to approved postings, and admins view recruiting analytics.

## 2. Actors

| Actor | Responsibilities |
|-------|------------------|
| Company | Create postings (PENDING), view applicants, update application status |
| Student | Browse approved open jobs, apply, track applications |
| Placement Admin | Approve/reject postings, view analytics |

## 3. Core invariant

A posting is **invisible and un-applicable** to students until status is `APPROVED`, and remains eligible only while not `CLOSED` and before deadline. Enforced at service/query layer.

## 4. System context

```
Browser (Angular SPA) → Spring Boot REST API → TiDB Cloud (MySQL)
                              ↑
                    Deadline scheduler (@Scheduled)
```

## 5. Layers

- **Presentation:** Angular SPA with role modules and design system
- **Application:** Spring Boot REST, JWT auth, domain services
- **Data:** TiDB Cloud, database `campus_portal`

## 6. Posting lifecycle

`PENDING → APPROVED | REJECTED → CLOSED`

## 7. Analytics

- **Applications per company:** COUNT(applications) grouped by company
- **Placement rate:** students with ≥1 SELECTED application / total students

## 8. Deployment

Docker Compose: Nginx (Angular static) + Spring Boot API. TiDB Cloud is remote.

## 9. Non-goals

Multi-university tenancy, real SMTP, native mobile, full ATS.
