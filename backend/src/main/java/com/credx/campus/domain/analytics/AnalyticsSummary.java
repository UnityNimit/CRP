package com.credx.campus.domain.analytics;

import java.util.List;
import java.util.Map;

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
