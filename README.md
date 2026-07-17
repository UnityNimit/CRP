# Campus Placement Portal

University placement cell portal for CREDX Hackathon (Problem Statement 2).

## Stack

- **Frontend:** Angular 19, Chart.js
- **Backend:** Spring Boot 3, JWT, JPA
- **Database:** TiDB Cloud (MySQL protocol)

## Quick start (local)

### 1. Configure database

Copy `.env.example` to `.env` and set TiDB credentials. Create database `campus_portal` in TiDB Cloud.

### 2. Backend

```bash
cd backend
# Requires Maven 3.9+ and Java 21
mvn spring-boot:run
```

API runs at `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:4200` (proxies `/api` to backend).

### 4. Docker

```bash
docker compose up --build
```

Web: `http://localhost` · API: `http://localhost:8080`

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | password123 |
| Company | hr@techcorp.com | password123 |
| Student | alice@student.edu | password123 |

## Judge demo script

1. **Company** (`hr@techcorp.com`) → create posting → status **Awaiting approval**
2. **Student** (`alice@student.edu`) → confirm posting **not visible**
3. **Admin** (`admin@campus.edu`) → approve posting
4. **Student** → posting visible → apply
5. **Company** → mark application **Selected**
6. **Admin** → Analytics → apps/company chart + placement rate updated

## Core invariant

Students can only list/view/apply when `status = APPROVED` and deadline has not passed. Enforced server-side in repository queries and apply service.

## Analytics

- **Applications per company:** count of applications grouped by company
- **Placement rate:** `(students with ≥1 SELECTED application) / (total students) × 100`

## Documentation

- [HLD](docs/hld.md)
- [LLD](docs/lld.md)
- [Design system](docs/design-system.md)

## API base

`/api/v1` — see [docs/lld.md](docs/lld.md) for full contract.
