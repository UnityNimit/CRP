package com.credx.campus.domain.application;

import java.time.Instant;

public record ApplicationResponse(
    Long id,
    Long postingId,
    String postingTitle,
    String companyName,
    String studentName,
    String studentBranch,
    String coverNote,
    ApplicationStatus status,
    Instant createdAt
) {}
