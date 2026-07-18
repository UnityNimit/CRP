package com.credx.campus.domain.application;

import com.credx.campus.domain.posting.JobPosting;
import com.credx.campus.domain.student.StudentProfile;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(name = "uk_posting_student", columnNames = {"posting_id", "student_id"})
}, indexes = {
    @Index(name = "idx_app_student", columnList = "student_id"),
    @Index(name = "idx_app_status", columnList = "status")
})
public class Application {

    public enum ApplicationStatus { APPLIED, SHORTLISTED, SELECTED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posting_id", nullable = false)
    private JobPosting posting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    // REAL-WORLD FIX: Cover Note -> Resume Link
    @Column(name = "resume_link", columnDefinition = "TEXT")
    private String resumeLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobPosting getPosting() { return posting; }
    public void setPosting(JobPosting posting) { this.posting = posting; }
    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}