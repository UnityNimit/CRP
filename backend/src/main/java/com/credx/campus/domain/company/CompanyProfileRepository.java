package com.credx.campus.domain.company;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
    Optional<CompanyProfile> findByUserId(Long userId);
    
    // NEW: Fetch all companies waiting for approval
    Page<CompanyProfile> findByApprovedFalse(Pageable pageable);
}