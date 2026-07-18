package com.credx.campus.domain.analytics;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin/analytics/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public AnalyticsService.AnalyticsSummary adminSummary() {
        return analyticsService.getAdminSummary();
    }

    @GetMapping("/company/analytics/summary")
    @PreAuthorize("hasRole('COMPANY')")
    public AnalyticsService.CompanyAnalyticsSummary companySummary() {
        return analyticsService.getCompanySummary();
    }
}