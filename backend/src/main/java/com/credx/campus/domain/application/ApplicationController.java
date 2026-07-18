package com.credx.campus.domain.application;

import com.credx.campus.domain.application.Application.ApplicationStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1")
public class ApplicationController {

    private final ApplicationService applicationService;
    public ApplicationController(ApplicationService applicationService) { this.applicationService = applicationService; }

    @PostMapping("/student/applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ApplicationResponse apply(@Valid @RequestBody ApplyRequest request) { return applicationService.apply(request); }

    @GetMapping("/student/applications")
    @PreAuthorize("hasRole('STUDENT')")
    public Page<ApplicationResponse> studentApplications(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return applicationService.listStudentApplications(page, size);
    }

    @GetMapping("/company/postings/{postingId}/applications")
    @PreAuthorize("hasRole('COMPANY')")
    public Page<ApplicationResponse> companyApplications(@PathVariable Long postingId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return applicationService.listPostingApplications(postingId, page, size);
    }

    @PatchMapping("/company/applications/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ApplicationResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateApplicationStatusRequest request) {
        return applicationService.updateStatus(id, request.status());
    }

    public record ApplyRequest(@NotNull Long postingId, @NotNull String resumeLink) {}
    public record UpdateApplicationStatusRequest(@NotNull ApplicationStatus status) {}
    public record ApplicationResponse(Long id, Long postingId, String postingTitle, String companyName, String studentName, String studentBranch, String resumeLink, ApplicationStatus status, Instant createdAt) {}
}