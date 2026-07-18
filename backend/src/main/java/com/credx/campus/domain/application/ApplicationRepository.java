package com.credx.campus.domain.application;

import com.credx.campus.domain.application.Application.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByPostingIdAndStudentId(Long postingId, Long studentId);

    // NEW: The Placed = Blocked rule checker
    boolean existsByStudentIdAndStatus(Long studentId, ApplicationStatus status);

    Page<Application> findByStudentId(Long studentId, Pageable pageable);
    Page<Application> findByPostingId(Long postingId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.posting.company.id = :companyId")
    long countByCompanyId(@Param("companyId") Long companyId);

    // NEW: For Company Analytics Funnel
    @Query("SELECT COUNT(a) FROM Application a WHERE a.posting.company.id = :companyId AND a.status = :status")
    long countByCompanyIdAndStatus(@Param("companyId") Long companyId, @Param("status") ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.posting.company.id = :companyId AND a.posting.status = 'CLOSED'")
    long countClosedPostingAppsByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.posting.company.id = :companyId AND a.posting.status = 'CLOSED' AND a.status = :status")
    long countClosedPostingAppsByCompanyIdAndStatus(@Param("companyId") Long companyId, @Param("status") ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.posting.company.id = :companyId AND a.posting.status = 'CLOSED' AND a.status IN ('SHORTLISTED', 'SELECTED', 'REJECTED')")
    long countReviewedOnClosedPostings(@Param("companyId") Long companyId);

    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Application a WHERE a.status = 'SELECTED'")
    long countDistinctSelectedStudents();

    @Query("SELECT a.posting.company.name, COUNT(a) FROM Application a GROUP BY a.posting.company.name ORDER BY COUNT(a) DESC")
    List<Object[]> countApplicationsPerCompany();

    long countByStatus(ApplicationStatus status);
}