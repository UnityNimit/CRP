package com.credx.campus.domain.application;

import com.credx.campus.common.PageResponse;
import com.credx.campus.security.AuthHelper;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final AuthHelper authHelper;

    public ApplicationController(ApplicationService applicationService, AuthHelper authHelper) {
        this.applicationService = applicationService;
        this.authHelper = authHelper;
    }

    @PostMapping("/student/applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ApplicationResponse apply(@Valid @RequestBody ApplyRequest request) {
        return applicationService.apply(authHelper.currentUser(), request);
    }

    @GetMapping("/student/applications")
    @PreAuthorize("hasRole('STUDENT')")
    public PageResponse<ApplicationResponse> studentApplications(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return applicationService.listStudentApplications(authHelper.currentUser().getId(), page, size);
    }

    @GetMapping("/company/postings/{postingId}/applications")
    @PreAuthorize("hasRole('COMPANY')")
    public PageResponse<ApplicationResponse> companyApplications(
        @PathVariable Long postingId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return applicationService.listPostingApplications(authHelper.currentUser().getId(), postingId, page, size);
    }

    @PatchMapping("/company/applications/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ApplicationResponse updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        return applicationService.updateStatus(authHelper.currentUser().getId(), id, request.status());
    }
}
