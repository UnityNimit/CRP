package com.credx.campus.domain.posting;

import com.credx.campus.domain.company.CompanyProfile;
import com.credx.campus.domain.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "job_postings", indexes = {
    @Index(name = "idx_posting_status_deadline", columnList = "status, deadline"),
    @Index(name = "idx_posting_company", columnList = "company_id")
})
public class JobPosting {

    public enum PostingStatus {
        DRAFT,
        PENDING_REVIEW,
        NEEDS_REVISION,
        APPROVED,
        REJECTED,
        CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyProfile company;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "min_cgpa", precision = 4, scale = 2)
    private BigDecimal minCgpa;

    @Column(name = "allowed_branches", columnDefinition = "TEXT")
    private String allowedBranches;

    @Column(name = "grad_year")
    private Integer gradYear;

    @Column(nullable = false)
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PostingStatus status = PostingStatus.DRAFT;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "revision_comment", columnDefinition = "TEXT")
    private String revisionComment;

    @Column(name = "snapshot_before_revision", columnDefinition = "TEXT")
    private String snapshotBeforeRevision;

    @Column(name = "resubmitted_at")
    private Instant resubmittedAt;

    @Column(name = "revision_requested_at")
    private Instant revisionRequestedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revision_requested_by")
    private User revisionRequestedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CompanyProfile getCompany() { return company; }
    public void setCompany(CompanyProfile company) { this.company = company; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getMinCgpa() { return minCgpa; }
    public void setMinCgpa(BigDecimal minCgpa) { this.minCgpa = minCgpa; }
    public String getAllowedBranches() { return allowedBranches; }
    public void setAllowedBranches(String allowedBranches) { this.allowedBranches = allowedBranches; }
    public Integer getGradYear() { return gradYear; }
    public void setGradYear(Integer gradYear) { this.gradYear = gradYear; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public PostingStatus getStatus() { return status; }
    public void setStatus(PostingStatus status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getRevisionComment() { return revisionComment; }
    public void setRevisionComment(String revisionComment) { this.revisionComment = revisionComment; }
    public String getSnapshotBeforeRevision() { return snapshotBeforeRevision; }
    public void setSnapshotBeforeRevision(String snapshotBeforeRevision) { this.snapshotBeforeRevision = snapshotBeforeRevision; }
    public Instant getResubmittedAt() { return resubmittedAt; }
    public void setResubmittedAt(Instant resubmittedAt) { this.resubmittedAt = resubmittedAt; }
    public Instant getRevisionRequestedAt() { return revisionRequestedAt; }
    public void setRevisionRequestedAt(Instant revisionRequestedAt) { this.revisionRequestedAt = revisionRequestedAt; }
    public User getRevisionRequestedBy() { return revisionRequestedBy; }
    public void setRevisionRequestedBy(User revisionRequestedBy) { this.revisionRequestedBy = revisionRequestedBy; }
    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
    public User getApprovedBy() { return approvedBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isStudentVisible() {
        return status == PostingStatus.APPROVED && !deadline.isBefore(LocalDate.now());
    }
}
