package com.credx.campus.domain.posting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectPostingRequest(
    @NotBlank @Size(min = 5, max = 500) String reason
) {}
