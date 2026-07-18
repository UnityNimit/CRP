package com.credx.campus.domain.posting;

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

    public JobPostingController(PostingService postingService) { this.postingService = postingService; }

    @GetMapping("/{id}")
    public PostingResponse getPosting(@PathVariable Long id) { return postingService.getPostingById(id); }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public Page<PostingResponse> getApprovedPostings(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return postingService.listStudentVisible(page, size);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<PostingResponse> getAllPostingsForAdmin(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return postingService.listPending(page, size);
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    public Page<PostingResponse> getCompanyPostings(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return postingService.listCompanyPostings(page, size);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public PostingResponse createPosting(@RequestBody CreatePostingRequest request) { return postingService.create(request); }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('COMPANY')")
    public PostingResponse closePosting(@PathVariable Long id) { return postingService.closePosting(id); }

    @GetMapping("/{id}/eligibility")
    @PreAuthorize("hasRole('STUDENT')")
    public EligibilityResponse checkEligibility(@PathVariable Long id) { return postingService.checkEligibility(id); }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public PostingResponse updatePostingStatus(@PathVariable Long id, @RequestParam PostingStatus status, @RequestParam(required = false) String remarks) {
        if (status == PostingStatus.APPROVED) return postingService.approve(id);
        else if (status == PostingStatus.REJECTED) return postingService.reject(id, remarks);
        throw new com.credx.campus.common.ApiException(400, "Invalid status");
    }

    public record CreatePostingRequest(String title, String description, BigDecimal minCgpa, List<String> allowedBranches, Integer gradYear, LocalDate deadline) {}
    public record EligibilityResponse(boolean eligible, List<String> checks) {}
    public record PostingResponse(Long id, String title, String description, BigDecimal minCgpa, List<String> allowedBranches, Integer gradYear, LocalDate deadline, PostingStatus status, String rejectionReason, String companyName, Long companyId, Instant approvedAt, Instant createdAt, long applicationCount) {}
}