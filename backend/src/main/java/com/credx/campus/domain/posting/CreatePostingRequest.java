package com.credx.campus.domain.posting;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreatePostingRequest(
    @NotBlank String title,
    @NotBlank String description,
    @DecimalMin("0.0") @DecimalMax("10.0") BigDecimal minCgpa,
    @NotEmpty List<String> allowedBranches,
    @NotNull @Min(2020) Integer gradYear,
    @NotNull @FutureOrPresent LocalDate deadline
) {}
