Here is the exact blueprint for a top-tier, engineering-focused README. It is stripped of all fluff, uses native GitHub rendering tools for the architecture diagram, and follows a strict, stoic, professional tone.

### How to upload your Video Demo directly to GitHub:
GitHub has a built-in CDN for video hosting. You do not need YouTube.
1. Record your demo video as an `.mp4`.
2. Go to your repository on GitHub.com and edit the `README.md` file in the browser.
3. Simply drag and drop your `.mp4` file directly into the GitHub web text editor.
4. GitHub will upload it and automatically generate a raw URL that looks like `https://github.com/user-attachments/assets/xyz...`.
5. Take that URL and replace the `YOUR_GITHUB_VIDEO_URL_HERE` placeholder in the code below.

***

Copy the following text exactly as it is and paste it into your `README.md` file.

```markdown
# Campus Recruitment Platform (CRP)

An enterprise-grade campus placement architecture designed for university Training and Placement Offices. Built for scale, mathematical precision, and zero-tolerance eligibility enforcement.

## Video Demonstration

<video src="YOUR_GITHUB_VIDEO_URL_HERE" controls="controls" muted="muted" style="max-width: 100%;"></video>

## System Architecture

The platform utilizes a modern, decoupled architecture. The frontend is a strictly typed Single Page Application that communicates with a stateless Spring Boot API, backed by a distributed TiDB SQL database.

```mermaid
graph TD
    Client[Angular 17 SPA] -->|REST / JWT| API[Spring Boot 3.4 API]
    
    subgraph Backend Services
        API --> Auth[Spring Security / JWT]
        API --> Engine[Strict Math Eligibility Engine]
        API --> Batch[CSV Bulk Upload Service]
        API --> Cron[Scheduled Job Expiry]
    end
    
    Backend Services -->|Hibernate / JPA| DB[(TiDB Distributed SQL)]
```

## Core Engineering Philosophy

This system was built to solve the real-world operational bottlenecks of university placements. 

*   **Strict Mathematical Eligibility:** Application logic does not rely on subjective scoring. The engine uses strict boolean validation against CGPA, academic branch, graduation year, and active backlogs. A single failure point physically prevents database insertion.
*   **Anti-Hoarding Protocol:** The system enforces a "One Student, One Job" policy. Once a candidate's status transitions to Selected, the system mathematically locks their profile from applying to subsequent postings.
*   **Closed-Loop Authentication:** Students cannot register. Administrative accounts bulk-provision student credentials via CSV processing directly from university academic records to prevent data tampering.
*   **Recruiter Verification:** External company accounts are quarantined upon creation. They require manual cryptographic approval by a super-admin before write access to the job posting table is granted.

## Technology Stack

**Backend**
*   Java 21
*   Spring Boot 3.4
*   Spring Security 6 (Stateless JWT Authentication)
*   Hibernate ORM / Spring Data JPA
*   Jackson (Data binding and JSON parsing)

**Frontend**
*   Angular 17+ (Standalone Component Architecture)
*   RxJS (Reactive state management)
*   Chart.js / ng2-charts (Data visualization)
*   Pure SCSS (Custom design system, zero external UI bloat)

**Infrastructure**
*   Database: TiDB Serverless
*   Hosting: Render (Web Services & Static Sites)

## Local Development Setup

### Prerequisites
*   JDK 21
*   Node.js v18+
*   Maven

### Backend Setup
1. Navigate to the `backend` directory.
2. Configure your environment variables or `application.yml` with the following keys:
    *   `DB_URL`
    *   `DB_USERNAME`
    *   `DB_PASSWORD`
    *   `JWT_SECRET`
    *   `JWT_EXPIRATION_MS` (Defaults to 86400000 if omitted)
    *   `APP_CORS_ALLOWED_ORIGINS` (Set to `*` for local testing)
3. Execute the Spring Boot application:
```bash
./mvnw spring-boot:run
```
The server will initialize on port 8080. A database seeder will automatically inject super-admin accounts on the initial run.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
```bash
npm install
```
3. Start the Angular development server:
```bash
npm run start
```
The application will bind to `localhost:4200` and automatically proxy API requests to port 8080.

```