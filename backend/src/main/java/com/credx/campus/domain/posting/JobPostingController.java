package com.credx.campus.domain.posting;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/postings")
public class JobPostingController {

    private final PostingService postingService;

    public JobPostingController(PostingService postingService) {
        this.postingService = postingService;
    }

    // 1. Students & Admins view approved postings
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public List<PostingResponse> getApprovedPostings() {
        return postingService.getApprovedPostings();
    }

    // 2. Admin views ALL postings (pending, approved, rejected) to manage them
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PostingResponse> getAllPostingsForAdmin() {
        return postingService.getAllPostings();
    }

    // 3. Company views their own postings
    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    public List<PostingResponse> getCompanyPostings() {
        return postingService.getCompanyPostings();
    }

    // 4. Company creates a new posting (Starts as PENDING)
    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public PostingResponse createPosting(@RequestBody CreatePostingRequest request) {
        return postingService.createPosting(request);
    }

    // 5. Admin approves or rejects a posting
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public PostingResponse updatePostingStatus(
            @PathVariable Long id, 
            @RequestParam PostingStatus status,
            @RequestParam(required = false) String remarks) {
        return postingService.updateStatus(id, status, remarks);
    }
}