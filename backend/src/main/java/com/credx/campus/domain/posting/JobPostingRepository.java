package com.credx.campus.domain.posting;

import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    Page<JobPosting> findByCompanyId(Long companyId, Pageable pageable);
    
    // NEW: For Company Analytics Dashboard
    long countByCompanyId(Long companyId);

    long countByCompanyIdAndStatus(Long companyId, PostingStatus status);

    Page<JobPosting> findByStatus(PostingStatus status, Pageable pageable);

    /** Admin directory: never expose in-progress company drafts. */
    Page<JobPosting> findByStatusNot(PostingStatus status, Pageable pageable);

    @Query("SELECT p FROM JobPosting p WHERE p.status = 'APPROVED' AND p.deadline >= :today")
    Page<JobPosting> findStudentVisible(@Param("today") LocalDate today, Pageable pageable);

    @Query("SELECT p FROM JobPosting p WHERE p.id = :id AND p.status = 'APPROVED' AND p.deadline >= :today")
    Optional<JobPosting> findStudentVisibleById(@Param("id") Long id, @Param("today") LocalDate today);

    long countByStatus(PostingStatus status);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE JobPosting p SET p.status = :closedStatus WHERE p.status = :approvedStatus AND p.deadline < :today")
    int closeExpiredPostings(@Param("today") LocalDate today,
                             @Param("closedStatus") PostingStatus closedStatus,
                             @Param("approvedStatus") PostingStatus approvedStatus);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE job_postings SET status = 'PENDING_REVIEW' WHERE status = 'PENDING'", nativeQuery = true)
    int migratePendingToPendingReview();
}