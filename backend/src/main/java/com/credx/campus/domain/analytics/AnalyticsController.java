package com.credx.campus.domain.analytics;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public AnalyticsSummary summary() {
        return analyticsService.getSummary();
    }

    // Nested Record: No need for a separate file!
    public record AnalyticsSummary(
        double placementRate,
        long totalStudents,
        long placedStudents,
        long pendingPostings,
        long openPostings,
        long closedPostings,
        long totalApplications,
        List<CompanyApplicationCount> applicationsPerCompany,
        Map<String, Long> postingsByStatus
    ) {
        public record CompanyApplicationCount(String companyName, long count) {}
    }
}