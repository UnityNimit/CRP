package com.credx.campus.domain.analytics;

public record CompanyTrustScore(
    Long companyId,
    String companyName,
    long closedPostings,
    long closedApps,
    long closedOffers,
    long untouched,
    long reviewed,
    Double blackHoleRate,
    Double interviewGhostRate,
    Double ghostRate,
    Integer trustScore,
    String riskLevel,
    boolean sampleOk,
    int minSampleSize,
    String summary
) {}
