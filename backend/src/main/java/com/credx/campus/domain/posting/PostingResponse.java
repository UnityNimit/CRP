package com.credx.campus.domain.posting;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record PostingResponse(
    Long id,
    String title,
    String description,
    BigDecimal minCgpa,
    List<String> allowedBranches,
    Integer gradYear,
    LocalDate deadline,
    PostingStatus status,
    String rejectionReason,
    String companyName,
    Long companyId,
    Instant approvedAt,
    Instant createdAt,
    long applicationCount
) {}
