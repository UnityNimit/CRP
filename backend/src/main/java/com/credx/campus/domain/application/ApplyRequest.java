package com.credx.campus.domain.application;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplyRequest(
    @NotNull Long postingId,
    @Size(max = 1000) String coverNote
) {}
