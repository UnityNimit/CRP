package com.credx.campus.config;

import com.credx.campus.domain.posting.JobPostingRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PostingStatusMigration {

    private final JobPostingRepository postingRepository;
    private final JdbcTemplate jdbcTemplate;

    public PostingStatusMigration(JobPostingRepository postingRepository, JdbcTemplate jdbcTemplate) {
        this.postingRepository = postingRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateLegacyStatuses() {
        widenStatusColumn();
        int updated = postingRepository.migratePendingToPendingReview();
        if (updated > 0) {
            System.out.println("Migrated " + updated + " postings from PENDING to PENDING_REVIEW");
        }
    }

    private void widenStatusColumn() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE job_postings MODIFY COLUMN status VARCHAR(32) NOT NULL");
            System.out.println("Widened job_postings.status column to VARCHAR(32)");
        } catch (Exception e) {
            // Column may already be VARCHAR; safe to ignore on repeat deploys
            System.out.println("Status column migration skipped: " + e.getMessage());
        }
    }
}
