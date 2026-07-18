package com.credx.campus.domain.posting;

import com.credx.campus.domain.analytics.CompanyTrustScore;
import com.credx.campus.domain.posting.JobPosting.PostingStatus;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/postings")
public class JobPostingController {

    private final PostingService postingService;

    public JobPostingController(PostingService postingService) {
        this.postingService = postingService;
    }

    @GetMapping("/{id}")
    public PostingResponse getPosting(@PathVariable Long id) {
        return postingService.getPostingById(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public Page<PostingResponse> getApprovedPostings(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return postingService.listStudentVisible(page, size);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<PostingResponse> getAllPostingsForAdmin(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return postingService.listPending(page, size);
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    public Page<PostingResponse> getCompanyPostings(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return postingService.listCompanyPostings(page, size);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public PostingResponse createPosting(@RequestBody CreatePostingRequest request) {
        return postingService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public PostingResponse updatePosting(@PathVariable Long id, @RequestBody UpdatePostingRequest request) {
        return postingService.update(id, request);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('COMPANY')")
    public PostingResponse submitPosting(@PathVariable Long id) {
        return postingService.submit(id);
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('COMPANY')")
    public PostingResponse closePosting(@PathVariable Long id) {
        return postingService.closePosting(id);
    }

    @GetMapping("/{id}/eligibility")
    @PreAuthorize("hasRole('STUDENT')")
    public EligibilityResponse checkEligibility(@PathVariable Long id) {
        return postingService.checkEligibility(id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public PostingResponse approvePosting(@PathVariable Long id) {
        return postingService.approve(id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public PostingResponse rejectPosting(@PathVariable Long id, @RequestBody RejectRequest request) {
        return postingService.reject(id, request.reason());
    }

    @PostMapping("/{id}/request-revision")
    @PreAuthorize("hasRole('ADMIN')")
    public PostingResponse requestRevision(@PathVariable Long id, @RequestBody RequestRevisionRequest request) {
        return postingService.requestRevision(id, request.comment());
    }

    public record CreatePostingRequest(
        String title,
        String description,
        BigDecimal minCgpa,
        List<String> allowedBranches,
        Integer gradYear,
        LocalDate deadline,
        Boolean submit
    ) {}

    public record UpdatePostingRequest(
        String title,
        String description,
        BigDecimal minCgpa,
        List<String> allowedBranches,
        Integer gradYear,
        LocalDate deadline
    ) {}

    public record RejectRequest(String reason) {}

    public record RequestRevisionRequest(String comment) {}

    public record FieldChange(String field, String previous, String current) {}

    public record EligibilityResponse(boolean eligible, List<String> checks) {}

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
        String revisionComment,
        Instant resubmittedAt,
        Instant revisionRequestedAt,
        List<FieldChange> fieldChanges,
        String companyName,
        Long companyId,
        Instant approvedAt,
        Instant createdAt,
        long applicationCount,
        CompanyTrustScore companyTrust
    ) {}
}
