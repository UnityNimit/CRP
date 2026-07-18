package com.credx.campus.domain.analytics;

import com.credx.campus.domain.analytics.AnalyticsService;
import com.credx.campus.domain.analytics.CompanyTrustScore;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/admin/companies/{id}/trust-score")
    @PreAuthorize("hasRole('ADMIN')")
    public CompanyTrustScore companyTrustScore(@PathVariable Long id) {
        return analyticsService.getCompanyTrustScore(id);
    }

    @GetMapping("/company/analytics/summary")
    @PreAuthorize("hasRole('COMPANY')")
    public AnalyticsService.CompanyAnalyticsSummary companySummary() {
        return analyticsService.getCompanySummary();
    }
}