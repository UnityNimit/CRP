package com.credx.campus.config;

import com.credx.campus.domain.posting.PostingService;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    private final PostingService postingService;

    public SchedulerConfig(PostingService postingService) {
        this.postingService = postingService;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void closeExpiredPostings() {
        postingService.closeExpiredPostings();
    }
}
